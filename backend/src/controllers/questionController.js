import QuestionService from "../services/questionService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class QuestionController {
    // POST /api/exams/:examId/questions
    // Hỗ trợ tạo 1 hoặc nhiều câu hỏi trong 1 API
    createQuestion = asyncHandler(async (req, res) => {
        const { examId } = req.params;
        const questionData = req.body;
        
        if (!examId) {
            throw new ValidationError('ID bài kiểm tra là bắt buộc');
        }
        
        const result = await QuestionService.createQuestion(examId, questionData);
        
        // Determine response based on single vs multiple
        const isMultiple = questionData.questions && Array.isArray(questionData.questions);
        const message = isMultiple 
            ? `Tạo thành công ${result.length} câu hỏi mới` 
            : 'Tạo câu hỏi mới thành công';
            
        ResponseUtil.created(res, result, message);
    });
    
    updateQuestion = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const questionData = req.body;
        
        const result = await QuestionService.updateQuestion(id, questionData);
        
        ResponseUtil.success(res, result, 'Cập nhật câu hỏi thành công');
    });
    
    deleteQuestion = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await QuestionService.deleteQuestion(id);
        
        ResponseUtil.success(res, null, 'Xóa câu hỏi thành công');
    });
}

export default new QuestionController();