// backend/routes/auth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const router = express.Router();
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Helper function — generates a JWT token that expires in 7 days
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET,
    { expiresIn: '7d' });
// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        // Create the user but mark them as unverified
        const user = await User.create({
            name,
            email,
            password,
            role: 'member',
            isVerified: false,
            verificationToken: hashedToken
        });

        // Create verification URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

        const message = `Welcome to My Portfolio!\n\nPlease click the link below to verify your email address and activate your account:\n\n${verifyUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify Your Email Address',
                message,
            });
            return res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
        } catch (err) {
            // If the email fails to send, delete the user so they can try again
            await User.findByIdAndDelete(user._id);
            console.error("NODEMAILER ERROR:", err);
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

    // ── GET /api/auth/verify-email/:token ─────────────────────────
    router.get('/verify-email/:token', async (req, res) => {
        try {
            // Hash the token from the URL to compare it with the DB
            const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
            const user = await User.findOne({ verificationToken });
    
            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired verification token' });
            }
    
            // Mark user as verified and clear the token
            user.isVerified = true;
            user.verificationToken = undefined;
            await user.save();
    
            res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });
    
    // ── POST /api/auth/login ──────────────────────────────────────
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    
            // Block unverified users
            if (!user.isVerified) {
                return res.status(403).json({ message: 'Please check your email and verify your account before logging in.' });
            }
    
            if (user.status === 'inactive') return res.status(403).json({ message: 'Your account is deactivated. Please contact the admin.' });
    
            const match = await user.matchPassword(password);
            if (!match) return res.status(400).json({ message: 'Invalid email or password' });
    
            res.json({
                token: generateToken(user._id),
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic }
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });
// ── GET /api/auth/me
// Returns the currently logged-in user's data (requires token)
            router.get('/me', protect, async (req, res) => {
                const user = await User.findById(req.user._id).select('-password');
                res.json(user);
            });
// ── PUT /api/auth/profile ─────────────────────────────────────
// Update name, bio, or upload a new profile picture
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
    try {
        const update = {};
        if (req.body.name) update.name = req.body.name;
        if (req.body.bio) update.bio = req.body.bio;
        if (req.file) update.profilePic = req.file.path;

        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { $set: update },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// ── PUT /api/auth/change-password ────────────────────────────
router.put('/change-password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);
        const match = await user.matchPassword(currentPassword);
        if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
            user.password = newPassword; // pre-save hook will hash this
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } catch (err) { res.status(500).json({ message: err.message }); }
    });
    module.exports = router
// ── POST /api/auth/forgot-password ────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'There is no user with that email' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message,
            });
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            // 👉 ADD THIS LINE:
            console.error("NODEMAILER ERROR:", err);

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (err) {
        // 👉 ADD THIS LINE:
        console.error("FORGOT PASSWORD ROUTE ERROR:", err);

        res.status(500).json({ message: err.message });
    }
});

// ── PUT /api/auth/reset-password/:token ───────────────────────
router.put('/reset-password/:token', async (req, res) => {
    try {
        // Hash the token from the URL to compare it with the DB
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }, // Check if it hasn't expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password (assuming your User model has a pre-save hook that hashes passwords)
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});