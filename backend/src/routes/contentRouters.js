import express from "express";
import TopicController from "../controllers/topicController.js";
import ContentController from "../controllers/contentController.js";

const router = express.Router();

// === TOPICS (NoiDung) ===
// GET /api/content/topics?chudeId=123&loaiNoiDung=taiLieu&trangThai=an
router.get("/topics", TopicController.getAllTopics);
router.get("/topics/:id", TopicController.getTopicById);
router.post("/topics", TopicController.createTopic);
router.put("/topics/:id", TopicController.updateTopic);
router.delete("/topics/:id", TopicController.deleteTopic);

// === TOPIC STATUS MANAGEMENT ===
// PUT /api/content/topics/:id/status - Change status (an, daNop, treHan)
router.put("/topics/:id/status", TopicController.changeTopicStatus);

// === CONTENTS (NoiDungChiTiet) ===
// GET /api/content/contents?noiDung=123&loaiChiTiet=file
router.get("/contents", ContentController.getAllContents);
router.get("/contents/:id", ContentController.getContentById);
router.post("/contents", ContentController.createContent);
router.put("/contents/:id", ContentController.updateContent);
router.delete("/contents/:id", ContentController.deleteContent);

// === FILES MANAGEMENT ===
// GET /api/content/topics/:id/files - Get all files of a topic
router.get("/topics/:id/files", TopicController.getTopicFiles);
// POST /api/content/topics/:id/files - Upload file to topic
router.post("/topics/:id/files", TopicController.uploadTopicFile);
// GET /api/content/contents/:id/download - Download file content
router.get("/contents/:id/download", ContentController.downloadFile);
// DELETE /api/content/contents/:id - Delete file content
router.delete("/contents/:id", ContentController.deleteContent);

// === SEARCH & UTILITIES ===
// GET /api/content/search?q=keyword&loaiNoiDung=taiLieu&chudeId=123
router.get("/search", ContentController.searchContent);

export default router;