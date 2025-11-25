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

class TopicRepository {
    
    // Create topic with files in transaction
    async createTopicWithFiles(topicData, fileDetails = []) {
        const transaction = await sequelize.transaction();
        
        try {
            // Create topic
            const topic = await NoiDung.create(topicData, { transaction });
            
            // Create file details if provided
            if (fileDetails.length > 0) {
                await NoiDungChiTiet.bulkCreate(fileDetails, { transaction });
            }
            
            await transaction.commit();
            
            // Return topic with files
            return await this.findByIdWithFiles(topic.id);
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

    // Update topic with new files
    async updateTopicWithFiles(topicId, updateData, newFileDetails = []) {
        const transaction = await sequelize.transaction();
        
        try {
            // Update topic
            await NoiDung.update(updateData, {
                where: { id: topicId },
                transaction
            });
            
            // Add new files if provided
            if (newFileDetails.length > 0) {
                await NoiDungChiTiet.bulkCreate(newFileDetails, { transaction });
            }
            
            await transaction.commit();
            
            // Return updated topic with files
            return await this.findByIdWithFiles(topicId);
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

    // Find topic by ID with files included
    async findByIdWithFiles(topicId) {
        const topic = await NoiDung.findByPk(topicId, {
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
        
        if (!topic) {
            throw new NotFoundError('Không tìm thấy nội dung');
        }
        
        return topic;
    }

    // Find topic by ID (basic)
    async findById(topicId) {
        return await NoiDung.findByPk(topicId);
    }

    // Find topics with filters and pagination
    async findWithFilters(filters = {}, pagination = {}) {
        const {
            chudeId,
            loaiNoiDung,
            trangThai,
            nguoiTao,
            idNoiDungCha
        } = filters;

        const {
            page = 1,
            limit = 10,
            sortBy = 'ngayTao',
            sortOrder = 'DESC'
        } = pagination;

        // Build where conditions
        const whereConditions = {};

        if (chudeId) {
            whereConditions.idChuDe = chudeId;
        }

        if (loaiNoiDung) {
            whereConditions.loaiNoiDung = loaiNoiDung;
        }

        if (trangThai) {
            whereConditions.trangThai = trangThai;
        }

        if (nguoiTao) {
            whereConditions.idNguoiDung = nguoiTao;
        }

        if (idNoiDungCha !== undefined) {
            whereConditions.idNoiDungCha = idNoiDungCha;
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Query with pagination
        const result = await NoiDung.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: NoiDungChiTiet,
                    as: 'chiTiets',
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]]
        });

        return {
            topics: result.rows,
            total: result.count,
            totalPages: Math.ceil(result.count / limit),
            currentPage: parseInt(page),
            pageSize: parseInt(limit)
        };
    }

    // Search topics
    async searchTopics(searchParams) {
        const {
            q,
            loaiNoiDung,
            chudeId,
            trangThai,
            page = 1,
            limit = 10
        } = searchParams;

        const whereConditions = {};

        // Text search
        if (q) {
            whereConditions[Op.or] = [
                {
                    tieuDe: {
                        [Op.like]: `%${q}%`
                    }
                },
                {
                    noiDung: {
                        [Op.like]: `%${q}%`
                    }
                }
            ];
        }

        // Filters
        if (loaiNoiDung) {
            whereConditions.loaiNoiDung = loaiNoiDung;
        }

        if (chudeId) {
            whereConditions.idChuDe = chudeId;
        }

        if (trangThai) {
            whereConditions.trangThai = trangThai;
        }

        const offset = (page - 1) * limit;

        const result = await NoiDung.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: NoiDungChiTiet,
                    as: 'chiTiets',
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['ngayTao', 'DESC']]
        });

        return {
            results: result.rows,
            total: result.count,
            totalPages: Math.ceil(result.count / limit),
            currentPage: parseInt(page),
            query: q
        };
    }

    // Update topic
    async update(topicId, updateData) {
        const [affectedRows] = await NoiDung.update(updateData, {
            where: { id: topicId }
        });

        if (affectedRows === 0) {
            throw new NotFoundError('Không tìm thấy nội dung để cập nhật');
        }

        return await this.findByIdWithFiles(topicId);
    }

    // Delete topic (cascade delete files)
    async delete(topicId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Delete files first
            await NoiDungChiTiet.destroy({
                where: { idNoiDung: topicId },
                transaction
            });
            
            // Delete topic
            const deletedRows = await NoiDung.destroy({
                where: { id: topicId },
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

    // ID generation helpers
    async findMaxIdByPrefix(prefix) {
        const result = await NoiDung.findOne({
            where: {
                id: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['id', 'DESC']],
            raw: true
        });

        return result ? result.id : null;
    }

    async findMaxFileIdByPrefix(prefix) {
        const result = await NoiDungChiTiet.findOne({
            where: {
                id: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['id', 'DESC']],
            raw: true
        });

        return result ? result.id : null;
    }

    // Get topics by parent ID
    async findByParentId(parentId) {
        return await NoiDung.findAll({
            where: { idNoiDungCha: parentId },
            include: [
                {
                    model: NoiDungChiTiet,
                    as: 'chiTiets',
                    required: false
                }
            ],
            order: [['ngayTao', 'ASC']]
        });
    }

    // Get root topics (no parent)
    async findRootTopics(chudeId) {
        return await NoiDung.findAll({
            where: { 
                idChuDe: chudeId,
                idNoiDungCha: null 
            },
            include: [
                {
                    model: NoiDungChiTiet,
                    as: 'chiTiets',
                    required: false
                }
            ],
            order: [['ngayTao', 'DESC']]
        });
    }

    // Get topic statistics
    async getTopicStats(chudeId) {
        const stats = await NoiDung.findAll({
            where: { idChuDe: chudeId },
            attributes: [
                'loaiNoiDung',
                'trangThai',
                [sequelize.fn('COUNT', '*'), 'count']
            ],
            group: ['loaiNoiDung', 'trangThai'],
            raw: true
        });

        return stats;
    }
}

export default TopicRepository;