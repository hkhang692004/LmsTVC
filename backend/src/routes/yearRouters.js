import express from "express";
import YearController from "../controllers/yearController.js";

const router = express.Router();

// === ACADEMIC YEARS (READ-ONLY - Đồng bộ từ hệ thống học vụ) ===
// GET /api/years?search=2024
router.get("/", YearController.getAllYears);
router.get("/current", YearController.getCurrentYear);
router.get("/:id", YearController.getYearById);

export default router;