import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Reveal from "../components/Reveal";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import "./styles/AuthPages.css";

export default function ForgotPasswordPage() {
    const { notification, showNotification, closeNotification } = useNotification();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return showNotification("Please enter your email", "warning");

        try {
            setSubmitting(true);
            await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
            setSuccess(true);
            showNotification("Reset link sent to your email!", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to send reset email", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <Notification open={notification.open} message={notification.message} type={notification.type} onClose={closeNotification} />
            <main>
                <Reveal direction="up">
                    <section className="auth-card">
                        <h2>Forgot Password</h2>
                        {success ? (
                            <p style={{ marginTop: 15 }}>Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.</p>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <p style={{ marginBottom: 15 }}>Enter your email address and we will send you a link to reset your password.</p>
                                <div className="form-field">
                                    <label>Email:</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                                </div>
                                <button type="submit" disabled={submitting}>
                                    {submitting ? "Sending..." : "Send Reset Link"}
                                </button>
                                <p style={{ marginTop: 12 }}>Remember your password? <Link to="/login">Login</Link></p>
                            </form>
                        )}
                    </section>
                </Reveal>
            </main>
        </div>
    );
}