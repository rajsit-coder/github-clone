const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

const userRouter = express.Router();

// Public routes (no auth needed)
userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Profile routes — viewing is public, mutations require auth
userRouter.get("/userProfile/:id", userController.getUserProfile);
userRouter.patch("/updateProfile/:id", authenticate, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", authenticate, userController.deleteUserProfile);

// Follow / star — require auth
userRouter.patch("/user/follow/:id", authenticate, userController.followUser);
userRouter.patch("/user/star/:id", authenticate, userController.starRepository);

module.exports = userRouter;
