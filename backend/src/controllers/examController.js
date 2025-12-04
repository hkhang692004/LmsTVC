import express from "express";

class ExamController {
    // === EXAM MANAGEMENT ===
    // GET /api/exams - Role-based response
    getAllExams(req, res) {
        // Teacher: All exams in classes they teach
        // Student: Available exams for them to take
        // Use req.user.role to determine response
    }

    getExamById(req, res) {
        // Basic exam information only
        // Response: exam details without submission data
    }
    
    // GET /api/exams/:id/student-view - Student view with submission
    getExamStudentView(req, res) {
        // Student-specific view: exam info + my submission + status
        // Response: exam details, mySubmission (if exists), submissionStatus
        // Use req.user.id to get student's submission
    }
    
    createExam(req, res) {
        
    }
    
    updateExam(req, res) {
        
    }
    
    deleteExam(req, res) {
        
    }
    
    // === EXAM QUESTIONS ===
    // GET /api/exams/:id/questions - Role-based filtering
    getExamQuestions(req, res) {
        // Teacher: Include laDapAnDung in luaChons
        // Student: Exclude laDapAnDung from luaChons
        // Use req.user.role to filter response
    }
    
    // === EXAM CONTROL ===
    openExam(req, res) {
        
    }
    
    closeExam(req, res) {
        
    }
    
    // === EXAM STATISTICS ===
    getExamStats(req, res) {
        
    }
    
    // GET /api/exams/:id/submissions - Teacher only
    getExamSubmissions(req, res) {
        // Teacher only: All student submissions for this exam
        // Response: Array of submissions with student info
    }
}

export default new ExamController();