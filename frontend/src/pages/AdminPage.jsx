import { useEffect, useState } from "react";
import ScrollProgress from "../components/ScrollProgress";
import Reveal from "../components/Reveal";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import api from "../api/axios";
import "./styles/AdminPage.css";

export default function AdminPage() {
    const { notification, showNotification, closeNotification } = useNotification();

    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [messages, setMessages] = useState([]);

    const [tab, setTab] = useState("users");

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get("/admin/users");
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to load users", "error");
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const { data } = await api.get("/admin/posts");
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to load posts", "error");
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const { data } = await api.get("/admin/messages");
            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to load messages", "error");
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchPosts();
        fetchMessages();
    }, []);

    const toggleStatus = async (id) => {
        try {
            const { data } = await api.put(`/admin/users/${id}/status`);
            setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
            showNotification(data?.message || "User status updated", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to update user status", "error");
        }
    };

    const removePost = async (id) => {
        try {
            await api.put(`/admin/posts/${id}/remove`);
            setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, status: "removed" } : p)));
            showNotification("Post has been removed", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to remove post", "error");
        }
    };

    const markMessageRead = async (id) => {
        try {
            const { data } = await api.put(`/admin/messages/${id}/read`);
            setMessages((prev) => prev.map((m) => (m._id === id ? data.data : m)));
            showNotification(data?.message || "Message marked as read", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to update message", "error");
        }
    };

    return (
        <div className="admin-page">
            <ScrollProgress />
            <Notification
                open={notification.open}
                message={notification.message}
                type={notification.type}
                duration={notification.duration}
                onClose={closeNotification}
            />

            <div className="admin-page-inner">
                <Reveal direction="up">
                    <section>
                        <h2>Admin Dashboard</h2>

                        <div className="admin-tabs">
                            <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
                                Members ({users.length})
                            </button>
                            <button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>
                                All Posts ({posts.length})
                            </button>
                            <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}>
                                Messages ({messages.length})
                            </button>
                        </div>

                        {tab === "users" && (
                            <>
                                {loadingUsers ? (
                                    <p>Loading users...</p>
                                ) : users.length === 0 ? (
                                    <p>No members found.</p>
                                ) : (
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {users.map((u) => (
                                                <tr key={u._id}>
                                                    <td>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                                                    <td>
                                                        <button
                                                            onClick={() => toggleStatus(u._id)}
                                                            className={u.status === "active" ? "btn-danger" : "btn-success"}
                                                        >
                                                            {u.status === "active" ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {tab === "posts" && (
                            <>
                                {loadingPosts ? (
                                    <p>Loading posts...</p>
                                ) : posts.length === 0 ? (
                                    <p>No posts found.</p>
                                ) : (
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Author</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {posts.map((p) => (
                                                <tr key={p._id}>
                                                    <td>{p.title}</td>
                                                    <td>{p.author?.name || "Unknown"}</td>
                                                    <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                                                    <td>
                                                        {p.status === "published" ? (
                                                            <button className="btn-danger" onClick={() => removePost(p._id)}>
                                                                Remove
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: "var(--text-muted)" }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {tab === "messages" && (
                            <>
                                {loadingMessages ? (
                                    <p>Loading messages...</p>
                                ) : messages.length === 0 ? (
                                    <p>No messages found.</p>
                                ) : (
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Message</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {messages.map((m) => (
                                                <tr key={m._id}>
                                                    <td>{m.name}</td>
                                                    <td>{m.email}</td>
                                                    <td style={{ maxWidth: 320 }}>
                                                        {(m.message || "").slice(0, 120)}
                                                        {(m.message || "").length > 120 ? "..." : ""}
                                                    </td>
                                                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                            <span className={`status-badge ${m.status === "new" ? "inactive" : "active"}`}>
                                                                {m.status}
                                                            </span>
                                                    </td>
                                                    <td>
                                                        {m.status === "new" ? (
                                                            <button className="btn-success" onClick={() => markMessageRead(m._id)}>
                                                                Mark Read
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: "var(--text-muted)" }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </Reveal>
            </div>
        </div>
    );
}