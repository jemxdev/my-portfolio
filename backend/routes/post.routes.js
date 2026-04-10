const express = require("express");
const Post = require("../models/Post");
const { protect } = require("../middleware/auth.middleware");
const { memberOrAdmin } = require("../middleware/role.middleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find({ status: "published" })
            .populate("author", "name profilePic")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "name profilePic");
        if (!post || post.status === "removed") {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", protect, memberOrAdmin, upload.single("image"), async (req, res) => {
    try {
        const { title, body } = req.body;
        const image = req.file ? req.file.filename : "";

        let sharedFrom = null;
        if (req.body.sharedFrom) {
            try {
                const parsed =
                    typeof req.body.sharedFrom === "string"
                        ? JSON.parse(req.body.sharedFrom)
                        : req.body.sharedFrom;

                sharedFrom = {
                    originalPostId: parsed?.originalPostId || null,
                    originalAuthorName: parsed?.originalAuthorName || "",
                    originalAuthorPic: parsed?.originalAuthorPic || "",
                    originalCreatedAt: parsed?.originalCreatedAt || null,
                    originalTitle: parsed?.originalTitle || "",
                    originalBody: parsed?.originalBody || "",
                    originalImage: parsed?.originalImage || "",
                };
            } catch {
                sharedFrom = null;
            }
        }

        const post = await Post.create({
            title,
            body,
            image,
            author: req.user._id,
            likesCount: 0,
            likedBy: [],
            sharedFrom,
        });

        await post.populate("author", "name profilePic");
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id", protect, memberOrAdmin, upload.single("image"), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isOwner = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not authorized" });

        if (req.body.title) post.title = req.body.title;
        if (req.body.body) post.body = req.body.body;
        if (req.file) post.image = req.file.filename;

        await post.save();
        await post.populate("author", "name profilePic");

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/:id", protect, memberOrAdmin, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isOwner = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not authorized" });

        await post.deleteOne();
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/:id/like", protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const uid = req.user._id.toString();
        const hasLiked = (post.likedBy || []).some((id) => id.toString() === uid);

        if (hasLiked) {
            post.likedBy = post.likedBy.filter((id) => id.toString() !== uid);
            post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
        } else {
            post.likedBy.push(req.user._id);
            post.likesCount = (post.likesCount || 0) + 1;
        }

        await post.save();

        res.json({
            _id: post._id,
            likesCount: post.likesCount,
            liked: !hasLiked,
        });
    } catch (err) {
        res.status(500).json({ message: err.message || "Failed to toggle like" });
    }
});

module.exports = router;