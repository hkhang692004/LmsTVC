import express from "express";
import TopicController from "../controllers/topicController.js";

const router = express.Router();

// === TOPICS (NoiDung) - Main Operations ===
// GET /api/content/topics?chudeId=123&loaiNoiDung=taiLieu&trangThai=an
router.get("/topics", TopicController.getAllTopics);
// GET /api/content/topics/:id - Include files automatically
router.get("/topics/:id", TopicController.getTopicById);
// POST /api/content/topics - Create with optional files (multipart/form-data)
router.post("/topics", TopicController.createTopic);
// PUT /api/content/topics/:id - Update with optional files (multipart/form-data)  
router.put("/topics/:id", TopicController.updateTopic);
// DELETE /api/content/topics/:id - Auto delete related files
router.delete("/topics/:id", TopicController.deleteTopic);

// === TOPIC STATUS MANAGEMENT ===
// PUT /api/content/topics/:id/status - Change status (an, daNop, treHan)
router.put("/topics/:id/status", TopicController.changeTopicStatus);

// === HIERARCHICAL STRUCTURE ===
// GET /api/content/topics/:id/children - Get child topics (replies, submissions)
router.get("/topics/:id/children", TopicController.getChildTopics);
// POST /api/content/topics/:id/reply - Create reply to topic
router.post("/topics/:id/reply", TopicController.replyToTopic);
// GET /api/content/topics/:id/submissions - Get assignment submissions
router.get("/topics/:id/submissions", TopicController.getTopicSubmissions);

// === FILE UTILITIES (Optional) ===
// GET /api/content/files/:id/download - Download specific file by fileId
router.get("/files/:id/download", TopicController.downloadFile);
// DELETE /api/content/files/:id - Delete specific file by fileId
router.delete("/files/:id", TopicController.deleteFile);



export default router;