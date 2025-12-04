import express from "express";
import ChatController from "../controllers/chatController.js";
import { uploadMultiple } from "../middlewares/upload.js";

const router = express.Router();

// === CHAT MANAGEMENT ===
// GET /api/chats/conversations?limit=10
router.get("/conversations", ChatController.getConversations);

// GET /api/chats?nguoinhan=456&lastTime=xxx
router.get("/", ChatController.getChats);

// POST /api/chats - Gửi tin nhắn (có thể kèm file)
router.post("/", uploadMultiple('files'), ChatController.sendMessage);

// PUT /api/chats/:id - Sửa tin nhắn
router.put("/:id", ChatController.updateMessage);

// DELETE /api/chats/:id - Xóa tin nhắn
router.delete("/:id", ChatController.deleteMessage);               

export default router;