import { BaiLam, BaiLamCauHoi, LuaChonDaChon, BaiKiemTra, CauHoi, LuaChon, NguoiDung } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import { DatabaseError } from '../utils/errors.js';

class SubmissionRepository {
    async findById(id) {
        try {
            const submission = await BaiLam.findByPk(id, {
                attributes: ['id', 'idSinhVien', 'idBaiKiemTra', 'tongDiem', 'thoiGianBatDau', 'thoiGianNop'],
                include: [
                    {
                        model: BaiKiemTra,
                        as: 'baiKiemTra',
                        attributes: ['id', 'tieuDe', 'thoiLuong', 'tongDiem', 'thoiGianBatDau', 'thoiGianKetThuc']
                    },
                    {
                        model: NguoiDung,
                        as: 'sinhVien',
                        attributes: ['id', 'ten', 'email']
                    },
                    {
                        model: BaiLamCauHoi,
                        as: 'cauHoiDaLam',
                        attributes: ['id', 'idCauHoi', 'diemDatDuoc', 'thoiGianTraLoi'],
                        include: [
                            {
                                model: CauHoi,
                                as: 'cauHoi',
                                attributes: ['id', 'noiDung', 'diemToiDa', 'loaiCauHoi', 'thuTu'],
                                include: [{
                                    model: LuaChon,
                                    as: 'luaChons',
                                    attributes: ['id', 'noiDung', 'thuTu'],
                                    required: false
                                }]
                            },
                            {
                                model: LuaChon,
                                as: 'luaChonDaChons',
                                attributes: ['id', 'noiDung'],
                                through: { attributes: [] }
                            }
                        ]
                    }
                ],
                order: [
                    [{ model: BaiLamCauHoi, as: 'cauHoiDaLam' }, { model: CauHoi, as: 'cauHoi' }, 'thuTu', 'ASC']
                ]
            });

            return submission ? this.mapToDTO(submission) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm bài làm từ cơ sở dữ liệu');
        }
    }

    async create(examId, studentId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Check if student already has submission for this exam
            const existingSubmission = await BaiLam.findOne({
                where: { 
                    idBaiKiemTra: examId,
                    idSinhVien: studentId 
                }
            });

            if (existingSubmission) {
                await transaction.rollback();
                throw new Error('Sinh viên đã có bài làm cho bài kiểm tra này');
            }

            // Create submission
            const submission = await BaiLam.create({
                idSinhVien: studentId,
                idBaiKiemTra: examId,
                thoiGianBatDau: new Date()
            }, { transaction });

            // Get all questions for this exam
            const questions = await CauHoi.findAll({
                where: { idBaiKiemTra: examId },
                attributes: ['id'],
                order: [['thuTu', 'ASC']]
            });

            // Create BaiLamCauHoi entries for all questions
            const baiLamCauHoiData = questions.map(question => ({
                idBaiLam: submission.id,
                idCauHoi: question.id
            }));

            await BaiLamCauHoi.bulkCreate(baiLamCauHoiData, { transaction });

            await transaction.commit();
            return await this.findById(submission.id);
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in create:', error);
            throw new DatabaseError('Lỗi khi tạo bài làm mới');
        }
    }

    async submit(id) {
        const transaction = await sequelize.transaction();
        
        try {
            const submission = await BaiLam.findByPk(id, { transaction });
            if (!submission) {
                throw new Error('Không tìm thấy bài làm');
            }

            if (submission.thoiGianNop) {
                throw new Error('Bài làm đã được nộp');
            }

            // Calculate total score
            const totalScore = await this.calculateTotalScore(id, transaction);

            // Update submission
            await BaiLam.update({
                thoiGianNop: new Date(),
                tongDiem: totalScore
            }, {
                where: { id },
                transaction
            });

            await transaction.commit();
            return await this.findById(id);
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in submit:', error);
            throw new DatabaseError('Lỗi khi nộp bài làm');
        }
    }

    async getAnswers(submissionId) {
        try {
            const answers = await BaiLamCauHoi.findAll({
                where: { idBaiLam: submissionId },
                attributes: ['id', 'idCauHoi', 'diemDatDuoc', 'thoiGianTraLoi'],
                include: [
                    {
                        model: CauHoi,
                        as: 'cauHoi',
                        attributes: ['id', 'noiDung', 'diemToiDa', 'loaiCauHoi', 'thuTu']
                    },
                    {
                        model: LuaChon,
                        as: 'luaChonDaChons',
                        attributes: ['id', 'noiDung'],
                        through: { attributes: [] }
                    }
                ],
                order: [[{ model: CauHoi, as: 'cauHoi' }, 'thuTu', 'ASC']]
            });

            return answers.map(answer => ({
                questionId: answer.idCauHoi,
                question: {
                    id: answer.cauHoi.id,
                    noiDung: answer.cauHoi.noiDung,
                    diemToiDa: answer.cauHoi.diemToiDa,
                    loaiCauHoi: answer.cauHoi.loaiCauHoi,
                    thuTu: answer.cauHoi.thuTu
                },
                selectedChoices: answer.luaChonDaChons.map(choice => ({
                    id: choice.id,
                    noiDung: choice.noiDung
                })),
                diemDatDuoc: answer.diemDatDuoc,
                thoiGianTraLoi: answer.thoiGianTraLoi
            }));
        } catch (error) {
            console.error('Database error in getAnswers:', error);
            throw new DatabaseError('Lỗi khi lấy câu trả lời');
        }
    }

    async syncAnswers(submissionId, answersData) {
        const transaction = await sequelize.transaction();
        
        try {
            const results = [];

            for (const answerData of answersData) {
                const { questionId, selectedChoices } = answerData;

                // Find or create BaiLamCauHoi
                let baiLamCauHoi = await BaiLamCauHoi.findOne({
                    where: { 
                        idBaiLam: submissionId,
                        idCauHoi: questionId 
                    },
                    transaction
                });

                if (!baiLamCauHoi) {
                    baiLamCauHoi = await BaiLamCauHoi.create({
                        idBaiLam: submissionId,
                        idCauHoi: questionId,
                        thoiGianTraLoi: new Date()
                    }, { transaction });
                } else {
                    await BaiLamCauHoi.update({
                        thoiGianTraLoi: new Date()
                    }, {
                        where: { id: baiLamCauHoi.id },
                        transaction
                    });
                }

                // Delete existing selected choices
                await LuaChonDaChon.destroy({
                    where: { idBaiLamCauHoi: baiLamCauHoi.id },
                    transaction
                });

                // Create new selected choices
                if (selectedChoices && selectedChoices.length > 0) {
                    const luaChonData = selectedChoices.map(choiceId => ({
                        idBaiLamCauHoi: baiLamCauHoi.id,
                        idLuaChon: choiceId
                    }));

                    await LuaChonDaChon.bulkCreate(luaChonData, { transaction });

                    // Calculate score for this question
                    const score = await this.calculateQuestionScore(questionId, selectedChoices, transaction);
                    
                    await BaiLamCauHoi.update({
                        diemDatDuoc: score
                    }, {
                        where: { id: baiLamCauHoi.id },
                        transaction
                    });
                }

                results.push({
                    questionId,
                    success: true
                });
            }

            await transaction.commit();
            
            // Get progress info
            const progress = await this.getProgress(submissionId);
            
            return {
                results,
                progress
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in syncAnswers:', error);
            throw new DatabaseError('Lỗi khi đồng bộ câu trả lời');
        }
    }

    async calculateQuestionScore(questionId, selectedChoiceIds, transaction = null) {
        try {
            const question = await CauHoi.findByPk(questionId, {
                include: [{
                    model: LuaChon,
                    as: 'luaChons',
                    attributes: ['id', 'laDapAnDung']
                }],
                transaction
            });

            if (!question) return 0;

            const correctChoices = question.luaChons.filter(choice => choice.laDapAnDung);
            const correctChoiceIds = correctChoices.map(choice => choice.id);

            if (question.loaiCauHoi === 'motDapAn') {
                // Single choice: all or nothing
                if (selectedChoiceIds.length === 1 && correctChoiceIds.includes(selectedChoiceIds[0])) {
                    return question.diemToiDa;
                }
                return 0;
            } else if (question.loaiCauHoi === 'nhieuDapAn') {
                // Multiple choice: partial scoring
                const correctSelected = selectedChoiceIds.filter(id => correctChoiceIds.includes(id));
                const incorrectSelected = selectedChoiceIds.filter(id => !correctChoiceIds.includes(id));
                
                if (correctSelected.length === 0) return 0;
                
                const accuracy = (correctSelected.length - incorrectSelected.length) / correctChoiceIds.length;
                return Math.max(0, accuracy * question.diemToiDa);
            }

            return 0;
        } catch (error) {
            console.error('Error calculating question score:', error);
            return 0;
        }
    }

    async calculateTotalScore(submissionId, transaction = null) {
        try {
            const result = await BaiLamCauHoi.findAll({
                where: { idBaiLam: submissionId },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('diemDatDuoc')), 'totalScore']
                ],
                raw: true,
                transaction
            });

            return parseFloat(result[0]?.totalScore) || 0;
        } catch (error) {
            console.error('Error calculating total score:', error);
            return 0;
        }
    }

    async getProgress(submissionId) {
        try {
            const progress = await BaiLamCauHoi.findAll({
                where: { idBaiLam: submissionId },
                include: [{
                    model: LuaChon,
                    as: 'luaChonDaChons',
                    through: { attributes: [] },
                    required: false
                }],
                attributes: ['id']
            });

            const total = progress.length;
            const answered = progress.filter(item => item.luaChonDaChons.length > 0).length;

            return {
                answered,
                total,
                percentage: total > 0 ? Math.round((answered / total) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting progress:', error);
            return { answered: 0, total: 0, percentage: 0 };
        }
    }

    mapToDTO(submissionRecord) {
        const isSubmitted = !!submissionRecord.thoiGianNop;
        
        return {
            id: submissionRecord.id,
            exam: {
                id: submissionRecord.baiKiemTra.id,
                tieuDe: submissionRecord.baiKiemTra.tieuDe,
                thoiLuong: submissionRecord.baiKiemTra.thoiLuong,
                tongDiem: submissionRecord.baiKiemTra.tongDiem,
                thoiGianBatDau: submissionRecord.baiKiemTra.thoiGianBatDau,
                thoiGianKetThuc: submissionRecord.baiKiemTra.thoiGianKetThuc
            },
            student: {
                id: submissionRecord.sinhVien.id,
                ten: submissionRecord.sinhVien.ten,
                email: submissionRecord.sinhVien.email
            },
            thoiGianBatDau: submissionRecord.thoiGianBatDau,
            thoiGianNop: submissionRecord.thoiGianNop,
            tongDiem: submissionRecord.tongDiem,
            isSubmitted,
            questions: submissionRecord.cauHoiDaLam ? submissionRecord.cauHoiDaLam.map(item => ({
                id: item.cauHoi.id,
                noiDung: item.cauHoi.noiDung,
                diemToiDa: item.cauHoi.diemToiDa,
                loaiCauHoi: item.cauHoi.loaiCauHoi,
                thuTu: item.cauHoi.thuTu,
                choices: item.cauHoi.luaChons.map(choice => ({
                    id: choice.id,
                    noiDung: choice.noiDung,
                    thuTu: choice.thuTu
                })),
                selectedChoices: item.luaChonDaChons.map(choice => ({
                    id: choice.id,
                    noiDung: choice.noiDung
                })),
                diemDatDuoc: item.diemDatDuoc,
                thoiGianTraLoi: item.thoiGianTraLoi
            })) : []
        };
    }
}

export default new SubmissionRepository();