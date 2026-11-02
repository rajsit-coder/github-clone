const express = require("express");

const mainRouter = express.Router();
mainRouter.use(require("./user.router"));
mainRouter.use(require("./repo.router"));
mainRouter.use(require("./issue.router"));
mainRouter.use(require("./file.router"));
mainRouter.use(require("./comment.router"));
mainRouter.use(require("./search.router"));

mainRouter.get("/", (_req, res) => res.send("Welcome"));

module.exports = mainRouter;
