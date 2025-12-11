import express from "express";
import SubmissionController from "../controllers/submissionController.js";

const router = express.Router();

// === SUBMISSION MANAGEMENT (BaiLam) ===
// GET /api/submissions/:id - Chi tiết bài làm để resume sau khi F5 cho sinh viên hoặc xem bài làm cho giảng viên
// Response: { submission: { student, exam, cauHoiDaLam: [{ cauHoi, luaChonDaChons }] }, progress, timeInfo }
router.get("/:id", SubmissionController.getSubmissionById);

// POST /api/submissions - Bắt đầu làm bài (tạo BaiLam)
// Body: { examId } 
// Response: { submissionId, startTime, duration, serverTime, totalQuestions, questions }
router.post("/", SubmissionController.startExam);

// POST /api/submissions/:id/submit - Nộp bài (cập nhật thoiGianNop, tính điểm)
router.post("/:id/submit", SubmissionController.submitExam);

// === ANSWER MANAGEMENT (BaiLamCauHoi + LuaChonDaChon) ===
// POST /api/submissions/:id/answers/:questionId - Trả lời/Sửa câu hỏi (upsert)
// Body: { selectedChoices: [luaChonId1, luaChonId2] }
// Response: { success: true, progress: { answered: 5, total: 20, percentage: 25 } }
router.post("/:id/sync-answers", SubmissionController.answerQuestion);

export default router;