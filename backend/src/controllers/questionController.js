import express from "express";

class QuestionController {
    // POST /api/exams/:examId/questions
    // Hỗ trợ tạo 1 hoặc nhiều câu hỏi trong 1 API
    createQuestion(req, res) {
        // Body có thể là:
        // Single: { noiDung, diemToiDa, loaiCauHoi, luaChons: [...] }
        // Multiple: { questions: [{ noiDung, diemToiDa, loaiCauHoi, luaChons: [...] }, ...] }
    }
    
    updateQuestion(req, res) {
        
    }
    
    deleteQuestion(req, res) {
        
    }
}

export default new QuestionController();