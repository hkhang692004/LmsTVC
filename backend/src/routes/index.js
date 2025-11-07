import express from "express";
const router = express.Router();

const userRoutes = require("./userRouters");

router.use("/users", userRoutes);

module.exports = router;
