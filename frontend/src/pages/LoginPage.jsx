import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Reveal from "../components/Reveal";
import ScrollProgress from "../components/ScrollProgress";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import "./styles/LoginPage.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const { notification, showNotification, closeNotification } = useNotification();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ email: "", password: "", code: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitText, setSubmitText] = useState("Login");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateStep1 = () => {
        const next = {};
        const email = form.email.trim().toLowerCase();
        if (!email) next.email = "Email is required";
        if (!form.password) next.password = "Password is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!validateStep1()) return;

        let waitTimer;
        let sleepTimer;

        try {
            setSubmitting(true);
            setSubmitText("Checking credentials...");

            // Timer 1: Fires after 3 seconds
            waitTimer = setTimeout(() => {
                setSubmitText("Waiting for server...");
            }, 3000);

            // Timer 2: Fires after 10 seconds
            sleepTimer = setTimeout(() => {
                setSubmitText("Waking up server, this may take around 50 seconds... Hang tight! 🚀");
            }, 10000);

            const payload = {
                email: form.email.trim().toLowerCase(),
                password: form.password,
            };

            const { data } = await api.post("/auth/login", payload);

            // Clear BOTH timers the exact millisecond the server replies!
            clearTimeout(waitTimer);
            clearTimeout(sleepTimer);

            if (data.requiresTwoFactor) {
                showNotification("Code sent to your email!", "success");
                setStep(2);
            }

        } catch (err) {
            showNotification(err?.response?.data?.message || "Login failed", "error");
        } finally {
            // Also clear them here just in case it crashed and jumped to the catch block
            clearTimeout(waitTimer);
            clearTimeout(sleepTimer);
            setSubmitting(false);
            setSubmitText("Login");
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (form.code.length !== 6) return showNotification("Code must be 6 digits", "warning");

        let wakeUpTimer;
        try {
            setSubmitting(true);
            setSubmitText("Verifying...");
            wakeUpTimer = setTimeout(() => setSubmitText("Waking up server... Hang tight! 🚀"), 5000);

            const payload = {
                email: form.email.trim().toLowerCase(),
                code: form.code.trim(),
            };

            const { data } = await api.post("/auth/verify-2fa", payload);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("auth-changed"));

            showNotification("Login successful!", "success");
            setTimeout(() => navigate("/"), 700);

        } catch (err) {
            showNotification(err?.response?.data?.message || "Invalid code", "error");
        } finally {
            clearTimeout(wakeUpTimer);
            setSubmitting(false);
            setSubmitText("Verify Code");
        }
    };

    return (
        <div className="login-page-container">
            <ScrollProgress />
            <Notification open={notification.open} message={notification.message} type={notification.type} onClose={closeNotification} />

            <main>
                <Reveal direction="up">
                    <h1>Login</h1>
                    <div className="title-underline"></div>
                    <div className="login-page">
                        {step === 1 ? (
                            <>
                                
                                <form onSubmit={handleLoginSubmit}>
                                    <div className={`form-field ${errors.email ? "has-error" : ""}`}>
                                        <label>Email:</label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" />
                                        {errors.email && <span className="error">{errors.email}</span>}
                                    </div>
                                    <div className={`form-field ${errors.password ? "has-error" : ""}`}>
                                        <label>Password:</label>
                                        <div className="password-wrap">
                                            <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} autoComplete="current-password" placeholder="Enter password" className="password-input" />
                                            <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
                                        </div>
                                        {errors.password && <span className="error">{errors.password}</span>}
                                    </div>
                                    <button type="submit" disabled={submitting}>{submitText}</button>

                                    <div className="links-container">
                                        <p>Forgot password? <Link to="/forgot-password">Reset it</Link></p>
                                        <p>No account? <Link to="/register">Register</Link></p>
                                    </div>
                                    <p style={{ fontSize: "0.85rem", color: "gray", textAlign: "center", marginBottom: "15px", marginTop: "-5px" }}>
                                        <strong>Secure Login:</strong> Passwords are safely hashed in our database.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <>
                                <h2>Enter Code</h2>
                                <p style={{ marginBottom: "15px", color: "var(--text-muted)", textAlign: "center", fontSize: "14px" }}>
                                    We sent a 6-digit code to <strong>{form.email}</strong>.
                                </p>
                                <form onSubmit={handleCodeSubmit}>
                                    <div className="form-field">
                                        <input
                                            type="text"
                                            name="code"
                                            value={form.code}
                                            onChange={handleChange}
                                            placeholder="123456"
                                            maxLength="6"
                                            style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "bold" }}
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={submitting}>{submitText === "Login" ? "Verify Code" : submitText}</button>
                                    <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
                                        Back to Login
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </Reveal>
            </main>
        </div>
    );
}