const File       = require("../models/fileModel");
const Repository = require("../models/repoModel");

const canWrite = (repo, userId) =>
    String(repo.owner) === String(userId) ||
    repo.collaborators.some((c) => String(c) === String(userId));

const createFile = async (req, res) => {
    const { id } = req.params; // repo id
    const { filename, content } = req.body;
    try {
        if (!filename?.trim()) return res.status(400).json({ error: "Filename is required!" });
        const repo = await Repository.findById(id);
        if (!repo) return res.status(404).json({ error: "Repository not found!" });
        if (!canWrite(repo, req.userId))
            return res.status(403).json({ error: "Permission denied!" });
        if (await File.findOne({ repository: id, filename: filename.trim() }))
            return res.status(400).json({ error: "A file with this name already exists!" });

        const file = await File.create({ filename: filename.trim(), content: content || "", repository: id });
        res.status(201).json(file);
    } catch (err) {
        console.error("createFile:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const getAllFiles = async (req, res) => {
    try {
        const files = await File.find({ repository: req.params.id })
            .select("-content").sort({ filename: 1 });
        res.json(files);
    } catch (err) {
        console.error("getAllFiles:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const getFileById = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ error: "File not found!" });
        res.json(file);
    } catch (err) {
        console.error("getFileById:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const updateFileById = async (req, res) => {
    const { filename, content } = req.body;
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ error: "File not found!" });
        const repo = await Repository.findById(file.repository);
        if (!canWrite(repo, req.userId))
            return res.status(403).json({ error: "Permission denied!" });
        if (filename) file.filename = filename.trim();
        if (content !== undefined) file.content = content;
        await file.save();
        res.json(file);
    } catch (err) {
        console.error("updateFileById:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteFileById = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ error: "File not found!" });
        const repo = await Repository.findById(file.repository);
        if (!canWrite(repo, req.userId))
            return res.status(403).json({ error: "Permission denied!" });
        await File.findByIdAndDelete(req.params.id);
        res.json({ message: "File deleted" });
    } catch (err) {
        console.error("deleteFileById:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { createFile, getAllFiles, getFileById, updateFileById, deleteFileById };
