import SubmissionService from "../services/submissionService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class SubmissionController {
    // === SUBMISSION MANAGEMENT ===
    getSubmissionById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { user } = req;
        
        const userId = user?.role === 'sinhVien' ? user.id : null;
        const result = await SubmissionService.getSubmissionById(id, userId);
        
        ResponseUtil.success(res, result, 'Lấy thông tin bài làm thành công');
    });
    
    startExam = asyncHandler(async (req, res) => {
        const { examId } = req.body;
        const { user } = req;
        
        if (!user) {
            throw new ValidationError('Cần đăng nhập để bắt đầu làm bài');
        }
        
        const result = await SubmissionService.startExam(examId, user.id);
        
        ResponseUtil.created(res, result, 'Bắt đầu làm bài thành công');
    });
    
    submitExam = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { user } = req;
        
        const userId = user?.role === 'sinhVien' ? user.id : null;
        const result = await SubmissionService.submitExam(id, userId);
        
        ResponseUtil.success(res, result, 'Nộp bài thành công');
    });
    
    deleteSubmission = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        // This would typically be admin-only functionality
        // Implementation depends on business requirements
        throw new ValidationError('Chức năng xóa bài làm chưa được hỗ trợ');
    });
    
    // === ANSWER MANAGEMENT ===
    
    answerQuestion = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const answersData = req.body;
        const { user } = req;
        
        if (!user) {
            throw new ValidationError('Cần đăng nhập để trả lời câu hỏi');
        }
        
        // Convert single answer to array format if needed
        const answersArray = Array.isArray(answersData) ? answersData : [answersData];
        
        const userId = user.role === 'sinhVien' ? user.id : null;
        const result = await SubmissionService.syncAnswers(id, answersArray, userId);
        
        ResponseUtil.success(res, result, 'Đồng bộ câu trả lời thành công');
    });
    
    updateAnswer = asyncHandler(async (req, res) => {
        // This is handled by answerQuestion (sync-answers endpoint)
        // Keeping for API compatibility
        return this.answerQuestion(req, res);
    });
    
    clearAnswer = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { questionId } = req.body;
        const { user } = req;
        
        if (!user) {
            throw new ValidationError('Cần đăng nhập để xóa câu trả lời');
        }
        
        if (!questionId) {
            throw new ValidationError('ID câu hỏi là bắt buộc');
        }
        
        // Clear answer by sending empty selectedChoices array
        const clearData = [{
            questionId,
            selectedChoices: []
        }];
        
        const userId = user.role === 'sinhVien' ? user.id : null;
        const result = await SubmissionService.syncAnswers(id, clearData, userId);
        
        ResponseUtil.success(res, result, 'Xóa câu trả lời thành công');
    });
}


export default new SubmissionController();