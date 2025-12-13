import { NoiDung, NoiDungChiTiet, NguoiDung } from '../models/index.js';
import {
    AppError,
    ValidationError,
    NotFoundError,
    ConflictError,
    DatabaseError
} from '../utils/errors.js';
import { Op } from 'sequelize';
import dbConfig from '../config/db.js';
import { deleteFiles } from '../utils/cloudinaryUtils.js';

const { sequelize } = dbConfig;

class ContentRepository {

    // Create content with files in transaction
    async createContentWithFiles(contentData, fileDetails = []) {
        const transaction = await sequelize.transaction();

        try {
            console.log('[ContentRepository] createContentWithFiles started, fileDetails count:', fileDetails.length);
            
            // Create content
            const content = await NoiDung.create(contentData, { transaction });
            console.log('[ContentRepository] Content created with ID:', content.id);

            // Create file details if provided
            if (fileDetails.length > 0) {
                console.log('[ContentRepository] Creating file details...');
                const fileData = fileDetails.map(file => ({
                    ...file,
                    idNoiDung: content.id // Set contentId for each file
                }));
                await NoiDungChiTiet.bulkCreate(fileData, { transaction });
                console.log('[ContentRepository] File details created, count:', fileDetails.length);
            }

            await transaction.commit();
            console.log('[ContentRepository] Transaction committed');

            // Return content with files
            return await this.findByIdWithFiles(content.id);
        } catch (error) {
            await transaction.rollback();
            console.log('[ContentRepository] Transaction rolled back');
            
            console.error('=== ERROR in createContentWithFiles ===');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            if (error.errors) {
                console.error('Validation errors:', error.errors);
            }
            console.error('Full error:', error);
            
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

            // Update content - auto update ngayTao if it's a submission (baiNop)
            const finalUpdateData = { ...updateData };
            
            // Auto update ngayTao for submissions when updating
            const currentContent = await NoiDung.findByPk(contentId, { transaction });
            if (currentContent && currentContent.loaiNoiDung === 'baiNop') {
                finalUpdateData.ngayTao = new Date();
            }
            
            await NoiDung.update(finalUpdateData, {
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
                    model: NguoiDung,
                    as: 'nguoiTao',
                    required: false,
                    attributes: ['id', 'ten', 'email']
                },
                {
                    model: NoiDungChiTiet,
                    as: 'chiTiets',
                    required: false
                },
                {
                    model: NoiDung,
                    as: 'noiDungCha',
                    required: false,
                    attributes: ['id', 'tieuDe', 'noiDung', 'idNguoiDung'],
                    include: [
                        {
                            model: NguoiDung,
                            as: 'nguoiTao',
                            required: false,
                            attributes: ['id', 'ten', 'email']
                        }
                    ]
                },
                {
                    model: NoiDung,
                    as: 'noiDungCon',
                    required: false,
                    include: [
                        {
                            model: NguoiDung,
                            as: 'nguoiTao',
                            required: false,
                            attributes: ['id', 'ten', 'email']
                        },
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

    // Find comments (child contents) by parent content ID và loaiNoiDung = 'phucDap' - WITH NESTED REPLIES
    // Find direct comments/replies only (no nested)
    async findCommentsByParentId(parentContentId) {
        try {
            const comments = await NoiDung.findAll({
                where: {
                    idNoiDungCha: parentContentId,
                    loaiNoiDung: 'phucDap'
                },
                include: [
                    {
                        model: NguoiDung,
                        as: 'nguoiTao',
                        required: false,
                        attributes: ['id', 'ten', 'email']
                    },
                    {
                        model: NoiDungChiTiet,
                        as: 'chiTiets',
                        required: false,
                        attributes: [
                            'id', 'idNoiDung', 'loaiChiTiet', 'filePath',
                            'fileName', 'fileType', 'fileSize', 'ngayTao'
                        ]
                    },
                    {
                        model: NoiDung,
                        as: 'noiDungCha',
                        required: false,
                        attributes: ['id', 'tieuDe', 'noiDung', 'idNguoiDung'],
                        include: [
                            {
                                model: NguoiDung,
                                as: 'nguoiTao',
                                required: false,
                                attributes: ['id', 'ten', 'email']
                            }
                        ]
                    }
                ],
                order: [['ngayTao', 'DESC']],
                attributes: [
                    'id', 'idChuDe', 'idNguoiDung', 'idNoiDungCha', 'tieuDe',
                    'noiDung', 'loaiNoiDung', 'hanNop', 'ngayNop', 'status', 'ngayTao'
                ]
            });

            // Manually load user info for each comment
            for (let comment of comments) {
                if (comment.idNguoiDung) {
                    const user = await NguoiDung.findByPk(comment.idNguoiDung, {
                        attributes: ['id', 'ten', 'email', 'avatar']
                    });
                    comment.dataValues.nguoiTao = user;
                }
            }

            console.log('[ContentRepository] Found direct comments:', comments.length);
            return comments;
        } catch (error) {
            console.error('Database error in findCommentsByParentId:', error);
            throw new DatabaseError('Lỗi khi tìm danh sách bình luận');
        }
    }

    // Find documents (taiLieu) by parent folder ID
    async findDocumentsByParentId(parentContentId) {
        try {
            const documents = await NoiDung.findAll({
                where: {
                    idNoiDungCha: parentContentId,
                    loaiNoiDung: 'taiLieu'
                },
                include: [
                    {
                        model: NguoiDung,
                        as: 'nguoiTao',
                        required: false,
                        attributes: ['id', 'ten', 'email']
                    },
                    {
                        model: NoiDungChiTiet,
                        as: 'chiTiets',
                        required: false,
                        attributes: [
                            'id', 'idNoiDung', 'loaiChiTiet', 'filePath',
                            'fileName', 'fileType', 'fileSize', 'ngayTao'
                        ]
                    }
                ],
                order: [['ngayTao', 'DESC']],
                attributes: [
                    'id', 'idChuDe', 'idNguoiDung', 'idNoiDungCha', 'tieuDe',
                    'noiDung', 'loaiNoiDung', 'ngayTao'
                ]
            });

            console.log('[ContentRepository] Found documents:', documents.length);
            return documents;
        } catch (error) {
            console.error('Database error in findDocumentsByParentId:', error);
            throw new DatabaseError('Lỗi khi tìm danh sách tài liệu');
        }
    }

    // Find submissions (baiNop) by assignment ID and user ID
    async findSubmissionsByAssignment(assignmentId, userId) {
        try {
            const submissions = await NoiDung.findAll({
                where: {
                    idNoiDungCha: assignmentId,
                    loaiNoiDung: 'baiNop',
                    idNguoiDung: userId
                },
                include: [
                    {
                        model: NguoiDung,
                        as: 'nguoiTao',
                        required: false,
                        attributes: ['id', 'ten', 'email']
                    },
                    {
                        model: NoiDungChiTiet,
                        as: 'chiTiets',
                        required: false,
                        attributes: [
                            'id', 'idNoiDung', 'loaiChiTiet', 'filePath',
                            'fileName', 'fileType', 'fileSize', 'ngayTao'
                        ]
                    }
                ],
                order: [['ngayTao', 'DESC']],
                attributes: [
                    'id', 'idChuDe', 'idNguoiDung', 'idNoiDungCha', 'tieuDe',
                    'noiDung', 'loaiNoiDung', 'ngayTao', 'status'
                ]
            });

            console.log('[ContentRepository] Found submissions:', submissions.length);
            return submissions;
        } catch (error) {
            console.error('Database error in findSubmissionsByAssignment:', error);
            throw new DatabaseError('Lỗi khi tìm danh sách bài nộp');
        }
    }

    // Find ALL replies including nested ones (recursive)
    async findAllCommentsByParentIdRecursive(parentContentId) {
        try {
            const getAllRepliesRecursive = async (contentId) => {
                const directReplies = await NoiDung.findAll({
                    where: {
                        idNoiDungCha: contentId,
                        loaiNoiDung: 'phucDap'
                    },
                    include: [
                        {
                            model: NguoiDung,
                            as: 'nguoiTao',
                            required: false,
                            attributes: ['id', 'ten', 'email']
                        },
                        {
                            model: NoiDungChiTiet,
                            as: 'chiTiets',
                            required: false,
                            attributes: [
                                'id', 'idNoiDung', 'loaiChiTiet', 'filePath',
                                'fileName', 'fileType', 'fileSize', 'ngayTao'
                            ]
                        },
                        {
                            model: NoiDung,
                            as: 'noiDungCha',
                            required: false,
                            attributes: ['id', 'tieuDe', 'noiDung', 'idNguoiDung'],
                            include: [
                                {
                                    model: NguoiDung,
                                    as: 'nguoiTao',
                                    required: false,
                                    attributes: ['id', 'ten', 'email']
                                }
                            ]
                        }
                    ],
                    order: [['ngayTao', 'DESC']],
                    attributes: [
                        'id', 'idChuDe', 'idNguoiDung', 'idNoiDungCha', 'tieuDe',
                        'noiDung', 'loaiNoiDung', 'hanNop', 'ngayNop', 'status', 'ngayTao'
                    ]
                });

                // For each direct reply, recursively fetch its children
                let allReplies = [...directReplies];
                for (let reply of directReplies) {
                    const nestedReplies = await getAllRepliesRecursive(reply.id);
                    allReplies = allReplies.concat(nestedReplies);
                }

                return allReplies;
            };

            const allComments = await getAllRepliesRecursive(parentContentId);

            // Manually load user info for each comment
            for (let comment of allComments) {
                if (comment.idNguoiDung) {
                    const user = await NguoiDung.findByPk(comment.idNguoiDung, {
                        attributes: ['id', 'ten', 'email', 'avatar']
                    });
                    comment.dataValues.nguoiTao = user;
                }
            }

            console.log('[ContentRepository] Found total comments (including nested):', allComments.length);
            return allComments;
        } catch (error) {
            console.error('Database error in findAllCommentsByParentIdRecursive:', error);
            throw new DatabaseError('Lỗi khi tìm danh sách bình luận');
        }
    }

    // Find file by ID for download
    async findFileById(fileId) {
        try {
            const file = await NoiDungChiTiet.findByPk(fileId, {
                attributes: ['id', 'fileName', 'filePath', 'fileType', 'fileSize']
            });
            return file;
        } catch (error) {
            console.error('Error finding file by ID:', error);
            throw error;
        }
    }

    // Find last content by ID to generate next ID
    async findLastContent() {
        try {
            const content = await NoiDung.findOne({
                order: [['id', 'DESC']],
                attributes: ['id'],
                raw: true
            });
            return content;
        } catch (error) {
            console.error('Error finding last content:', error);
            return null;
        }
    }

}

export default new ContentRepository();