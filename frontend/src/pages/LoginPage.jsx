import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Reveal from "../components/Reveal";
import ScrollProgress from "../components/ScrollProgress";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import "./styles/ContactPage.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const { notification, showNotification, closeNotification } = useNotification();

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const next = {};
        const email = form.email.trim().toLowerCase();

        if (!email) next.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";

        if (!form.password) next.password = "Password is required";
        else if (form.password.length < 6) next.password = "Password must be at least 6 characters";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!validate()) return;

        try {
            setSubmitting(true);

            const payload = {
                email: form.email.trim().toLowerCase(),
                password: form.password,
            };

            const { data } = await api.post("/auth/login", payload);

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    _id: data.user?._id || "",
                    name: data.user?.name || "",
                    email: data.user?.email || "",
                    role: data.user?.role === "admin" ? "admin" : "user",
                    profilePic: data.user?.profilePic || "",
                })
            );

            window.dispatchEvent(new Event("auth-changed"));
            showNotification("Login successful!", "success");
            setTimeout(() => navigate("/"), 700);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Login failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <ScrollProgress />
            <Notification
                open={notification.open}
                message={notification.message}
                type={notification.type}
                duration={notification.duration}
                onClose={closeNotification}
            />

            <main>
                <Reveal direction="up">
                    <section>
                        <h2>Login</h2>

                        <form onSubmit={handleSubmit}>
                            <div className={`form-field ${errors.email ? "has-error" : ""}`}>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                />
                                {errors.email && <span className="error">{errors.email}</span>}
                            </div>

                            <div className={`form-field ${errors.password ? "has-error" : ""}`}>
                                <label>Password:</label>
                                <div className="password-wrap">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        placeholder="Enter password"
                                        className="password-input"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && <span className="error">{errors.password}</span>}
                            </div>

                            <button type="submit" disabled={submitting}>
                                {submitting ? "Logging in..." : "Login"}
                            </button>

                            <p style={{ marginTop: 12 }}>
                                No account? <Link to="/register">Register</Link>
                            </p>
                        </form>
                    </section>
                </Reveal>
            </main>
        </div>
    );
}