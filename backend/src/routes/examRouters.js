import express from "express";
import ExamController from "../controllers/examController.js";
import QuestionController from "../controllers/questionController.js";

const router = express.Router();

// === EXAM MANAGEMENT ===
// GET /api/exams?lop=123
router.get("/", ExamController.getAllExams);
router.get("/:id", ExamController.getExamById);
router.post("/", ExamController.createExam);
router.put("/:id", ExamController.updateExam);
router.delete("/:id", ExamController.deleteExam);

// GET /api/exams/:id/questions
router.get("/:id/questions", ExamController.getExamQuestions);

// POST /api/exams/:id/open - Mở bài thi
// POST /api/exams/:id/close - Đóng bài thi
router.post("/:id/open", ExamController.openExam);
router.post("/:id/close", ExamController.closeExam);

// === EXAM STATISTICS & SUMMARY ===
// GET /api/exams/:id/stats - Thống kê bài thi
router.get("/:id/stats", ExamController.getExamStats);

// GET /api/exams/:id/submissions - Danh sách bài làm của exam (for teacher)
// Query: ?status=completed&studentId=123&page=1&limit=20
router.get("/:id/submissions", ExamController.getExamSubmissions);

// === QUESTIONS ===
// POST /api/exams/:id/questions - Tạo câu hỏi mới (với luaChon nested)
router.post("/:id/questions", QuestionController.createQuestion);

// POST /api/exams/:id/questions/bulk - Tạo nhiều câu hỏi cùng lúc
router.post("/:id/questions/bulk", QuestionController.createMultipleQuestions);

// POST /api/exams/:id/questions/complete - Tạo questions + choices trong 1 request
router.post("/:id/questions/complete", QuestionController.createCompleteQuestions);

// PUT /api/exams/questions/:id - Update câu hỏi (trả về object đã update)
router.put("/questions/:id", QuestionController.updateQuestion);

// DELETE /api/exams/questions/:id - Xóa câu hỏi
router.delete("/questions/:id", QuestionController.deleteQuestion);

export default router;