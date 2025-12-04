import express from "express";
import nguoiDungRoutes from "./userRouters.js";
import classRoutes from "./classRouters.js";
import topicRoutes from "./topicRouters.js";
import contentRoutes from "./contentRouters.js";
import examRoutes from "./examRouters.js";
import submissionRoutes from "./submissionRouters.js";
import chatRoutes from "./chatRouters.js";
import scheduleRoutes from "./scheduleRouters.js";
import announcementRoutes from "./announcementRouters.js";
import subjectRoutes from "./subjectRouters.js";
import departmentRoutes from "./departmentRouters.js";
import semesterRoutes from "./semesterRouters.js";
import yearRoutes from "./yearRouters.js";

const router = express.Router();

// User management
router.use("/users", nguoiDungRoutes);

// Academic structure
router.use("/years", yearRoutes);                    // NamHoc
router.use("/semesters", semesterRoutes);            // HocKy  
router.use("/departments", departmentRoutes);        // Nganh
router.use("/subjects", subjectRoutes);              // MonHoc
router.use("/classes", classRoutes);                   // Lop

// Learning content - Topics & Contents
router.use("/topics", topicRoutes);                 // ChuDe management
router.use("/content", contentRoutes);               // NoiDung management (NoiDung + NoiDungChiTiet)

// Assessment - Exams & Submissions
router.use("/exams", examRoutes);                    // BaiKiemTra + CauHoi + LuaChon
router.use("/submissions", submissionRoutes);        // BaiLam + BaiLamCauHoi + LuaChonDaChon

// Communication
router.use("/chats", chatRoutes);                    // Chat + ChatFile
router.use("/notifications", announcementRoutes);    // ThongBao

// Activities
router.use("/activities", scheduleRoutes);           // LichHoatDong

export default router;
