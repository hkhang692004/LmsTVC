import express from "express";
const router = express.Router();
const UserController = require("../controllers/user.controller");

router.get("/", UserController.createUser);

module.exports = router;
