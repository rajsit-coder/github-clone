const express = require("express");
const issueController = require("../controllers/issueController");
const { authenticate } = require("../middleware/authMiddleware");

const issueRouter = express.Router();

// Repository-scoped routes — :id is the repository id
issueRouter.post("/issue/create/:id", authenticate, issueController.createIssue);
issueRouter.get("/issue/all/:id", issueController.getAllIssues);

// Single-issue routes — :id is the issue id
issueRouter.put("/issue/update/:id", authenticate, issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", authenticate, issueController.deleteIssueById);
issueRouter.get("/issue/single/:id", issueController.getIssueById);

module.exports = issueRouter;
