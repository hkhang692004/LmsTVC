import { NoiDung, NoiDungChiTiet } from '../models/index.js';
import { 
    AppError, 
    ValidationError, 
    NotFoundError, 
    ConflictError,
    DatabaseError 
} from '../utils/errors.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

class ContentRepository {
    
    // Create content with files in transaction
    async createContentWithFiles(contentData, fileDetails = []) {
        const transaction = await sequelize.transaction();
        
        try {
            // Create content
            const content = await NoiDung.create(contentData, { transaction });
            
            // Create file details if provided
            if (fileDetails.length > 0) {
                const fileData = fileDetails.map(file => ({
                    ...file,
                    idNoiDung: content.id // Set contentId for each file
                }));
                await NoiDungChiTiet.bulkCreate(fileData, { transaction });
            }
            
            await transaction.commit();
            
            // Return content with files
            return await this.findByIdWithFiles(content.id);
        } catch (error) {
            await transaction.rollback();
            // Re-throw with more context if it's a database error
            if (error.name === 'SequelizeValidationError') {
                throw new ValidationError('Dữ liệu không hợp lệ khi tạo nội dung');
            } else if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ConflictError('ID nội dung đã tồn tại');
            } else if (error.name === 'SequelizeDatabaseError') {
                throw new DatabaseError('Lỗi cơ sở dữ liệu khi tạo nội dung');
            }
            throw error;
        }
    }

    // Update content with new files
    async updateContentWithFiles(contentId, updateData, newFileDetails = [], remainFileIds = []) {
        const transaction = await sequelize.transaction();
        
        try {
            // Get files to delete from Cloudinary first (before database transaction)
            let filesToDelete = [];
            if (remainFileIds.length > 0) {
                filesToDelete = await NoiDungChiTiet.findAll({
                    where: {
                        idNoiDung: contentId,
                        id: { [Op.notIn]: remainFileIds }
                    },
                    attributes: ['id'], // id is the publicId for Cloudinary
                    raw: true
                });
            } else {
                // If no remainFileIds specified, delete all existing files
                filesToDelete = await NoiDungChiTiet.findAll({
                    where: { idNoiDung: contentId },
                    attributes: ['id'],
                    raw: true
                });
            }

            // Delete files from Cloudinary before database transaction
            if (filesToDelete.length > 0) {
                const { deleteFiles } = require('../utils/cloudinaryUtils');
                const idsToDelete = filesToDelete.map(f => f.id);
                
                try {
                    const deleteResult = await deleteFiles(idsToDelete);
                    console.log(`✅ Bulk delete result: ${deleteResult.successCount}/${deleteResult.total} files deleted`);
                    
                    if (deleteResult.failed.length > 0) {
                        console.warn('❌ Some files failed to delete from Cloudinary:', deleteResult.failed);
                    }
                } catch (error) {
                    console.error('❌ Bulk delete from Cloudinary failed:', error);
                    // Continue with database update even if Cloudinary delete fails
                }
            }

            // Update content
            await NoiDung.update(updateData, {
                where: { id: contentId },
                transaction
            });
            
            // Delete files from database
            if (filesToDelete.length > 0) {
                const idsToDelete = filesToDelete.map(f => f.id);
                await NoiDungChiTiet.destroy({
                    where: {
                        idNoiDung: contentId,
                        id: { [Op.in]: idsToDelete }
                    },
                    transaction
                });
            }
            
            // Add new files if provided
            if (newFileDetails.length > 0) {
                const fileData = newFileDetails.map(file => ({
                    ...file,
                    idNoiDung: contentId
                }));
                await NoiDungChiTiet.bulkCreate(fileData, { transaction });
            }
            
            await transaction.commit();
            
            // Return updated content with files
            return await this.findByIdWithFiles(contentId);
        } catch (error) {
            await transaction.rollback();
            // Re-throw with more context if it's a database error
            if (error.name === 'SequelizeValidationError') {
                throw new ValidationError('Dữ liệu cập nhật không hợp lệ');
            } else if (error.name === 'SequelizeDatabaseError') {
                throw new DatabaseError('Lỗi cơ sở dữ liệu khi cập nhật');
            }
            throw error;
        }
    }

    // Find content by ID with files included
    async findByIdWithFiles(contentId) {
        const content = await NoiDung.findByPk(contentId, {
            include: [
                {
                    model: NoiDungChiTiet,
                    as: 'chiTiets',
                    required: false
                },
                {
                    model: NoiDung,
                    as: 'noiDungCon',
                    required: false,
                    include: [
                        {
                            model: NoiDungChiTiet,
                            as: 'chiTiets',
                            required: false
                        }
                    ]
                }
            ]
        });
        
        if (!content) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }
        
        return content;
    }

    // Find content by ID (basic)
    async findById(contentId) {
        return await NoiDung.findByPk(contentId);
    }





    // Update content
    async update(contentId, updateData) {
        const [affectedRows] = await NoiDung.update(updateData, {
            where: { id: contentId }
        });

        if (affectedRows === 0) {
            throw new NotFoundError('Không tìm thấy nội dung để cập nhật');
        }

        return await this.findByIdWithFiles(contentId);
    }

    // Delete content (cascade delete files)
    async delete(contentId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Delete files first
            await NoiDungChiTiet.destroy({
                where: { idNoiDung: contentId },
                transaction
            });
            
            // Delete content
            const deletedRows = await NoiDung.destroy({
                where: { id: contentId },
                transaction
            });
            
            if (deletedRows === 0) {
                throw new NotFoundError('Không tìm thấy nội dung để xóa');
            }
            
            await transaction.commit();
            return { message: 'Xóa nội dung thành công' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // File operations
    async findFileById(fileId) {
        const file = await NoiDungChiTiet.findByPk(fileId);
        
        if (!file) {
            throw new NotFoundError('Không tìm thấy file');
        }
        
        return file;
    }

    async deleteFile(fileId) {
        // Kiểm tra file tồn tại trước
        const file = await NoiDungChiTiet.findByPk(fileId);
        
        if (!file) {
            throw new NotFoundError('Không tìm thấy file để xóa');
        }
        
        const deletedRows = await NoiDungChiTiet.destroy({
            where: { id: fileId }
        });

        return { message: 'Xóa file thành công', deletedFile: file };
    }

    // Find student's submission for specific assignment
    async findSubmissionByUser(assignmentId, userId) {
        try {
            const submission = await NoiDung.findOne({
                where: {
                    idNoiDungCha: assignmentId,
                    idNguoiDung: userId,
                    loaiNoiDung: 'baiNop'
                },
                include: [
                    {
                        model: NoiDungChiTiet,
                        as: 'NoiDungChiTiets',
                        required: false,
                        attributes: [
                            'id', 'idNoiDung', 'loaiChiTiet', 'filePath', 
                            'fileName', 'fileType', 'fileSize', 'ngayTao'
                        ]
                    }
                ],
                order: [['ngayTao', 'DESC']] // Latest submission if multiple
            });

            return submission;
        } catch (error) {
            console.error('Database error in findSubmissionByUser:', error);
            throw new DatabaseError('Lỗi khi tìm bài nộp của sinh viên');
        }
    }

    // Delete content với bulk Cloudinary delete  
    async deleteWithFiles(contentId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Get all files for this content first
            const files = await NoiDungChiTiet.findAll({
                where: { idNoiDung: contentId },
                attributes: ['id'],
                raw: true
            });

            // Bulk delete from Cloudinary if files exist
            if (files.length > 0) {
                const { deleteFiles } = require('../utils/cloudinaryUtils');
                const fileIds = files.map(f => f.id);
                
                try {
                    const deleteResult = await deleteFiles(fileIds);
                    console.log(`✅ Bulk deleted ${deleteResult.successCount}/${deleteResult.total} files from Cloudinary`);
                } catch (error) {
                    console.error('❌ Bulk delete from Cloudinary failed:', error);
                    // Continue with database deletion
                }
            }

            // Delete files first
            await NoiDungChiTiet.destroy({
                where: { idNoiDung: contentId },
                transaction
            });
            
            // Delete content
            const deletedRows = await NoiDung.destroy({
                where: { id: contentId },
                transaction
            });
            
            if (deletedRows === 0) {
                throw new NotFoundError('Không tìm thấy nội dung để xóa');
            }
            
            await transaction.commit();
            return { message: 'Xóa nội dung thành công' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

}

export default new ContentRepository();