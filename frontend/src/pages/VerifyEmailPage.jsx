import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Reveal from "../components/Reveal";
import "./styles/AuthPages.css";

export default function VerifyEmailPage() {
    const { token } = useParams();
    const [status, setStatus] = useState("verifying"); // 'verifying', 'success', or 'error'
    const [message, setMessage] = useState("Verifying your email... please wait.");

    // useRef ensures the API call only fires once in React Strict Mode
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const verifyEmail = async () => {
            try {
                const { data } = await api.get(`/auth/verify-email/${token}`);
                setStatus("success");
                setMessage(data.message);
            } catch (err) {
                setStatus("error");
                setMessage(err?.response?.data?.message || "Verification failed. The link may be invalid or expired.");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="auth-page-wrapper">
            <main>
                <Reveal direction="up">
                    <section className="auth-card" style={{ textAlign: "center" }}>
                        <h2>Email Verification</h2>

                        {status === "verifying" && (
                            <div style={{ margin: "20px 0" }}>
                                <div className="spinner" style={{ margin: "0 auto 15px", width: "30px", height: "30px", border: "3px solid var(--border-soft)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                <p>{message}</p>
                            </div>
                        )}

                        {status === "success" && (
                            <div>
                                <p style={{ color: "#10b981", fontWeight: "600", marginBottom: "20px" }}>{message}</p>
                                <Link to="/login">
                                    <button className="submit-btn">Go to Login</button>
                                </Link>
                            </div>
                        )}

                        {status === "error" && (
                            <div>
                                <p style={{ color: "var(--error)", fontWeight: "600", marginBottom: "20px" }}>{message}</p>
                                <Link to="/register">
                                    <button className="submit-btn">Back to Register</button>
                                </Link>
                            </div>
                        )}

                        <style>{`
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        `}</style>
                    </section>
                </Reveal>
            </main>
        </div>
    );
}