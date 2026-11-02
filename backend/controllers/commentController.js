const Comment    = require("../models/commentModel");
const Issue      = require("../models/issueModel");
const Repository = require("../models/repoModel");

const createComment = async (req, res) => {
    const { id } = req.params; // issue id
    const { content } = req.body;
    try {
        if (!content?.trim()) return res.status(400).json({ error: "Comment cannot be empty!" });
        const issue = await Issue.findById(id);
        if (!issue) return res.status(404).json({ error: "Issue not found!" });

        const comment = await Comment.create({ content: content.trim(), author: req.userId, issue: id });
        const populated = await Comment.findById(comment._id).populate("author", "username email");
        res.status(201).json(populated);
    } catch (err) {
        console.error("createComment:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const getCommentsByIssue = async (req, res) => {
    try {
        const comments = await Comment.find({ issue: req.params.id })
            .populate("author", "username email")
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) {
        console.error("getCommentsByIssue:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found!" });

        // Author can delete their own comment; owner/collab can also delete
        const isAuthor = String(comment.author) === String(req.userId);
        if (!isAuthor) {
            const issue = await Issue.findById(comment.issue);
            if (issue) {
                const repo = await Repository.findById(issue.repository);
                if (repo) {
                    const isOwner  = String(repo.owner) === String(req.userId);
                    const isCollab = repo.collaborators.some((c) => String(c) === String(req.userId));
                    if (!isOwner && !isCollab)
                        return res.status(403).json({ error: "Permission denied!" });
                }
            }
        }
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: "Comment deleted" });
    } catch (err) {
        console.error("deleteComment:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { createComment, getCommentsByIssue, deleteComment };
