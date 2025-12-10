import ExamService from "../services/examService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ResponseUtil from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class ExamController {
    // === EXAM MANAGEMENT ===
    // GET /api/exams - Role-based response
    getAllExams = asyncHandler(async (req, res) => {
        const { lopId, page = 1, limit = 20 } = req.query;
        const { user } = req; // From auth middleware
        
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        const filters = {
            lopId: lopId || null,
            userRole: user?.role || null,
            userId: user?.id || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await ExamService.getAllExams(filters);

        ResponseUtil.successWithPagination(res, result.exams, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách bài kiểm tra thành công');
    });

    getExamById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const result = await ExamService.getExamById(id);
        
        ResponseUtil.success(res, result, 'Lấy thông tin bài kiểm tra thành công');
    });
    
    // GET /api/exams/:id/student-view - Student view with submission
    getExamStudentView = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { user } = req;
        
        if (!user) {
            throw new ValidationError('Cần đăng nhập để xem bài kiểm tra');
        }

        const result = await ExamService.getExamStudentView(id, user.id);
        
        ResponseUtil.success(res, result, 'Lấy thông tin bài kiểm tra cho sinh viên thành công');
    });
    
    createExam = asyncHandler(async (req, res) => {
        const examData = req.body;
        
        const result = await ExamService.createExam(examData);
        
        ResponseUtil.created(res, result, 'Tạo bài kiểm tra mới thành công');
    });
    
    updateExam = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const examData = req.body;
        
        const result = await ExamService.updateExam(id, examData);
        
        ResponseUtil.success(res, result, 'Cập nhật bài kiểm tra thành công');
    });
    
    deleteExam = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        await ExamService.deleteExam(id);
        
        ResponseUtil.success(res, null, 'Xóa bài kiểm tra thành công');
    });
    
    // === EXAM QUESTIONS ===
    // GET /api/exams/:id/questions - Teacher only (with answers)
    getExamQuestions = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        const filters = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        // Only teachers can access questions with answers
        const result = await ExamService.getExamQuestions(id, filters);
        
        ResponseUtil.successWithPagination(res, result.questions, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách câu hỏi thành công');
    });
    
    // === EXAM CONTROL ===
    updateExamStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await ExamService.updateExamStatus(id, status);
        
        ResponseUtil.success(res, result, 'Cập nhật trạng thái bài kiểm tra thành công');
    });
    
    // === EXAM STATISTICS ===
    getExamStats = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        const result = await ExamService.getExamStats(id);
        
        ResponseUtil.success(res, result, 'Lấy thống kê bài kiểm tra thành công');
    });
    
    // GET /api/exams/:id/submissions - Teacher only
    getExamSubmissions = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status, studentId, page = 1, limit = 20 } = req.query;
        
        if (page && (isNaN(page) || page < 1)) {
            throw new ValidationError('Page phải là số dương');
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            throw new ValidationError('Limit phải từ 1-100');
        }

        const filters = {
            status: status || null,
            studentId: studentId || null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await ExamService.getExamSubmissions(id, filters);
        
        ResponseUtil.successWithPagination(res, result.submissions, {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }, 'Lấy danh sách bài làm thành công');
    });
}

export default new ExamController();