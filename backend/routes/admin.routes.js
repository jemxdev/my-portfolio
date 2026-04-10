const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Message = require("../models/Message");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect, adminOnly);

// GET /api/admin/users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } })
            .select("-password")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/users/:id/status
router.put("/users/:id/status", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role === "admin") {
            return res.status(404).json({ message: "User not found" });
        }

        user.status = user.status === "active" ? "inactive" : "active";
        await user.save();

        res.json({ message: `User is now ${user.status}`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/posts
router.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/posts/:id/remove
router.put("/posts/:id/remove", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.status = "removed";
        await post.save();

        res.json({ message: "Post has been removed", post });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/messages
router.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/messages/:id/read
router.put("/messages/:id/read", async (req, res) => {
    try {
        const msg = await Message.findById(req.params.id);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        msg.status = "read";
        await msg.save();

        res.json({ message: "Message marked as read", data: msg });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;