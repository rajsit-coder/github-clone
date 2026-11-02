const Repository = require("../models/repoModel");
const User       = require("../models/userModel");

/**
 * GET /search?q=query&type=repositories|users|all
 * Returns matched repos and/or users.
 */
const search = async (req, res) => {
    const { q = "", type = "all" } = req.query;
    const trimmed = q.trim();

    if (!trimmed) {
        return res.json({ repositories: [], users: [] });
    }

    const regex = { $regex: trimmed, $options: "i" };

    try {
        let repositories = [];
        let users = [];

        if (type === "all" || type === "repositories") {
            repositories = await Repository.find({
                visibility: true,
                $or: [{ name: regex }, { description: regex }],
            })
                .populate("owner", "username")
                .select("name description owner visibility updatedAt createdAt")
                .limit(20);
        }

        if (type === "all" || type === "users") {
            users = await User.find({ username: regex })
                .select("username email repositories")
                .limit(10);
        }

        res.json({ repositories, users });
    } catch (err) {
        console.error("search:", err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { search };
