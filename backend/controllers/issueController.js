const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");

const createIssue = async (req, res) => {
    const { id } = req.params; // repository id from the URL
    const { title, description } = req.body;

    try {
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required!" });
        }

        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        const issue = new Issue({
            title,
            description,
            repository: id,
        });

        await issue.save();

        // Maintain the relationship: add issue to repository's issues array
        repository.issues.push(issue._id);
        await repository.save();

        res.status(201).json(issue);
    } catch (err) {
        console.error("Error in creating issue:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const updateIssueById = async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        if (title) issue.title = title;
        if (description) issue.description = description;
        if (status) issue.status = status;

        await issue.save();

        res.json(issue);
    } catch (err) {
        console.error("Error in updating issue:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const issue = await Issue.findByIdAndDelete(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        // Remove issue from the repository's issues array
        await Repository.findByIdAndUpdate(issue.repository, {
            $pull: { issues: issue._id },
        });

        res.json({ message: "Issue deleted successfully" });
    } catch (err) {
        console.error("Error in deleting issue:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const getAllIssues = async (req, res) => {
    const { id } = req.params; // repository id from the URL

    try {
        const issues = await Issue.find({ repository: id });

        if (!issues || issues.length === 0) {
            return res.status(404).json({ error: "No issues found for this repository!" });
        }

        res.json(issues);
    } catch (err) {
        console.error("Error in fetching issues:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const getIssueById = async (req, res) => {
    const { id } = req.params;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        res.json(issue);
    } catch (err) {
        console.error("Error in fetching issue:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,
};
