import { useState } from "react";
import "./styles/RegisterPage.css";
import { Link, useNavigate } from "react-router-dom";
import ScrollProgress from "../components/ScrollProgress";
import api from "../api/axios";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { notification, showNotification, closeNotification } = useNotification();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthday: "",
        gender: "",
        accountType: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

        const email = formData.email.trim().toLowerCase();
        if (!email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            const { data } = await api.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    _id: data.user?._id || "",
                    name: data.user?.name || "",
                    email: data.user?.email || "",
                    role: data.user?.role || "member",
                })
            );

            window.dispatchEvent(new Event("auth-changed"));
            showNotification("Registration successful!", "success");
            setTimeout(() => navigate("/"), 900);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Registration failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="register-page">
            <ScrollProgress />
            <Notification
                open={notification.open}
                message={notification.message}
                type={notification.type}
                duration={notification.duration}
                onClose={closeNotification}
            />

            <main>
                <section>
                    <h2>Sign Up for Updates</h2>
                    <form id="registrationForm" onSubmit={onSubmit}>
                        <div className={`form-field ${errors.name ? "has-error" : ""}`}>
                            <label htmlFor="name">Name:</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </div>

                        <div className={`form-field ${errors.email ? "has-error" : ""}`}>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>

                        <div className={`form-field ${errors.password ? "has-error" : ""}`}>
                            <label htmlFor="password">Password:</label>
                            <div className="password-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
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

                        <div className={`form-field ${errors.confirmPassword ? "has-error" : ""}`}>
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                            <div className="password-wrap">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="password-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirm ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Creating account..." : "Register"}
                        </button>

                        <p style={{ marginTop: 12 }}>
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </form>
                </section>
            </main>
        </div>
    );
}