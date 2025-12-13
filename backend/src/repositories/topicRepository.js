import { ChuDe, NoiDung, NoiDungChiTiet } from '../models/index.js';
import { DatabaseError } from '../utils/errors.js';
import { Op } from 'sequelize';
import db from "../config/db.js";
const { sequelize, Sequelize } = db;

class TopicRepository {

    // Find last topic to generate new ID
    async findLastTopic() {
        try {
            return await ChuDe.findOne({
                order: [['id', 'DESC']],
                attributes: ['id']
            });
        } catch (error) {
            console.error('Database error in findLastTopic:', error);
            throw new DatabaseError('Lỗi khi tìm chủ đề cuối cùng');
        }
    }

    // Find topic by ID with root level contents (idNoiDungCha = null)
    async findByIdWithContents(topicId) {
        try {
            const topic = await ChuDe.findByPk(topicId, {
                include: [
                    {
                        model: NoiDung,
                        as: 'noiDungs',
                        where: {
                            idNoiDungCha: null // Only root level contents
                        },
                        attributes: [
                            'id', 'tieuDe', 'noiDung', 'loaiNoiDung',
                            'hanNop', 'ngayNop', 'status', 'ngayTao'
                        ],
                        include: [
                            {
                                model: NoiDungChiTiet,
                                as: 'chiTiets',
                                attributes: ['id', 'loaiChiTiet', 'filePath', 'fileName', 'fileType', 'ngayTao'],
                                required: false
                            }
                        ],
                        required: false, // LEFT JOIN to show topic even without contents
                        order: [['ngayTao', 'DESC']]
                    }
                ]
            });

            if (!topic) {
                return null;
            }

            // Map to consistent format like classRepository
            return {
                id: topic.id,
                tenChuDe: topic.tenChuDe,
                moTa: topic.moTa,
                contentCount: topic.noiDungs?.length || 0,
                noiDungs: topic.noiDungs?.map(noiDung => ({
                    id: noiDung.id,
                    tieuDe: noiDung.tieuDe,
                    noiDung: noiDung.noiDung,
                    loaiNoiDung: noiDung.loaiNoiDung,
                    hanNop: noiDung.hanNop,
                    ngayNop: noiDung.ngayNop,
                    status: noiDung.status,
                    ngayTao: noiDung.ngayTao,
                    // Map chiTiets to files for consistency
                    files: noiDung.chiTiets?.map(chiTiet => ({
                        id: chiTiet.id,
                        loaiChiTiet: chiTiet.loaiChiTiet,
                        filePath: chiTiet.filePath,
                        fileName: chiTiet.fileName,
                        fileType: chiTiet.fileType,
                        ngayTao: chiTiet.ngayTao
                    })) || []
                })) || []
            };
        } catch (error) {
            console.error('Database error in findByIdWithContents:', error);
            throw new DatabaseError('Lỗi khi truy vấn chủ đề từ cơ sở dữ liệu');
        }
    }

    // Find topic by ID (basic)
    async findById(topicId) {
        try {
            return await ChuDe.findByPk(topicId);
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm chủ đề từ cơ sở dữ liệu');
        }
    }

    // Create new topic
    async create(topicData) {
        try {
            const topic = await ChuDe.create(topicData);
            return topic;
        } catch (error) {
            console.error('Database error in create:', error);
            if (error.name === 'SequelizeValidationError') {
                throw new DatabaseError('Dữ liệu không hợp lệ khi tạo chủ đề');
            } else if (error.name === 'SequelizeUniqueConstraintError') {
                throw new DatabaseError('ID chủ đề đã tồn tại');
            }
            throw new DatabaseError('Lỗi khi tạo chủ đề mới');
        }
    }

    // Update topic
    async update(topicId, updateData) {
        try {
            const [affectedRows] = await ChuDe.update(updateData, {
                where: { id: topicId }
            });

            if (affectedRows === 0) {
                throw new DatabaseError('Không tìm thấy chủ đề để cập nhật');
            }

            // Return updated topic
            return await this.findById(topicId);
        } catch (error) {
            console.error('Database error in update:', error);
            throw new DatabaseError('Lỗi khi cập nhật chủ đề');
        }
    }

    // Delete topic (cascade delete contents and files)
    async delete(topicId) {
        const transaction = await sequelize.transaction();
        
        try {
            // First, delete all files associated with contents of this topic
            await NoiDungChiTiet.destroy({
                where: {
                    idNoiDung: {
                        [Op.in]: sequelize.literal(`(
                            SELECT id FROM NoiDung WHERE idChuDe = '${topicId}'
                        )`)
                    }
                },
                transaction
            });

            // Then delete all contents of this topic
            await NoiDung.destroy({
                where: { idChuDe: topicId },
                transaction
            });

            // Finally delete the topic itself
            const deletedRows = await ChuDe.destroy({
                where: { id: topicId },
                transaction
            });

            if (deletedRows === 0) {
                throw new DatabaseError('Không tìm thấy chủ đề để xóa');
            }

            await transaction.commit();
            return { message: 'Xóa chủ đề thành công' };
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in delete:', error);
            throw new DatabaseError('Lỗi khi xóa chủ đề');
        }
    }

    // Count contents in a topic
    async countContents(topicId) {
        try {
            return await NoiDung.count({
                where: { idChuDe: topicId }
            });
        } catch (error) {
            console.error('Error counting topic contents:', error);
            throw new DatabaseError('Lỗi khi đếm nội dung');
        }
    }

    // Check if topic has any submissions or exam submissions
    async checkTopicSubmissions(topicId) {
        try {
            // Get all content IDs in this topic
            const contents = await NoiDung.findAll({
                where: { idChuDe: topicId },
                attributes: ['id', 'loaiNoiDung', 'idBaiKiemTra']
            });

            if (contents.length === 0) {
                return { hasSubmissions: false, submissionsCount: 0 };
            }

            let totalSubmissions = 0;

            // Check each content for submissions
            for (const content of contents) {
                // Check assignment submissions (baiTap type)
                if (content.loaiNoiDung === 'baiTap') {
                    const submissionsCount = await NoiDung.count({
                        where: { 
                            idNoiDungCha: content.id,
                            loaiNoiDung: 'baiNop'
                        }
                    });
                    totalSubmissions += submissionsCount;
                }

                // Check exam submissions (baiNop type with idBaiKiemTra)
                if (content.loaiNoiDung === 'baiNop' && content.idBaiKiemTra) {
                    const { BaiLam } = await import('../models/index.js');
                    const examSubmissionsCount = await BaiLam.count({
                        where: { idBaiKiemTra: content.idBaiKiemTra }
                    });
                    totalSubmissions += examSubmissionsCount;
                }
            }

            return {
                hasSubmissions: totalSubmissions > 0,
                submissionsCount: totalSubmissions
            };
        } catch (error) {
            console.error('Error checking topic submissions:', error);
            throw new DatabaseError('Lỗi khi kiểm tra bài nộp');
        }
    }
}

export default new TopicRepository();