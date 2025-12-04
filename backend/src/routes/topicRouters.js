import express from "express";
import TopicController from "../controllers/topicController.js";

const router = express.Router();

// === TOPIC (ChuDe) - Main Operations ===
// GET /api/topics/:id - Get topic details gồm con bậc 0 của chủ đề đó
router.get("/:id", TopicController.getTopicById);
// POST /api/topics - Create new topic for a class
router.post("/", TopicController.createTopic);
// PUT /api/topics/:id - Update topic information
router.put("/:id", TopicController.updateTopic);
// DELETE /api/topics/:id - Delete topic (cascade delete contents)
router.delete("/:id", TopicController.deleteTopic);

export default router;