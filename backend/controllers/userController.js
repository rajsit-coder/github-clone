const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const Repository = require("../models/repoModel");

dotenv.config();

// ── Auth ───────────────────────────────────────────────

async function signup(req, res) {
    const { username, password, email } = req.body;

    try {
        if (!username || !password || !email) {
            return res.status(400).json({ message: "Username, email and password are required!" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
        });

        res.status(201).json({ token, userId: newUser._id });
    } catch (err) {
        console.error("Error during signup:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
        });

        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Server error" });
    }
}

// ── Profile ────────────────────────────────────────────

async function getAllUsers(req, res) {
    try {
        // password is stripped automatically via the toJSON override
        const users = await User.find({})
            .populate("repositories", "name description visibility")
            .select("-password");
        res.json(users);
    } catch (err) {
        console.error("Error during fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function getUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        const user = await User.findById(currentID)
            .populate("repositories", "name description visibility owner")
            .populate("followedUsers", "username email")
            .populate("starRepos", "name description visibility owner");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // toJSON strips the password
        res.json(user);
    } catch (err) {
        console.error("Error during fetching user:", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function updateUserProfile(req, res) {
    const currentID = req.params.id;
    const { email, password } = req.body;

    try {
        const user = await User.findById(currentID);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
        res.json({ message: "Profile updated successfully!", user: updatedUser });
    } catch (err) {
        console.error("Error during update:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}

async function deleteUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        const result = await User.findByIdAndDelete(currentID);

        if (!result) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error during delete:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}

// ── Follow / Unfollow ──────────────────────────────────

async function followUser(req, res) {
    const targetUserId = req.params.id;
    const currentUserId = req.userId; // set by authenticate middleware

    try {
        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself!" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        const currentUser = await User.findById(currentUserId);
        const alreadyFollowing = currentUser.followedUsers.includes(targetUserId);

        if (alreadyFollowing) {
            // unfollow
            currentUser.followedUsers.pull(targetUserId);
        } else {
            // follow
            currentUser.followedUsers.push(targetUserId);
        }

        await currentUser.save();
        res.json({
            message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
            followedUsers: currentUser.followedUsers,
        });
    } catch (err) {
        console.error("Error during follow:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}

// ── Star / Unstar Repository ───────────────────────────

async function starRepository(req, res) {
    const repoId = req.params.id;
    const currentUserId = req.userId;

    try {
        const repository = await Repository.findById(repoId);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found!" });
        }

        const currentUser = await User.findById(currentUserId);
        const alreadyStarred = currentUser.starRepos.includes(repoId);

        if (alreadyStarred) {
            currentUser.starRepos.pull(repoId);
        } else {
            currentUser.starRepos.push(repoId);
        }

        await currentUser.save();
        res.json({
            message: alreadyStarred ? "Repository unstarred" : "Repository starred",
            starRepos: currentUser.starRepos,
        });
    } catch (err) {
        console.error("Error during starring:", err.message);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    followUser,
    starRepository,
};
