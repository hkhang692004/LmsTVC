import express from "express";
import ActivityController from "../controllers/activityController.js";

const router = express.Router();

// === ACTIVITIES ===
// GET /api/activities?lop=123&tungay=2024-01-01&denngay=2024-01-31
router.get("/", ActivityController.getAllActivities);
router.post("/", ActivityController.createActivity);
router.put("/:id", ActivityController.updateActivity);
router.delete("/:id", ActivityController.deleteActivity);

export default router;