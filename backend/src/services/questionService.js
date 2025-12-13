import QuestionRepository from "../repositories/questionRepository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class QuestionService {
    async createQuestion(examId, questionData) {
        try {
            console.log('🔍 [QuestionService] createQuestion called');
            console.log('📋 [QuestionService] examId:', examId);
            console.log('📋 [QuestionService] questionData:', JSON.stringify(questionData, null, 2));
            
            // Validate exam exists
            const examExists = await QuestionRepository.checkExamExists(examId);
            console.log('✅ [QuestionService] Exam exists:', examExists);
            
            if (!examExists) {
                throw new NotFoundError('Không tìm thấy bài kiểm tra');
            }

            // Check if it's single or multiple questions
            if (questionData.questions && Array.isArray(questionData.questions)) {
                // Multiple questions
                console.log('📚 [QuestionService] Creating multiple questions');
                this.validateMultipleQuestions(questionData.questions);
                return await QuestionRepository.createMultiple(examId, questionData.questions);
            } else {
                // Single question
                console.log('📝 [QuestionService] Creating single question');
                this.validateSingleQuestion(questionData);
                const result = await QuestionRepository.create(examId, questionData);
                console.log('✅ [QuestionService] Question created:', result?.id);
                return result;
            }
        } catch (error) {
            console.error('❌ [QuestionService] Error in createQuestion:', error);
            console.error('❌ [QuestionService] Error stack:', error.stack);
            throw error;
        }
    }

    async updateQuestion(id, questionData) {
        if (!id) {
            throw new ValidationError('ID câu hỏi là bắt buộc');
        }

        this.validateSingleQuestion(questionData);

        const existingQuestion = await QuestionRepository.findById(id);
        if (!existingQuestion) {
            throw new NotFoundError('Không tìm thấy câu hỏi');
        }

        return await QuestionRepository.update(id, questionData);
    }

    async deleteQuestion(id) {
        if (!id) {
            throw new ValidationError('ID câu hỏi là bắt buộc');
        }

        const existingQuestion = await QuestionRepository.findById(id);
        if (!existingQuestion) {
            throw new NotFoundError('Không tìm thấy câu hỏi');
        }

        return await QuestionRepository.delete(id);
    }

    validateSingleQuestion(questionData) {
        if (!questionData.noiDung?.trim()) {
            throw new ValidationError('Nội dung câu hỏi là bắt buộc');
        }

        if (!questionData.diemToiDa || questionData.diemToiDa <= 0) {
            throw new ValidationError('Điểm tối đa phải lớn hơn 0');
        }

        if (!['motDapAn', 'nhieuDapAn'].includes(questionData.loaiCauHoi)) {
            throw new ValidationError('Loại câu hỏi không hợp lệ');
        }

        if (!questionData.luaChons || !Array.isArray(questionData.luaChons)) {
            throw new ValidationError('Danh sách lựa chọn là bắt buộc');
        }

        if (questionData.luaChons.length < 2) {
            throw new ValidationError('Phải có ít nhất 2 lựa chọn');
        }

        // Validate each choice
        questionData.luaChons.forEach((choice, index) => {
            if (!choice.noiDung?.trim()) {
                throw new ValidationError(`Nội dung lựa chọn ${index + 1} là bắt buộc`);
            }
        });

        // Validate correct answers
        const correctAnswers = questionData.luaChons.filter(choice => choice.laDapAnDung);
        
        if (questionData.loaiCauHoi === 'motDapAn') {
            if (correctAnswers.length !== 1) {
                throw new ValidationError('Câu hỏi một đáp án phải có đúng 1 đáp án đúng');
            }
        } else if (questionData.loaiCauHoi === 'nhieuDapAn') {
            if (correctAnswers.length === 0) {
                throw new ValidationError('Câu hỏi nhiều đáp án phải có ít nhất 1 đáp án đúng');
            }
            if (correctAnswers.length >= questionData.luaChons.length) {
                throw new ValidationError('Không thể tất cả lựa chọn đều đúng');
            }
        }
    }

    validateMultipleQuestions(questions) {
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new ValidationError('Danh sách câu hỏi không được rỗng');
        }

        if (questions.length > 50) {
            throw new ValidationError('Không thể tạo quá 50 câu hỏi cùng lúc');
        }

        questions.forEach((question, index) => {
            try {
                this.validateSingleQuestion(question);
            } catch (error) {
                throw new ValidationError(`Câu hỏi ${index + 1}: ${error.message}`);
            }
        });
    }
}

export default new QuestionService();