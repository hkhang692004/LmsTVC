import SubmissionRepository from "../repositories/submissionRepository.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../utils/errors.js";

class SubmissionService {
    async getSubmissionById(id, userId = null) {
        if (!id) {
            throw new ValidationError('ID bài làm là bắt buộc');
        }

        const submission = await SubmissionRepository.findById(id);
        if (!submission) {
            throw new NotFoundError('Không tìm thấy bài làm');
        }

        // Check permission - student can only access their own submission
        if (userId && submission.student.id !== userId) {
            throw new ForbiddenError('Không có quyền truy cập bài làm này');
        }

        return submission;
    }

    async startExam(examId, userId) {
        console.log('[SubmissionService] startExam called with examId:', examId, 'userId:', userId);
        
        if (!examId || !userId) {
            console.log('[SubmissionService] Missing required parameters');
            throw new ValidationError('ID bài kiểm tra và người dùng là bắt buộc');
        }

        // TODO: Add validation for exam time window, student enrollment, etc.
        
        try {
            console.log('[SubmissionService] Calling SubmissionRepository.create');
            const result = await SubmissionRepository.create(examId, userId);
            console.log('[SubmissionService] Repository.create successful');
            return result;
        } catch (error) {
            console.error('[SubmissionService] Error in startExam:', error);
            if (error.message.includes('đã có bài làm')) {
                throw new ValidationError('Bạn đã có bài làm cho bài kiểm tra này');
            }
            throw error;
        }
    }

    async submitExam(submissionId, userId = null) {
        if (!submissionId) {
            throw new ValidationError('ID bài làm là bắt buộc');
        }

        const submission = await SubmissionRepository.findById(submissionId);
        if (!submission) {
            throw new NotFoundError('Không tìm thấy bài làm');
        }

        // Check permission
        if (userId && submission.student.id !== userId) {
            throw new ForbiddenError('Không có quyền nộp bài làm này');
        }

        if (submission.isSubmitted) {
            throw new ValidationError('Bài làm đã được nộp');
        }

        return await SubmissionRepository.submit(submissionId);
    }

    async getSubmissionAnswers(submissionId, userId = null) {
        if (!submissionId) {
            throw new ValidationError('ID bài làm là bắt buộc');
        }

        // Verify submission exists and check permission
        const submission = await this.getSubmissionById(submissionId, userId);
        
        return await SubmissionRepository.getAnswers(submissionId);
    }

    async syncAnswers(submissionId, answersData, userId = null) {
        if (!submissionId) {
            throw new ValidationError('ID bài làm là bắt buộc');
        }

        if (!Array.isArray(answersData) || answersData.length === 0) {
            throw new ValidationError('Dữ liệu câu trả lời không hợp lệ');
        }

        // Verify submission exists and check permission
        const submission = await this.getSubmissionById(submissionId, userId);
        
        if (submission.isSubmitted) {
            throw new ValidationError('Không thể thay đổi câu trả lời của bài làm đã nộp');
        }

        // Validate answers data
        this.validateAnswersData(answersData);

        return await SubmissionRepository.syncAnswers(submissionId, answersData);
    }

    validateAnswersData(answersData) {
        answersData.forEach((answer, index) => {
            if (!answer.questionId) {
                throw new ValidationError(`Câu trả lời ${index + 1}: thiếu ID câu hỏi`);
            }

            if (!Array.isArray(answer.selectedChoices)) {
                throw new ValidationError(`Câu trả lời ${index + 1}: selectedChoices phải là array`);
            }

            if (answer.selectedChoices.length === 0) {
                throw new ValidationError(`Câu trả lời ${index + 1}: phải chọn ít nhất 1 lựa chọn`);
            }

            // Validate choice IDs
            answer.selectedChoices.forEach(choiceId => {
                if (!choiceId || typeof choiceId !== 'string') {
                    throw new ValidationError(`Câu trả lời ${index + 1}: ID lựa chọn không hợp lệ`);
                }
            });
        });
    }
}

export default new SubmissionService();