import express from "express";
import SubmissionController from "../controllers/submissionController.js";

const router = express.Router();

// === SUBMISSION MANAGEMENT (BaiLam) ===
// GET /api/submissions/:id - Chi tiết bài làm để resume sau khi F5  
// Response: { submission, exam, questions, answers, progress, timeInfo }
router.get("/:id", SubmissionController.getSubmissionById);

// POST /api/submissions - Bắt đầu làm bài (tạo BaiLam)
// Body: { examId } 
// Response: { submissionId, startTime, duration, serverTime, totalQuestions, questions }
router.post("/", SubmissionController.startExam);

// POST /api/submissions/:id/submit - Nộp bài (cập nhật thoiGianNop, tính điểm)
router.post("/:id/submit", SubmissionController.submitExam);

// DELETE /api/submissions/:id - Xóa bài làm (nếu chưa nộp)
router.delete("/:id", SubmissionController.deleteSubmission);

// === ANSWER MANAGEMENT (BaiLamCauHoi + LuaChonDaChon) ===
// GET /api/submissions/:id/answers - Lấy tất cả câu trả lời của bài làm
router.get("/:id/answers", SubmissionController.getSubmissionAnswers);

// POST /api/submissions/:id/answers/:questionId - Trả lời một câu hỏi
// Body: { selectedChoices: [luaChonId1, luaChonId2] }
// Response: { success: true, progress: { answered: 5, total: 20, percentage: 25 } }
router.post("/:id/answers/:questionId", SubmissionController.answerQuestion);

// PUT /api/submissions/:id/answers/:questionId - Sửa câu trả lời
// Body: { selectedChoices: [luaChonId1, luaChonId2] }
// Response: { success: true, progress: { answered: 5, total: 20, percentage: 25 } }
router.put("/:id/answers/:questionId", SubmissionController.updateAnswer);

// DELETE /api/submissions/:id/answers/:questionId - Bỏ trả lời câu hỏi
// Response: { success: true, progress: { answered: 4, total: 20, percentage: 20 } }
router.delete("/:id/answers/:questionId", SubmissionController.clearAnswer);

export default router;