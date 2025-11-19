import express from "express";
import SubjectController from "../controllers/subjectController.js";

const router = express.Router();

// === SUBJECTS (READ-ONLY - Đồng bộ từ hệ thống học vụ) ===
// GET /api/subjects?nganh=123&search=toan&page=1
router.get("/", SubjectController.getAllSubjects);
router.get("/:id", SubjectController.getSubjectById);

export default router;