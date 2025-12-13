import { CauHoi, LuaChon, BaiKiemTra } from '../models/index.js';
import { Op } from 'sequelize';
import db from '../config/db.js';
import { DatabaseError } from '../utils/errors.js';

const { sequelize } = db;

class QuestionRepository {
    async generateQuestionId() {
        const lastQuestion = await CauHoi.findOne({
            order: [['id', 'DESC']]
        });
        
        if (!lastQuestion || !lastQuestion.id || !lastQuestion.id.startsWith('CH')) {
            return 'CH001';
        }
        
        const lastNumber = parseInt(lastQuestion.id.substring(2));
        
        if (isNaN(lastNumber)) {
            return 'CH001';
        }
        
        const newNumber = lastNumber + 1;
        return `CH${String(newNumber).padStart(3, '0')}`;
    }

    async generateChoiceId() {
        const lastChoice = await LuaChon.findOne({
            order: [['id', 'DESC']]
        });
        
        if (!lastChoice || !lastChoice.id || !lastChoice.id.startsWith('LC')) {
            return 'LC001';
        }
        
        const lastNumber = parseInt(lastChoice.id.substring(2));
        
        if (isNaN(lastNumber)) {
            return 'LC001';
        }
        
        const newNumber = lastNumber + 1;
        return `LC${String(newNumber).padStart(3, '0')}`;
    }

    async create(examId, questionData) {
        const transaction = await sequelize.transaction();
        
        try {
            // Generate question ID
            const questionId = await this.generateQuestionId();
            
            // Get next thuTu for question
            const maxThuTu = await CauHoi.max('thuTu', {
                where: { idBaiKiemTra: examId }
            }) || 0;

            // Create question
            const question = await CauHoi.create({
                id: questionId,
                noiDung: questionData.noiDung,
                diemToiDa: questionData.diemToiDa,
                loaiCauHoi: questionData.loaiCauHoi,
                idBaiKiemTra: examId,
                thuTu: maxThuTu + 1
            }, { transaction });

            // Create choices
            if (questionData.luaChons && questionData.luaChons.length > 0) {
                const choicesData = [];
                
                // Get starting choice ID once
                let currentChoiceId = await this.generateChoiceId();
                
                for (let i = 0; i < questionData.luaChons.length; i++) {
                    const choiceData = questionData.luaChons[i];
                    choicesData.push({
                        id: currentChoiceId,
                        noiDung: choiceData.noiDung,
                        laDapAnDung: choiceData.laDapAnDung || false,
                        thuTu: choiceData.thuTu || (i + 1),
                        idCauHoi: question.id
                    });
                    
                    // Increment ID for next choice
                    if (i < questionData.luaChons.length - 1) {
                        const numPart = parseInt(currentChoiceId.substring(2));
                        currentChoiceId = `LC${String(numPart + 1).padStart(3, '0')}`;
                    }
                }
                
                await LuaChon.bulkCreate(choicesData, { transaction });
            }

            await transaction.commit();
            
            return await this.findById(question.id);
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in create:', error);
            throw new DatabaseError('Lỗi khi tạo câu hỏi mới');
        }
    }

    async createMultiple(examId, questionsData) {
        const transaction = await sequelize.transaction();
        
        try {
            const results = [];
            
            // Get starting thuTu
            let currentThuTu = await CauHoi.max('thuTu', {
                where: { idBaiKiemTra: examId }
            }) || 0;

            for (const questionData of questionsData) {
                currentThuTu++;
                
                // Generate question ID
                const questionId = await this.generateQuestionId();
                
                // Create question
                const question = await CauHoi.create({
                    id: questionId,
                    noiDung: questionData.noiDung,
                    diemToiDa: questionData.diemToiDa,
                    loaiCauHoi: questionData.loaiCauHoi,
                    idBaiKiemTra: examId,
                    thuTu: currentThuTu
                }, { transaction });

                // Create choices
                if (questionData.luaChons && questionData.luaChons.length > 0) {
                    const choicesData = [];
                    
                    // Get starting choice ID once
                    let currentChoiceId = await this.generateChoiceId();
                    
                    for (let i = 0; i < questionData.luaChons.length; i++) {
                        const choiceData = questionData.luaChons[i];
                        choicesData.push({
                            id: currentChoiceId,
                            noiDung: choiceData.noiDung,
                            laDapAnDung: choiceData.laDapAnDung || false,
                            thuTu: choiceData.thuTu || (i + 1),
                            idCauHoi: question.id
                        });
                        
                        // Increment ID for next choice
                        if (i < questionData.luaChons.length - 1) {
                            const numPart = parseInt(currentChoiceId.substring(2));
                            currentChoiceId = `LC${String(numPart + 1).padStart(3, '0')}`;
                        }
                    }
                    
                    await LuaChon.bulkCreate(choicesData, { transaction });
                }

                results.push(question.id);
            }

            await transaction.commit();
            
                // Fetch all created questions with choices in one query
                const completeResults = await CauHoi.findAll({
                    where: { id: { [Op.in]: results } },
                    attributes: ['id', 'noiDung', 'diemToiDa', 'loaiCauHoi', 'thuTu'],
                    include: [{
                    model: LuaChon,
                    as: 'luaChons',
                    attributes: ['id', 'noiDung', 'laDapAnDung', 'thuTu'],
                    required: false,
                    order: [['thuTu', 'ASC']]
                }],
                order: [
                    ['thuTu', 'ASC'],
                    [{ model: LuaChon, as: 'luaChons' }, 'thuTu', 'ASC']
                ]
            }); 
            
            return completeResults.map(question => this.mapToDTO(question));
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in createMultiple:', error);
            throw new DatabaseError('Lỗi khi tạo nhiều câu hỏi');
        }
    }

    async findById(id) {
        try {
            const question = await CauHoi.findByPk(id, {
                attributes: ['id', 'noiDung', 'diemToiDa', 'loaiCauHoi', 'thuTu'],
                include: [{
                    model: LuaChon,
                    as: 'luaChons',
                    attributes: ['id', 'noiDung', 'laDapAnDung', 'thuTu'],
                    required: false,
                    order: [['thuTu', 'ASC']]
                }],
                order: [[{ model: LuaChon, as: 'luaChons' }, 'thuTu', 'ASC']]
            });

            return question ? this.mapToDTO(question) : null;
        } catch (error) {
            console.error('Database error in findById:', error);
            throw new DatabaseError('Lỗi khi tìm câu hỏi từ cơ sở dữ liệu');
        }
    }

    async update(id, questionData) {
        const transaction = await sequelize.transaction();
        
        try {
            // Update question
            await CauHoi.update({
                noiDung: questionData.noiDung,
                diemToiDa: questionData.diemToiDa,
                loaiCauHoi: questionData.loaiCauHoi
            }, {
                where: { id },
                transaction
            });

            // Update choices if provided
            if (questionData.luaChons) {
                // Delete existing choices
                await LuaChon.destroy({
                    where: { idCauHoi: id },
                    transaction
                });

                // Create new choices with generated IDs
                const choicesData = [];
                
                // Get starting choice ID once
                let currentChoiceId = await this.generateChoiceId();
                
                for (let i = 0; i < questionData.luaChons.length; i++) {
                    const choiceData = questionData.luaChons[i];
                    choicesData.push({
                        id: currentChoiceId,
                        noiDung: choiceData.noiDung,
                        laDapAnDung: choiceData.laDapAnDung || false,
                        thuTu: i + 1,
                        idCauHoi: id
                    });
                    
                    // Increment ID for next choice
                    if (i < questionData.luaChons.length - 1) {
                        const numPart = parseInt(currentChoiceId.substring(2));
                        currentChoiceId = `LC${String(numPart + 1).padStart(3, '0')}`;
                    }
                }
                
                await LuaChon.bulkCreate(choicesData, { transaction });
            }

            await transaction.commit();
            return await this.findById(id);
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in update:', error);
            throw new DatabaseError('Lỗi khi cập nhật câu hỏi');
        }
    }

    async delete(id) {
        const transaction = await sequelize.transaction();
        
        try {
            // Delete choices first
            await LuaChon.destroy({
                where: { idCauHoi: id },
                transaction
            });

            // Delete question
            const result = await CauHoi.destroy({
                where: { id },
                transaction
            });

            await transaction.commit();
            return result > 0;
        } catch (error) {
            await transaction.rollback();
            console.error('Database error in delete:', error);
            throw new DatabaseError('Lỗi khi xóa câu hỏi');
        }
    }

    async checkExamExists(examId) {
        try {
            const exam = await BaiKiemTra.findByPk(examId);
            return !!exam;
        } catch (error) {
            console.error('Database error in checkExamExists:', error);
            throw new DatabaseError('Lỗi khi kiểm tra bài kiểm tra');
        }
    }

    mapToDTO(questionRecord) {
        return {
            id: questionRecord.id,
            noiDung: questionRecord.noiDung,
            diemToiDa: questionRecord.diemToiDa,
            loaiCauHoi: questionRecord.loaiCauHoi,
            thuTu: questionRecord.thuTu,
            luaChons: questionRecord.luaChons ? questionRecord.luaChons.map(choice => ({
                id: choice.id,
                noiDung: choice.noiDung,
                laDapAnDung: choice.laDapAnDung,
                thuTu: choice.thuTu
            })) : []
        };
    }
}

export default new QuestionRepository();