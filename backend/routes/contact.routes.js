const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const created = await Message.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
        });

        res.status(201).json({
            message: "Message sent successfully",
            data: created,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;