import { useEffect, useState } from "react";
import ScrollProgress from "../components/ScrollProgress";
import Reveal from "../components/Reveal";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import api from "../api/axios";
import { uploadUrl } from "../utils/url";
import "./styles/ContactPage.css";

export default function ProfilePage() {
    const { notification, showNotification, closeNotification } = useNotification();

    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [pic, setPic] = useState(null);

    const [curPw, setCurPw] = useState("");
    const [newPw, setNewPw] = useState("");

    const loadProfile = async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
            setName(data?.name || "");
            setBio(data?.bio || "");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to load profile", "error");
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleProfile = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append("name", name);
            fd.append("bio", bio);
            if (pic) fd.append("profilePic", pic);

            const { data } = await api.put("/auth/profile", fd);

            setUser(data);
            setName(data?.name || "");
            setBio(data?.bio || "");
            setPic(null);

            showNotification("Profile updated successfully!", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to update profile", "error");
        }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put("/auth/change-password", {
                currentPassword: curPw,
                newPassword: newPw,
            });

            setCurPw("");
            setNewPw("");
            showNotification("Password changed successfully!", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to change password", "error");
        }
    };

    const picSrc = user?.profilePic ? uploadUrl(user.profilePic) : "/default-avatar.png";

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
                        <h2>My Profile</h2>

                        <div style={{ marginTop: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
                            <img
                                src={picSrc}
                                alt="Profile"
                                style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid var(--border-soft)",
                                    background: "rgba(255,255,255,0.06)",
                                }}
                            />
                            <div>
                                <p style={{ margin: 0 }}><strong>{user?.name || "-"}</strong></p>
                                <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>{user?.email || "-"}</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfile}>
                            <div className="form-field">
                                <label>Display name:</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div className="form-field">
                                <label>Bio:</label>
                                <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                            </div>

                            <div className="form-field">
                                <label>Change Profile Picture:</label>
                                <input type="file" accept="image/*" onChange={(e) => setPic(e.target.files?.[0] || null)} />
                            </div>

                            <button type="submit">Save Profile</button>
                        </form>
                    </section>
                </Reveal>

                <Reveal direction="up" delay={1}>
                    <section>
                        <h2>Change Password</h2>

                        <form onSubmit={handlePassword}>
                            <div className="form-field">
                                <label>Current Password:</label>
                                <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} required />
                            </div>

                            <div className="form-field">
                                <label>New Password:</label>
                                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} minLength={6} required />
                            </div>

                            <button type="submit">Change Password</button>
                        </form>
                    </section>
                </Reveal>
            </main>
        </div>
    );
}