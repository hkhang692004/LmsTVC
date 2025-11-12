import express from "express";
import UserController from "../controllers/userController.js";

const router = express.Router();

// User CRUD routes
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// User specific routes
router.get("/:id/profile", UserController.getUserProfile);
router.get("/:id/classes", UserController.getUserClasses);
router.post("/login", UserController.loginUser);

export default router;
