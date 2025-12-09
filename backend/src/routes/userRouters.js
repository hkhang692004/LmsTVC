import express from "express";
import UserController from "../controllers/userController.js";
import { checkLogin, checkAdmin, checkRole } from "../middlewares/auth.js";
import { uploadSingle } from "../middlewares/upload.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", UserController.loginUser);

// Protected routes (authentication required)
router.post("/logout", checkLogin, UserController.logoutUser);
router.get("/profile", checkLogin, UserController.getUserProfile);
router.put("/profile", checkLogin, uploadSingle('avatar'), UserController.updateProfile);
router.get("/classes", checkLogin, UserController.getUserClasses);
router.post("/change-password", checkLogin, UserController.changePassword);

// Admin only routes
router.get("/", checkLogin, checkAdmin, UserController.getAllUsers);
router.post("/", checkLogin, uploadSingle('avatar'), UserController.createUser);
router.get("/:id", checkLogin, checkRole(['admin', 'giangVien']), UserController.getUserById);
router.put("/:id", checkLogin, uploadSingle('avatar'), UserController.updateUser);
router.delete("/:id", checkLogin, checkAdmin, UserController.deleteUser);

export default router;