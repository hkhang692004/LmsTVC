import express from "express";
import ChatController from "../controllers/chatController.js";

const router = express.Router();

// === CHAT MANAGEMENT ===
// GET /api/chats/conversations?limit=10
router.get("/conversations", ChatController.getConversations);

// GET /api/chats?nguoigui=123&nguoinhan=456&lastTime=xxx
router.get("/", ChatController.getChats);

// POST /api/chats - Gửi tin nhắn
router.post("/", ChatController.sendMessage);

// PUT /api/chats/:id - Sửa tin nhắn
router.put("/:id", ChatController.updateMessage);

// DELETE /api/chats/:id - Xóa tin nhắn
router.delete("/:id", ChatController.deleteMessage);

// === READ STATUS ===
// POST /api/chats/:id/read - Đánh dấu đã đọc
router.post("/:id/read", ChatController.markAsRead);

// GET /api/chats/unread - Tin nhắn chưa đọc
router.get("/unread", ChatController.getUnreadMessages);               

export default router;