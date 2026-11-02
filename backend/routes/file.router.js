const express = require("express");
const fileController = require("../controllers/fileController");
const { authenticate } = require("../middleware/authMiddleware");

const fileRouter = express.Router();

// Repository-scoped routes — :id is the repository id
fileRouter.post("/file/create/:id", authenticate, fileController.createFile);
fileRouter.get("/file/all/:id", fileController.getAllFiles);

// Single-file routes — :id is the file id
fileRouter.get("/file/:id", fileController.getFileById);
fileRouter.put("/file/update/:id", authenticate, fileController.updateFileById);
fileRouter.delete("/file/delete/:id", authenticate, fileController.deleteFileById);

module.exports = fileRouter;
