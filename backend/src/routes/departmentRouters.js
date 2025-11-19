import express from "express";
import DepartmentController from "../controllers/departmentController.js";

const router = express.Router();

// === DEPARTMENTS ===
// GET /api/departments?search=cntt
router.get("/", DepartmentController.getAllDepartments);
router.get("/:id", DepartmentController.getDepartmentById);

export default router;