const express = require("express");
const router = express.Router();

const User = require("../Model/UserModel");
const UserControllers = require("../Controllers/UserControllers");

router.get("/", UserControllers.getAllUsers); // Get all users
router.post("/", UserControllers.addUser); // Add a new user
router.post("/login", UserControllers.loginUser); // User login
router.get("/:id", UserControllers.getUserById); // Get user by ID
router.put("/:id", UserControllers.updateUser); // Update user by ID
router.delete("/:id", UserControllers.deleteUser); // Delete user by ID

module.exports = router;