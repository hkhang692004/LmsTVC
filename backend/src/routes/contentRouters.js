import express from "express";
import ContentController from "../controllers/contentController.js";
import { uploadMultiple } from "../middlewares/upload.js";

const router = express.Router();

// === CONTENT (NoiDung) - Main Operations ===
// GET /api/content/:id?includeChildren=true&recursive=false - Lấy content với children
router.get("/:id", ContentController.getContentById);
// GET /api/content/:id/assignment-view - Lấy bài tập + bài nộp của tôi (student view)
router.get("/:id/assignment-view", ContentController.getAssignmentView);

// === CONTENT CRUD ===
// POST /api/content/ - Create content (set idNoiDungCha for child content)
router.post("/", uploadMultiple('files'), ContentController.createContent);
// PUT /api/content/:id - Update with optional files (multipart/form-data)
router.put("/:id", uploadMultiple('files'), ContentController.updateContent);
// DELETE /api/content/:id - Auto delete related files
router.delete("/:id", ContentController.deleteContent);

// === CONTENT STATUS MANAGEMENT ===
// PUT /api/content/:id/status - Change status (an, daNop, treHan)
router.put("/:id/status", ContentController.changeContentStatus);



export default router;
