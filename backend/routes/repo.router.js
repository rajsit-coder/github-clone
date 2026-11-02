const express = require("express");
const ctrl    = require("../controllers/repoController");
const { authenticate } = require("../middleware/authMiddleware");

const repoRouter = express.Router();

// Public reads
repoRouter.get("/repo/all",               ctrl.getAllRepositories);
repoRouter.get("/repo/user/:userId",       ctrl.fetchRepositoryForCurrentUser);
repoRouter.get("/repo/name/:name",         ctrl.fetchRepositoryByName);
repoRouter.get("/repo/:id",               ctrl.fetchRepositoryById);
repoRouter.get("/repo/:id/collaborators", ctrl.getCollaborators);

// Authenticated mutations
repoRouter.post  ("/repo/create",                 authenticate, ctrl.createRepository);
repoRouter.post  ("/repo/fork/:id",               authenticate, ctrl.forkRepository);
repoRouter.put   ("/repo/update/:id",             authenticate, ctrl.updateRepositoryById);
repoRouter.delete("/repo/delete/:id",             authenticate, ctrl.deleteRepositoryById);
repoRouter.patch ("/repo/toggle/:id",             authenticate, ctrl.toggleVisibilityById);
repoRouter.post  ("/repo/:id/collaborator",       authenticate, ctrl.addCollaborator);
repoRouter.delete("/repo/:id/collaborator/:userId", authenticate, ctrl.removeCollaborator);

module.exports = repoRouter;
