const mongoose = require("mongoose");

const sharedFromSchema = new mongoose.Schema(
    {
        originalPostId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
        originalAuthorName: { type: String, trim: true, default: "" },
        originalAuthorPic: { type: String, default: "" },
        originalCreatedAt: { type: Date, default: null },
        originalTitle: { type: String, trim: true, default: "" },
        originalBody: { type: String, default: "" },
        originalImage: { type: String, default: "" },
    },
    { _id: false }
);

const postSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, default: "" },
        body: { type: String, required: true },
        image: { type: String, default: "" },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["published", "removed"], default: "published" },
        likesCount: { type: Number, default: 0 },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        sharedFrom: { type: sharedFromSchema, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);