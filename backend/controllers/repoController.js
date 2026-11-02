const Repository = require("../models/repoModel");
const User       = require("../models/userModel");
const Issue      = require("../models/issueModel");
const File       = require("../models/fileModel");
const Comment    = require("../models/commentModel");

// ── CRUD ─────────────────────────────────────────────

const createRepository = async (req, res) => {
    const { name, description, visibility } = req.body;
    const owner = req.userId;
    try {
        if (!name) return res.status(400).json({ error: "Repository name is required!" });
        if (await Repository.findOne({ name }))
            return res.status(400).json({ error: "A repository with this name already exists!" });

        const repo = await Repository.create({
            name, description: description || "",
            visibility: visibility !== undefined ? visibility : true,
            owner, content: [], issues: [], collaborators: [], forkedFrom: null,
        });
        await User.findByIdAndUpdate(owner, { $push: { repositories: repo._id } });
        res.status(201).json({ message: "Repository created!", repositoryID: repo._id });
    } catch (err) {
        console.error("createRepository:", err);
        res.status(500).json({ error: "Server error!" });
    }
};

const getAllRepositories = async (req, res) => {
    try {
        const repos = await Repository.find({})
            .populate("owner", "username email")
            .populate("collaborators", "username email");
        res.json(repos);
    } catch (err) {
        console.error("getAllRepositories:", err);
        res.status(500).json({ error: "Server error!" });
    }
};

const fetchRepositoryById = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id)
            .populate("owner", "username email")
            .populate("issues")
            .populate("collaborators", "username email")
            .populate("forkedFrom", "name owner");
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        res.json(repo);
    } catch (err) {
        console.error("fetchRepositoryById:", err);
        res.status(500).json({ error: "Server error!" });
    }
};

const fetchRepositoryByName = async (req, res) => {
    try {
        const repo = await Repository.findOne({ name: req.params.name })
            .populate("owner", "username email")
            .populate("issues")
            .populate("collaborators", "username email");
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        res.json(repo);
    } catch (err) {
        console.error("fetchRepositoryByName:", err);
        res.status(500).json({ error: "Server error!" });
    }
};

const fetchRepositoryForCurrentUser = async (req, res) => {
    try {
        const repos = await Repository.find({ owner: req.params.userId })
            .populate("issues")
            .populate("owner", "username email");
        res.json({ message: "Repositories found!", repositories: repos });
    } catch (err) {
        console.error("fetchRepositoryForCurrentUser:", err);
        res.status(500).json({ error: "Server error!" });
    }
};

const updateRepositoryById = async (req, res) => {
    const { content, description } = req.body;
    try {
        const repo = await Repository.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        if (String(repo.owner) !== String(req.userId))
            return res.status(403).json({ error: "Permission denied!" });
        if (content)              repo.content.push(content);
        if (description !== undefined) repo.description = description;
        const updated = await repo.save();
        res.json({ message: "Repository updated!", repository: updated });
    } catch (err) {
        console.error("updateRepositoryById:", err);
        res.status(500).json({ error: "Server error!" });
    }
};

const toggleVisibilityById = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        if (String(repo.owner) !== String(req.userId))
            return res.status(403).json({ error: "Permission denied!" });
        repo.visibility = !repo.visibility;
        const updated = await repo.save();
        res.json({ message: "Visibility updated!", repository: updated });
    } catch (err) {
        console.error("toggleVisibilityById:", err);
        res.status(500).json({ error: "Server error!" });
    }
};

const deleteRepositoryById = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        if (String(repo.owner) !== String(req.userId))
            return res.status(403).json({ error: "Permission denied!" });

        const issueIds = repo.issues.map((i) => i._id || i);
        await Issue.deleteMany({ repository: req.params.id });
        await File.deleteMany({ repository: req.params.id });
        if (issueIds.length)
            await Comment.deleteMany({ issue: { $in: issueIds } });
        await User.findByIdAndUpdate(repo.owner, {
            $pull: { repositories: repo._id, starRepos: repo._id },
        });
        await Repository.findByIdAndDelete(req.params.id);
        res.json({ message: "Repository deleted successfully" });
    } catch (err) {
        console.error("deleteRepositoryById:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// ── Fork ─────────────────────────────────────────────

const forkRepository = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const original = await Repository.findById(id).populate("owner", "username");
        if (!original) return res.status(404).json({ error: "Repository not found!" });

        let forkName = original.name;
        let counter = 1;
        while (await Repository.findOne({ name: forkName })) {
            forkName = `${original.name}-${counter++}`;
        }

        const forked = await Repository.create({
            name: forkName, description: original.description,
            visibility: true, owner: userId,
            content: [], issues: [], collaborators: [], forkedFrom: id,
        });

        // Copy files
        const files = await File.find({ repository: id });
        for (const f of files) {
            await File.create({ filename: f.filename, content: f.content, repository: forked._id });
        }

        await User.findByIdAndUpdate(userId, { $push: { repositories: forked._id } });
        res.status(201).json({ message: "Forked!", repositoryID: forked._id });
    } catch (err) {
        console.error("forkRepository:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// ── Collaborators ─────────────────────────────────────

const getCollaborators = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id)
            .populate("collaborators", "username email");
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        res.json(repo.collaborators);
    } catch (err) {
        console.error("getCollaborators:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const addCollaborator = async (req, res) => {
    const { userId: collabId } = req.body;
    try {
        const repo = await Repository.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        if (String(repo.owner) !== String(req.userId))
            return res.status(403).json({ error: "Only the owner can add collaborators!" });
        if (String(repo.owner) === String(collabId))
            return res.status(400).json({ error: "Owner is already part of the repository!" });
        const user = await User.findById(collabId);
        if (!user) return res.status(404).json({ error: "User not found!" });
        if (repo.collaborators.some((c) => String(c) === String(collabId)))
            return res.status(400).json({ error: "User is already a collaborator!" });

        repo.collaborators.push(collabId);
        await repo.save();
        const updated = await Repository.findById(req.params.id)
            .populate("collaborators", "username email");
        res.json({ message: "Collaborator added!", collaborators: updated.collaborators });
    } catch (err) {
        console.error("addCollaborator:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const removeCollaborator = async (req, res) => {
    const { userId: collabId } = req.params;
    try {
        const repo = await Repository.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        if (String(repo.owner) !== String(req.userId))
            return res.status(403).json({ error: "Only the owner can remove collaborators!" });
        repo.collaborators = repo.collaborators.filter((c) => String(c) !== String(collabId));
        await repo.save();
        res.json({ message: "Collaborator removed!" });
    } catch (err) {
        console.error("removeCollaborator:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createRepository, getAllRepositories, fetchRepositoryById,
    fetchRepositoryByName, fetchRepositoryForCurrentUser,
    updateRepositoryById, toggleVisibilityById, deleteRepositoryById,
    forkRepository, getCollaborators, addCollaborator, removeCollaborator,
};
