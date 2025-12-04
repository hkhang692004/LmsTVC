import express from "express";
import ClassController from "../controllers/classController.js";
const router = express.Router();
// Lop basic routes
router.get("/", ClassController.getAllClasses);                    // GET /classes?hocKyId=123&giangVienId=456&q=toan&page=&limit=
router.get("/me", ClassController.getClassesForCurrentUser);       // Lớp của user hiện tại
router.get("/:id", ClassController.getClassById);                 // Chi tiết lớp các chủ đề các con gốc của chủ đề đó

// Student management
router.get("/:id/students", ClassController.getStudentsInClass);
router.post("/:id/students", ClassController.addStudentToClass);
router.delete("/:id/students/:studentId", ClassController.removeStudentFromClass);

// Bulk student operations (useful for mass operations)
router.post("/:id/students/bulk", ClassController.addStudentsBulk);
router.delete("/:id/students/bulk", ClassController.removeStudentsBulk);

export default router;

