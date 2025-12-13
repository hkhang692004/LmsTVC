import { BaiKiemTra, CauHoi, LuaChon, BaiLam, BaiLamCauHoi, LuaChonDaChon, Lop, NguoiDung } from '../models/index.js';
import { Op } from 'sequelize';
import { DatabaseError } from '../utils/errors.js';
import db from '../config/db.js';
const { sequelize } = db;

class ExamRepository {
    async findLastExam() {
        try {
            const lastExam = await BaiKiemTra.findOne({
                where: {
                    id: {
                        [Op.like]: 'BKT%'
                    }
                },
                order: [['id', 'DESC']],
                attributes: ['id']
            });
            
            return lastExam;
        } catch (error) {
            console.error('Database error in findLastExam:', error);
            throw new DatabaseError('Lỗi khi tìm bài kiểm tra cuối cùng');
        }
    }

    async findWithFilters(filters) {
        const { lopId, userRole, page = 1, limit = 20 } = filters;
        
        let whereConditions = {};
        if (lopId) whereConditions.idLop = lopId;
        
        // Role-based filtering
        if (userRole === 'sinhVien') {
            // Students only see exams for classes they're enrolled in
            // This would need additional logic to check enrollment
            whereConditions.status = { [Op.in]: ['dangMo', 'daDong'] };
        }

        const offset = (page - 1) * limit;

        try {
            const { count, rows } = await BaiKiemTra.findAndCountAll({
                where: whereConditions,
                attributes: ['id', 'tieuDe', 'moTa', 'thoiGianBatDau', 'thoiGianKetThuc', 'thoiLuong', 'tongDiem', 'status', 'choPhepXemDiem'],
                include: [{
                    model: Lop,
                    as: 'lop',
                    attributes: ['id', 'tenLop'],
                    required: true
                }],
                limit: limit,
                offset: offset,
                order: [['thoiGianBatDau', 'DESC']]
            });

            const mappedExams = rows.map(this.mapToDTO.bind(this));

            return {
                exams: mappedExams,
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database error in findWithFilters:', error);
            throw new DatabaseError('Lỗi khi truy vấn bài kiểm tra từ cơ sở dữ liệu');
        }
    }

    async findById(id) {
        try {
            const baiKiemTra = await BaiKiemTra.findByPk(id, {
                attributes: ['id', 'tieuDe', 'moTa', 'thoiGianBatDau', 'thoiGianKetThuc', 'thoiLuong', 'tongDiem', 'idLop', 'status', 'choPhepXemDiem'],
                include: [{
                    model: Lop,
                    as: 'lop',
                    attributes: ['id', 'tenLop']
                }]
            });

            return baiKiemTra ? this.mapToDTO(baiKiemTra) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm bài kiểm tra từ cơ sở dữ liệu');
        }
    }

    async findByIdWithSubmission(examId, userId) {
        try {
            const baiKiemTra = await BaiKiemTra.findByPk(examId, {
                attributes: ['id', 'tieuDe', 'moTa', 'thoiGianBatDau', 'thoiGianKetThuc', 'thoiLuong', 'tongDiem', 'status', 'choPhepXemDiem'],
                include: [
                    {
                        model: Lop,
                        as: 'lop',
                        attributes: ['id', 'tenLop']
                    },
                    {
                        model: BaiLam,
                        as: 'baiLams',
                        where: { idSinhVien: userId },
                        required: false,
                        attributes: ['id', 'thoiGianBatDau', 'thoiGianNop', 'tongDiem']
                    }
                ]
            });

            if (!baiKiemTra) return null;

            const dto = this.mapToDTO(baiKiemTra);
            dto.mySubmission = baiKiemTra.baiLams?.[0] ? {
                id: baiKiemTra.baiLams[0].id,
                thoiGianBatDau: baiKiemTra.baiLams[0].thoiGianBatDau,
                thoiGianNop: baiKiemTra.baiLams[0].thoiGianNop,
                tongDiem: baiKiemTra.baiLams[0].tongDiem,
                trangThai: baiKiemTra.baiLams[0].thoiGianNop ? 'daNop' : 'dangLam'
            } : null;

            return dto;
        } catch (error) {
            console.error('Database error in findByIdWithSubmission:', error);
            throw new DatabaseError('Lỗi khi tìm bài kiểm tra với bài làm từ cơ sở dữ liệu');
        }
    }

    async create(examData) {
        try {
            const baiKiemTra = await BaiKiemTra.create(examData);

            return baiKiemTra ? this.mapToDTO(baiKiemTra) : null;
        } catch (error) {
            console.error('Database error in create:', error);
            throw new DatabaseError('Lỗi khi tạo bài kiểm tra mới');
        }
    }

    async update(id, examData) {
        try {
            await BaiKiemTra.update(examData, {
                where: { id }
            });

            return await this.findById(id);
        } catch (error) {
            console.error('Database error in update:', error);
            throw new DatabaseError('Lỗi khi cập nhật bài kiểm tra');
        }
    }

    async delete(id) {
        const transaction = await sequelize.transaction();
        
        try {
            // First, get all questions for this exam
            const questions = await CauHoi.findAll({
                where: { idBaiKiemTra: id },
                attributes: ['id'],
                transaction
            });

            const questionIds = questions.map(q => q.id);

            if (questionIds.length > 0) {
                // Delete all LuaChon (choices) for these questions
                await LuaChon.destroy({
                    where: { idCauHoi: { [Op.in]: questionIds } },
                    transaction
                });

                // Delete all CauHoi (questions)
                await CauHoi.destroy({
                    where: { id: { [Op.in]: questionIds } },
                    transaction
                });
            }

            // Finally, delete the exam itself
            // Note: BaiLam should not exist here because validation prevents deletion if there are submissions
            const result = await BaiKiemTra.destroy({
                where: { id },
                transaction
            });

            await transaction.commit();
            return result > 0;
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in delete:', error);
            throw new DatabaseError('Lỗi khi xóa bài kiểm tra');
        }
    }

    // Count submissions for an exam
    async countSubmissions(examId) {
        try {
            const count = await BaiLam.count({
                where: { idBaiKiemTra: examId }
            });
            return count;
        } catch (error) {
            console.error('Database error in countSubmissions:', error);
            throw new DatabaseError('Lỗi khi đếm bài làm');
        }
    }

    async findQuestions(examId, filters) {
        const { page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;

        try {
            const { count, rows } = await CauHoi.findAndCountAll({
                where: { idBaiKiemTra: examId },
                attributes: ['id', 'noiDung', 'diemToiDa', 'loaiCauHoi','thuTu'],
                include: [{
                    model: LuaChon,
                    as: 'luaChons',
                    // Always include correct answers (only admins/teachers can access this endpoint)
                    attributes: ['id', 'noiDung', 'laDapAnDung']
                }],
                limit: limit,
                offset: offset,
                order: [['id', 'ASC']]
            });

            const mappedQuestions = rows.map(question => ({
                id: question.id,
                noiDung: question.noiDung,
                diemToiDa: question.diemToiDa,
                loaiCauHoi: question.loaiCauHoi,
                thuTu: question.thuTu,
                luaChons: question.luaChons
            }));

            return {
                questions: mappedQuestions,
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database error in findQuestions:', error);
            throw new DatabaseError('Lỗi khi truy vấn câu hỏi từ cơ sở dữ liệu');
        }
    }

    async updateStatus(id, status) {
        try {
            await BaiKiemTra.update({ status }, {
                where: { id }
            });

            return await this.findById(id);
        } catch (error) {
            console.error('Database error in updateStatus:', error);
            throw new DatabaseError('Lỗi khi cập nhật trạng thái bài kiểm tra');
        }
    }

    async getStats(examId) {
        try {
            const totalCount = await BaiLam.count({
                where: { idBaiKiemTra: examId }
            });
            
            const submittedCount = await BaiLam.count({
                where: { 
                    idBaiKiemTra: examId,
                    thoiGianNop: { [Op.ne]: null }
                }
            });
            
            const avgScore = await BaiLam.findAll({
                where: { 
                    idBaiKiemTra: examId,
                    tongDiem: { [Op.ne]: null }
                },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('tongDiem')), 'avgScore'],
                    [sequelize.fn('MAX', sequelize.col('tongDiem')), 'maxScore'],
                    [sequelize.fn('MIN', sequelize.col('tongDiem')), 'minScore']
                ],
                raw: true
            });
            
            const stats = avgScore[0] || { avgScore: 0, maxScore: 0, minScore: 0 };

            return {
                totalSubmissions: totalCount,
                submittedCount: submittedCount,
                inProgressCount: totalCount - submittedCount,
                avgScore: parseFloat(stats.avgScore) || 0,
                maxScore: parseFloat(stats.maxScore) || 0,
                minScore: parseFloat(stats.minScore) || 0
            };
        } catch (error) {
            console.error('Database error in getStats:', error);
            throw new DatabaseError('Lỗi khi lấy thống kê bài kiểm tra');
        }
    }

    async findSubmissions(examId, filters) {
        const { status, studentId, page = 1, limit = 20 } = filters;
        
        let whereConditions = { idBaiKiemTra: examId };
        if (studentId) whereConditions.idSinhVien = studentId;

        const offset = (page - 1) * limit;

        try {
            // Get total questions count for this exam
            const totalQuestions = await CauHoi.count({
                where: { idBaiKiemTra: examId }
            });

            const { count, rows } = await BaiLam.findAndCountAll({
                where: whereConditions,
                attributes: ['id', 'thoiGianBatDau', 'thoiGianNop', 'tongDiem'],
                include: [
                    {
                        model: NguoiDung,
                        as: 'sinhVien',
                        attributes: ['id', 'ten', 'email']
                    },
                    {
                        model: BaiLamCauHoi,
                        as: 'cauHoiDaLam',
                        attributes: ['id', 'idCauHoi'],
                        required: false,
                        include: [{
                            model: LuaChon,
                            as: 'luaChonDaChons',
                            attributes: ['id', 'laDapAnDung'],
                            through: { attributes: [] },
                            required: false
                        }]
                    }
                ],
                distinct: true,
                limit: limit,
                offset: offset,
                order: [['thoiGianBatDau', 'DESC']]
            });

            const mappedSubmissions = rows.map(submission => {
                // Calculate correct answers count
                let soCauDung = 0;
                if (submission.cauHoiDaLam && submission.cauHoiDaLam.length > 0) {
                    for (const answer of submission.cauHoiDaLam) {
                        if (answer.luaChonDaChons && answer.luaChonDaChons.length > 0) {
                            // Check if any selected choice is correct
                            const hasCorrect = answer.luaChonDaChons.some(choice => choice.laDapAnDung);
                            if (hasCorrect) soCauDung++;
                        }
                    }
                }

                return {
                    id: submission.id,
                    thoiGianBatDau: submission.thoiGianBatDau,
                    thoiGianNop: submission.thoiGianNop,
                    tongDiem: submission.tongDiem,
                    soCauDung: soCauDung,
                    tongSoCau: totalQuestions,
                    trangThai: submission.thoiGianNop ? 'daNop' : 'dangLam',
                    sinhVien: {
                        id: submission.sinhVien.id,
                        ten: submission.sinhVien.ten,
                        email: submission.sinhVien.email
                    }
                };
            });

            return {
                submissions: mappedSubmissions,
                total: count,
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit)
            };

        } catch (error) {
            console.error('Database error in findSubmissions:', error);
            throw new DatabaseError('Lỗi khi truy vấn bài làm từ cơ sở dữ liệu');
        }
    }

    mapToDTO(baiKiemTraRecord) {
        return {
            id: baiKiemTraRecord.id,
            tenBaiKiemTra: baiKiemTraRecord.tieuDe,
            moTa: baiKiemTraRecord.moTa,
            thoiGianBatDau: baiKiemTraRecord.thoiGianBatDau,
            thoiGianKetThuc: baiKiemTraRecord.thoiGianKetThuc,
            hanNop: baiKiemTraRecord.thoiGianKetThuc,
            thoiLuong: baiKiemTraRecord.thoiLuong,
            tongDiem: baiKiemTraRecord.tongDiem,
            idLop: baiKiemTraRecord.idLop,
            loaiKiemTra: baiKiemTraRecord.status,
            status: baiKiemTraRecord.status,
            choPhepXemDiem: baiKiemTraRecord.choPhepXemDiem,
            lop: baiKiemTraRecord.lop ? {
                id: baiKiemTraRecord.lop.id,
                tenLop: baiKiemTraRecord.lop.tenLop
            } : null
        };
    }
}

export default new ExamRepository();