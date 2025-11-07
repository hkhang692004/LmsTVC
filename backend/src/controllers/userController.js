import express from "express";
class UserController {
    createUser(req, res) {
        // Logic to create a user
        res.status(201).json({ message: "User created" });
    }
}
module.exports = new UserController();
