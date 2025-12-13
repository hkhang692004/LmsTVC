import express from "express";
import ContentController from "../controllers/contentController.js";
import { uploadMultiple } from "../middlewares/upload.js";
import { checkLogin } from "../middlewares/auth.js";

const router = express.Router();

// === CONTENT (NoiDung) - Main Operations ===
// GET /api/content/:id?includeChildren=true&recursive=false - Lấy content với children
router.get("/:id", ContentController.getContentById);
// GET /api/content/:id/posts - Lấy forum với direct posts only (Forum page)
router.get("/:id/posts", ContentController.getForumPosts);
// GET /api/content/:id/comments - Lấy post với all nested comments (ForumContent page)
router.get("/:id/comments", ContentController.getCommentsByContentId);
// GET /api/content/:id/files - Lấy folder children documents (Directory page)
router.get("/:id/files", ContentController.getFolderFiles);
// GET /api/content/:id/submissions - Lấy bài nộp của tôi cho bài tập (student)
router.get("/:id/submissions", checkLogin, ContentController.getMySubmissions);
// GET /api/content/:id/assignment-view - Lấy bài tập + bài nộp của tôi (student view)
router.get("/:id/assignment-view", ContentController.getAssignmentView);
// GET /api/content/files/:fileId/download - Download file with correct filename
router.get("/files/:fileId/download", ContentController.downloadFile);

// === CONTENT CRUD ===
// POST /api/content/ - Create content (set idNoiDungCha for child content) - Requires login
router.post("/", checkLogin, uploadMultiple('files'), ContentController.createContent);
// PUT /api/content/:id - Update with optional files (multipart/form-data) - Requires login
router.put("/:id", checkLogin, uploadMultiple('files'), ContentController.updateContent);
// DELETE /api/content/:id - Auto delete related files - Requires login
router.delete("/:id", checkLogin, ContentController.deleteContent);

// === CONTENT STATUS MANAGEMENT ===
// PUT /api/content/:id/status - Change status (an, daNop, treHan) - Requires login
router.put("/:id/status", checkLogin, ContentController.changeContentStatus);



export default router;
