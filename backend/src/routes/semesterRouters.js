import express from "express";
import SemesterController from "../controllers/semesterController.js";

const router = express.Router();

// === SEMESTERS ===
// GET /api/semesters?namhoc=123&active=true
router.get("/", SemesterController.getAllSemesters);
router.get("/current", SemesterController.getCurrentSemester);
router.get("/:id", SemesterController.getSemesterById);

export default router;