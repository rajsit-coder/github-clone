const express = require("express");
const ctrl    = require("../controllers/commentController");
const { authenticate } = require("../middleware/authMiddleware");

const commentRouter = express.Router();

commentRouter.get   ("/comment/all/:id",    ctrl.getCommentsByIssue);         // :id = issue
commentRouter.post  ("/comment/create/:id", authenticate, ctrl.createComment); // :id = issue
commentRouter.delete("/comment/delete/:id", authenticate, ctrl.deleteComment); // :id = comment

module.exports = commentRouter;
