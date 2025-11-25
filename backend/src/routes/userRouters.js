import express from "express";
import UserController from "../controllers/userController.js";
import { checkLogin, checkAdmin, checkRole } from "../middlewares/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", UserController.loginUser);

// Protected routes (authentication required)
router.post("/logout", checkLogin, UserController.logoutUser);
router.get("/profile", checkLogin, UserController.getUserProfile);
router.get("/classes", checkLogin, UserController.getUserClasses);
router.post("/change-password", checkLogin, UserController.changePassword);

// Admin only routes
router.get("/", checkAdmin, UserController.getAllUsers);
router.post("/", checkAdmin, UserController.createUser);
router.get("/:id", checkRole(['admin', 'giangVien']), UserController.getUserById);
router.put("/:id", checkAdmin, UserController.updateUser);
router.delete("/:id", checkAdmin, UserController.deleteUser);

export default router;