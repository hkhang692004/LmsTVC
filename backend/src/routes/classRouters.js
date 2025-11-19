import express from "express";
import ClassController from "../controllers/classController.js";
const router = express.Router();
// Lop basic routes
router.get("/", ClassController.getAllClasses);                    // GET /classes?hocKyId=123&giangVienId=456&q=toan
router.get("/me", ClassController.getClassesForCurrentUser);       // Lớp của user hiện tại
router.get("/:id", ClassController.getClassById);                 // Chi tiết lớp
router.put("/:id", ClassController.updateClass);                  // Cập nhật thông tin lớp
router.get("/:id/stats", ClassController.getClassStats);          // Thống kê lớp
router.get("/:id/overview", ClassController.getClassOverview);    // Tổng quan lớp

// Student management
router.get("/:id/students", ClassController.getStudentsInClass);
router.post("/:id/students", ClassController.addStudentToClass);
router.put("/:id/students", ClassController.updateStudentInClass);
router.delete("/:id/students", ClassController.removeStudentFromClass);

// Bulk student operations
router.post("/:id/students/bulk", ClassController.addStudentsBulk);
router.put("/:id/students/bulk", ClassController.updateStudentsBulk);
router.delete("/:id/students/bulk", ClassController.removeStudentsBulk);
export default router;

