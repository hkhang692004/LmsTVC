import express from "express";
import ExamController from "../controllers/examController.js";
import QuestionController from "../controllers/questionController.js";

const router = express.Router();

// === EXAM MANAGEMENT ===
// GET /api/exams?lop=123 - Role-based: Teacher (all exams) vs Student (available exams)
router.get("/", ExamController.getAllExams);
// GET /api/exams/:id - Basic exam info
router.get("/:id", ExamController.getExamById);
// GET /api/exams/:id/student-view - Exam + my submission + status (for students)
router.get("/:id/student-view", ExamController.getExamStudentView);
router.post("/", ExamController.createExam);
router.put("/:id", ExamController.updateExam);
router.delete("/:id", ExamController.deleteExam);

// GET /api/exams/:id/questions - Questions for exam (Teacher: with answers, Student: without answers)
// Query: ?page=1&limit=20
router.get("/:id/questions", ExamController.getExamQuestions);

// PATCH /api/exams/:id/status - Cập nhật trạng thái bài thi
// Body: { status: "open" | "closed" }
router.patch("/:id/status", ExamController.updateExamStatus);

// === EXAM STATISTICS & SUMMARY ===
// GET /api/exams/:id/stats - Thống kê bài thi
router.get("/:id/stats", ExamController.getExamStats);

// GET /api/exams/:id/submissions - All submissions for exam (teacher only)
// Query: ?status=completed&studentId=123&page=1&limit=20
router.get("/:id/submissions", ExamController.getExamSubmissions);

// === QUESTIONS ===
// POST /api/exams/:id/questions - Tạo câu hỏi mới (hỗ trợ single hoặc multiple)
// Body: { questions: [{noiDung, diemToiDa, loaiCauHoi, luaChons: [...]}] }
// Hoặc: {noiDung, diemToiDa, loaiCauHoi, luaChons: [...]} cho single question
router.post("/:id/questions", QuestionController.createQuestion);

// PUT /api/exams/questions/:id - Update câu hỏi (trả về object đã update)
router.put("/questions/:id", QuestionController.updateQuestion);

// DELETE /api/exams/questions/:id - Xóa câu hỏi
router.delete("/questions/:id", QuestionController.deleteQuestion);

export default router;