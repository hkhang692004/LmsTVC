import express from "express";
import ExamController from "../controllers/examController.js";
import QuestionController from "../controllers/questionController.js";
import { checkLogin, checkRole, checkAdmin } from "../middlewares/auth.js";

const router = express.Router();

// === EXAM MANAGEMENT ===
// GET /api/exams?lopId=123 - Role-based: Teacher (all exams) vs Student (available exams)
router.get("/", checkLogin, ExamController.getAllExams);
// GET /api/exams/:id - Basic exam info
router.get("/:id", checkLogin, ExamController.getExamById);
// GET /api/exams/:id/student-view - Exam + my submission + status (for students)
router.get("/:id/student-view", checkLogin, ExamController.getExamStudentView);
router.post("/", checkLogin, checkRole(['admin', 'giangVien']), ExamController.createExam);
router.put("/:id", checkLogin, checkRole(['admin', 'giangVien']), ExamController.updateExam);
router.delete("/:id", checkLogin, checkRole(['admin', 'giangVien']), ExamController.deleteExam);

// GET /api/exams/:id/questions - Questions for exam (Teacher only: with answers)
// Query: ?page=1&limit=20
router.get("/:id/questions", checkLogin, checkRole(['admin', 'giangVien']), ExamController.getExamQuestions);

// PATCH /api/exams/:id/status - Cập nhật trạng thái bài thi
// Body: { status: "open" | "closed" }
router.patch("/:id/status", checkLogin, checkRole(['admin', 'giangVien']), ExamController.updateExamStatus);

// === EXAM STATISTICS & SUMMARY ===
// GET /api/exams/:id/stats - Thống kê bài thi
router.get("/:id/stats", checkLogin, checkRole(['admin', 'giangVien']), ExamController.getExamStats);

// GET /api/exams/:id/submissions - All submissions for exam (teacher only)
// Query: ?status=completed&studentId=123&page=1&limit=20
router.get("/:id/submissions", checkLogin, checkRole(['admin', 'giangVien']), ExamController.getExamSubmissions);

// === QUESTIONS ===
// POST /api/exams/:examId/questions - Tạo câu hỏi mới (hỗ trợ single hoặc multiple)
// Body: { questions: [{noiDung, diemToiDa, loaiCauHoi, luaChons: [...]}] }
// Hoặc: {noiDung, diemToiDa, loaiCauHoi, luaChons: [...]} cho single question
router.post("/:examId/questions", checkLogin, checkRole(['admin', 'giangVien']), QuestionController.createQuestion);

// PUT /api/exams/questions/:id - Update câu hỏi (trả về object đã update)
router.put("/questions/:id", checkLogin, checkRole(['admin', 'giangVien']), QuestionController.updateQuestion);

// DELETE /api/exams/questions/:id - Xóa câu hỏi
router.delete("/questions/:id", checkLogin, checkRole(['admin', 'giangVien']), QuestionController.deleteQuestion);

export default router;