import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Reveal from "../components/Reveal";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import "./styles/AuthPages.css";

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { notification, showNotification, closeNotification } = useNotification();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) return showNotification("Password must be at least 6 characters", "error");
        if (password !== confirmPassword) return showNotification("Passwords do not match", "error");

        try {
            setSubmitting(true);
            await api.put(`/auth/reset-password/${token}`, { password });
            showNotification("Password reset successful!", "success");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Invalid or expired token", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="reset-password-page">
            <Notification open={notification.open} message={notification.message} type={notification.type} onClose={closeNotification} />
            <main>
                <Reveal direction="up">
                    <section>
                        <h2>Reset Password</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label>New Password:</label>
                                <div className="password-wrap">
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="password-input" />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Confirm New Password:</label>
                                <div className="password-wrap">
                                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="password-input" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting}>
                                {submitting ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </section>
                </Reveal>
            </main>
        </div>
    );
}