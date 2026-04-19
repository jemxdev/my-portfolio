import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScrollProgress from "../components/ScrollProgress";
import Reveal from "../components/Reveal";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import api from "../api/axios";
import { uploadUrl } from "../utils/url";
import "./styles/BlogPage.css";

const PAGE_SIZE = 10;

export default function BlogPage() {
    const { user: ctxUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const { notification, showNotification, closeNotification } = useNotification();

    // --- NEW STATE & AUTH LISTENER START ---
    const [user, setUser] = useState(ctxUser || null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const syncAuth = () => {
            const rawUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            const parsedUser = rawUser ? JSON.parse(rawUser) : null;

            const activeUser = ctxUser || parsedUser;
            setUser(activeUser);
            setIsLoggedIn(!!token && !!activeUser);
        };

        syncAuth(); // Sync immediately on load

        // Listen for the custom event from Navbar/Login/Logout
        window.addEventListener("auth-changed", syncAuth);
        window.addEventListener("storage", syncAuth);

        return () => {
            window.removeEventListener("auth-changed", syncAuth);
            window.removeEventListener("storage", syncAuth);
        };
    }, [ctxUser]);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [body, setBody] = useState("");
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const sortRef = useRef(null);

    const [activePost, setActivePost] = useState(null);
    const [modalComments, setModalComments] = useState([]);
    const [modalCommentInput, setModalCommentInput] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [postingComment, setPostingComment] = useState(false);

    const [modalEditMode, setModalEditMode] = useState(false);
    const [modalEditTitle, setModalEditTitle] = useState("");
    const [modalEditBody, setModalEditBody] = useState("");

    const [shareOpen, setShareOpen] = useState(false);
    const [sharePost, setSharePost] = useState(null);
    const [sharingAsPost, setSharingAsPost] = useState(false);
    const [shareTitle, setShareTitle] = useState("");
    const [shareBody, setShareBody] = useState("");
    
    const [menuOpenPostId, setMenuOpenPostId] = useState(null);
    const [modalMenuOpen, setModalMenuOpen] = useState(false);

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);

    const sortLabelMap = {
        newest: "Newest",
        liked: "Most liked",
        commented: "Most commented",
    };

    useEffect(() => {
        const onDocClick = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) setSortMenuOpen(false);
            const clickedMenu = e.target.closest(".post-menu-wrap");
            if (!clickedMenu) {
                setMenuOpenPostId(null);
                setModalMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await api.get("/posts");
            const normalized = Array.isArray(data) ? data : [];
            const myId = user?._id;

            const withMeta = await Promise.all(
                normalized.map(async (p) => {
                    let commentsCount = 0;
                    try {
                        const commentsRes = await api.get(`/comments/${p._id}`);
                        commentsCount = Array.isArray(commentsRes.data) ? commentsRes.data.length : 0;
                    } catch {
                        // Suppressed error: commentsCount remains 0
                    }

                    return {
                        ...p,
                        liked: myId ? (p.likedBy || []).some((id) => String(id) === String(myId)) : false,
                        commentsCount,
                        likesCount: p.likesCount || 0,
                    };
                })
            );

            setPosts(withMeta);

            // Check if there's a shared post ID in the URL and open it
            const urlPostId = searchParams.get("postId");
            if (urlPostId) {
                const targetPost = withMeta.find((p) => p._id === urlPostId);
                if (targetPost) {
                    openCommentsModal(targetPost);
                }
                // Clean up the URL so it looks normal again
                setSearchParams({}, { replace: true });
            }
        } catch {
            setPosts([]);
            showNotification("Failed to load posts", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const visiblePosts = useMemo(() => {
        let list = [...posts];

        const q = searchTerm.trim().toLowerCase();
        if (q) {
            list = list.filter((p) => {
                const t = (p.title || "").toLowerCase();
                const b = (p.body || "").toLowerCase();
                const a = (p.author?.name || "").toLowerCase();
                return t.includes(q) || b.includes(q) || a.includes(q);
            });
        }

        if (sortBy === "liked") {
            list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        } else if (sortBy === "commented") {
            list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
        } else {
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        return list;
    }, [posts, searchTerm, sortBy]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [searchTerm, sortBy, posts.length]);

    const displayedPosts = useMemo(
        () => visiblePosts.slice(0, visibleCount),
        [visiblePosts, visibleCount]
    );

    const hasMore = visibleCount < visiblePosts.length;

    const loadMore = useCallback(() => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, visiblePosts.length));
            setIsLoadingMore(false);
        }, 180);
    }, [hasMore, isLoadingMore, visiblePosts.length]);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { root: null, rootMargin: "120px", threshold: 0.01 }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [loadMore]);

    const canManagePost = (post) => {
        if (!post) return false;
        return user?.role === "admin" || user?._id === post.author?._id;
    };

    const resetComposer = () => {
        setBody("");
        setTitle("");
        setImage(null);
        const fileInput = document.getElementById("blog-image-input");
        if (fileInput) fileInput.value = "";
    };

    const closeComposer = () => {
        setIsComposerOpen(false);
        resetComposer();
    };

    // Updated to generate the new share link format
    const getPostLink = (post) => `${window.location.origin}/blog?postId=${post?._id}`;

    const openShareModal = (post) => {
        setSharePost(post);

        const src = post.sharedFrom?.originalPostId ? post.sharedFrom : null;
        const origTitle = src?.originalTitle || post.title || "";

        setShareTitle(origTitle ? `Shared: ${origTitle}` : "Shared Post");
        setShareBody("");
        
        setShareOpen(true);
    };

    const closeShareModal = () => {
        setShareOpen(false);
        setSharePost(null);
    };

    const handleCopyLink = async () => {
        if (!sharePost?._id) return;
        try {
            await navigator.clipboard.writeText(getPostLink(sharePost));
            showNotification("Link copied!", "success");
            closeShareModal();
        } catch {
            showNotification("Failed to copy link", "error");
        }
    };

    const handleShareAsNewPost = async () => {
        if (!sharePost?._id) return;
        if (!isLoggedIn) {
            showNotification("Please login first to share", "warning");
            return;
        }

        try {
            setSharingAsPost(true);

            const src = sharePost.sharedFrom?.originalPostId ? sharePost.sharedFrom : null;

            const normalizedSharedFrom = {
                originalPostId: src?.originalPostId || sharePost._id,
                originalAuthorName: src?.originalAuthorName || sharePost.author?.name || "Unknown",
                originalAuthorPic: src?.originalAuthorPic || sharePost.author?.profilePic || "",
                originalCreatedAt: src?.originalCreatedAt || sharePost.createdAt || null,
                originalTitle: src?.originalTitle || sharePost.title || "",
                originalBody: src?.originalBody || sharePost.body || "",
                originalImage: src?.originalImage || sharePost.image || "",
            };

            const payload = {
                title: shareTitle.trim(),
                body: shareBody.trim(),
                sharedFrom: normalizedSharedFrom,
            };

            const { data } = await api.post("/posts", payload);

            setPosts((prev) => [
                { ...data, liked: false, commentsCount: 0, likesCount: data.likesCount || 0 },
                ...prev,
            ]);

            showNotification("Shared to your posts!", "success");
            closeShareModal();
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to share post", "error");
        } finally {
            setSharingAsPost(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const cleanBody = body.trim();
        const cleanTitle = title.trim();

        if (!cleanBody) {
            showNotification("Write something first.", "warning");
            return;
        }

        try {
            setSubmitting(true);

            let data;
            if (image) {
                const fd = new FormData();
                fd.append("title", cleanTitle);
                fd.append("body", cleanBody);
                fd.append("image", image);
                ({ data } = await api.post("/posts", fd));
            } else {
                ({ data } = await api.post("/posts", { title: cleanTitle, body: cleanBody }));
            }

            setPosts((prev) => [
                { ...data, liked: false, commentsCount: 0, likesCount: data.likesCount || 0 },
                ...prev,
            ]);

            closeComposer();
            showNotification("Posted!", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to post.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleLikeLocal = (list, postId, payload) =>
        list.map((p) =>
            p._id === postId ? { ...p, likesCount: payload.likesCount, liked: payload.liked } : p
        );

    const handleToggleLike = async (postId) => {
        if (!isLoggedIn) {
            showNotification("Please login to like posts", "warning");
            return;
        }

        try {
            const { data } = await api.put(`/posts/${postId}/like`);
            setPosts((prev) => toggleLikeLocal(prev, postId, data));
            setActivePost((prev) =>
                prev && prev._id === postId ? { ...prev, likesCount: data.likesCount, liked: data.liked } : prev
            );
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to like post", "error");
        }
    };

    const openCommentsModal = async (post) => {
        setActivePost(post);
        setModalEditMode(false);
        setModalEditTitle(post.title || "");
        setModalEditBody(post.body || "");
        setModalComments([]);
        setModalCommentInput("");
        setLoadingComments(true);
        setModalMenuOpen(false);

        try {
            const { data } = await api.get(`/comments/${post._id}`);
            const arr = Array.isArray(data) ? data : [];
            setModalComments(arr);
            setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, commentsCount: arr.length } : p)));
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to load comments", "error");
        } finally {
            setLoadingComments(false);
        }
    };

    const closeCommentsModal = () => {
        setActivePost(null);
        setModalComments([]);
        setModalCommentInput("");
        setModalEditMode(false);
        setModalEditTitle("");
        setModalEditBody("");
        setModalMenuOpen(false);
    };

    const handleAddModalComment = async () => {
        if (!isLoggedIn) {
            showNotification("Please login to comment", "warning");
            return;
        }
        if (!activePost?._id) return;

        const clean = modalCommentInput.trim();
        if (!clean) {
            showNotification("Comment cannot be empty", "warning");
            return;
        }

        try {
            setPostingComment(true);
            const { data } = await api.post(`/comments/${activePost._id}`, { body: clean });
            const updated = [...modalComments, data];
            setModalComments(updated);
            setModalCommentInput("");

            setPosts((prev) => prev.map((p) => (p._id === activePost._id ? { ...p, commentsCount: updated.length } : p)));

            showNotification("Comment posted", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to post comment", "error");
        } finally {
            setPostingComment(false);
        }
    };

    const canManageActivePost = canManagePost(activePost);

    const handleUpdateModalPost = async () => {
        if (!activePost?._id) return;

        try {
            const { data } = await api.put(`/posts/${activePost._id}`, {
                title: modalEditTitle,
                body: modalEditBody,
            });

            const merged = {
                ...activePost,
                ...data,
                title: data?.title ?? modalEditTitle,
                body: data?.body ?? modalEditBody,
                sharedFrom: data?.sharedFrom ?? activePost.sharedFrom ?? null,
            };

            setActivePost(merged);
            setPosts((prev) => prev.map((p) => (p._id === activePost._id ? { ...p, ...merged } : p)));

            setModalEditMode(false);
            showNotification("Post updated successfully", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to update post", "error");
        }
    };

    const handleDeleteModalPost = async () => {
        if (!activePost?._id) return;

        try {
            await api.delete(`/posts/${activePost._id}`);
            setPosts((prev) => prev.filter((p) => p._id !== activePost._id));
            closeCommentsModal();
            showNotification("Post deleted", "success");
        } catch (err) {
            showNotification(err?.response?.data?.message || "Failed to delete post", "error");
        }
    };

    return (
        <div className="blog-page blog-fb-layout">
            <ScrollProgress />
            <Notification
                open={notification.open}
                message={notification.message}
                type={notification.type}
                duration={notification.duration}
                onClose={closeNotification}
            />

            <div className="blog-feed-column">
                <Reveal direction="up">
                    <div className="blog-title">
                        <h1>Blog</h1>
                        <p>Share updates, ideas, and learning progress.</p>
                    </div>
                </Reveal>

                <Reveal direction="up" delay={1}>
                    <section className="blog-create-wrap fb-composer-card">
                        {!isLoggedIn ? (
                            <div className="blog-login-note">
                                <p>
                                    Please <Link to="/login">login</Link> first to create a post.
                                </p>
                            </div>
                        ) : (
                            <div className="composer-shell">
                                {!isComposerOpen && (
                                    <button type="button" className="composer-collapsed" onClick={() => setIsComposerOpen(true)}>
                                        What&apos;s on your mind, {user?.name || "User"}?
                                    </button>
                                )}

                                <div className={`composer-panel ${isComposerOpen ? "open" : ""}`}>
                                    {isComposerOpen && (
                                        <form className="blog-create-form" onSubmit={handleCreatePost}>
                                            <div className="form-field">
                                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" maxLength={120} />
                                            </div>

                                            <div className="form-field">
                                                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share something..." rows={4} autoFocus />
                                            </div>

                                            <div className="form-field">
                                                <div className="file-upload-row">
                                                    <label htmlFor="blog-image-input" className="file-upload-btn">
                                                        {image ? "Change image" : "Choose image"}
                                                    </label>

                                                    <span className={`file-upload-name ${image ? "has-file" : ""}`}>{image ? image.name : "No file chosen"}</span>

                                                    {image && (
                                                        <button
                                                            type="button"
                                                            className="file-upload-clear"
                                                            onClick={() => {
                                                                setImage(null);
                                                                const input = document.getElementById("blog-image-input");
                                                                if (input) input.value = "";
                                                            }}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <input id="blog-image-input" type="file" accept="image/*" className="file-hidden-input" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                                            </div>

                                            <div className="composer-actions">
                                                <button type="button" className="composer-cancel" onClick={closeComposer}>Cancel</button>
                                                <button type="submit" disabled={submitting || !body.trim()}>{submitting ? "Posting..." : "Post"}</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </Reveal>

                <Reveal direction="up" delay={2}>
                    <section>
                        <div className="blog-list-head blog-list-head-no-title">
                            <div className="blog-tools">
                                <input type="text" className="blog-search" placeholder="Search title, content, or author..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                                <div className="sort-menu-wrap" ref={sortRef}>
                                    <button type="button" className="sort-menu-trigger" onClick={() => setSortMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={sortMenuOpen}>
                                        <span>{sortLabelMap[sortBy]}</span>
                                        <span className={`sort-caret ${sortMenuOpen ? "open" : ""}`}>▾</span>
                                    </button>

                                    {sortMenuOpen && (
                                        <div className="sort-menu" role="menu">
                                            {[
                                                { key: "newest", label: "Newest" },
                                                { key: "liked", label: "Most liked" },
                                                { key: "commented", label: "Most commented" },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    type="button"
                                                    role="menuitem"
                                                    className={`sort-item ${sortBy === opt.key ? "active" : ""}`}
                                                    onClick={() => {
                                                        setSortBy(opt.key);
                                                        setSortMenuOpen(false);
                                                    }}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <p>Loading posts...</p>
                        ) : visiblePosts.length === 0 ? (
                            <p>No matching posts.</p>
                        ) : (
                            <>
                                <div className="blog-feed">
                                    {displayedPosts.map((post) => {
                                        const imageUrl = uploadUrl(post?.image);
                                        const authorPic = post?.author?.profilePic ? uploadUrl(post.author.profilePic) : "/default-avatar.png";
                                        const isShared = !!post?.sharedFrom?.originalPostId;
                                        const shared = post?.sharedFrom || {};
                                        const sharedImageUrl = uploadUrl(shared?.originalImage);

                                        return (
                                            <article key={post._id} className="blog-card fb-card clickable-card" onClick={() => openCommentsModal(post)} role="button" tabIndex={0}>
                                                <div className="fb-header">
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <img src={authorPic} alt={post.author?.name || "Author"} className="fb-avatar" />
                                                        <div>
                                                            <p className="fb-name">{post.author?.name || "Unknown"}</p>
                                                            <p className="fb-date">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</p>
                                                        </div>
                                                    </div>

                                                    {canManagePost(post) && (
                                                        <div className="post-menu-wrap" onClick={(e) => e.stopPropagation()}>
                                                            <button type="button" className="post-menu-btn" aria-label="Post menu" onClick={() => setMenuOpenPostId((prev) => (prev === post._id ? null : post._id))}>⋯</button>

                                                            {menuOpenPostId === post._id && (
                                                                <div className="post-menu-dropdown">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setActivePost(post);
                                                                            setModalEditMode(true);
                                                                            setModalEditTitle(post.title || "");
                                                                            setModalEditBody(post.body || "");
                                                                            setMenuOpenPostId(null);
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="danger"
                                                                        onClick={async () => {
                                                                            try {
                                                                                await api.delete(`/posts/${post._id}`);
                                                                                setPosts((prev) => prev.filter((p) => p._id !== post._id));
                                                                                showNotification("Post deleted", "success");
                                                                            } catch (err) {
                                                                                showNotification(err?.response?.data?.message || "Failed to delete post", "error");
                                                                            } finally {
                                                                                setMenuOpenPostId(null);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="blog-content">
                                                    {isShared ? (
                                                        <>
                                                            {!!post.title && <h4>{post.title}</h4>}
                                                            {!!post.body && <p className="fb-content">{post.body}</p>}

                                                            <div
                                                                className="shared-visual-card"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openCommentsModal(post);
                                                                }}
                                                                role="button"
                                                                tabIndex={0}
                                                            >
                                                                <div className="shared-original-head">
                                                                    <img
                                                                        src={
                                                                            shared.originalAuthorPic
                                                                                ? uploadUrl(shared.originalAuthorPic)
                                                                                : "/default-avatar.png"
                                                                        }
                                                                        alt={shared.originalAuthorName || "Original author"}
                                                                        className="shared-original-avatar"
                                                                    />
                                                                    <div>
                                                                        <p className="shared-original-name">{shared.originalAuthorName || "Unknown"}</p>
                                                                        <p className="shared-original-date">
                                                                            {shared.originalCreatedAt ? new Date(shared.originalCreatedAt).toLocaleDateString() : ""}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {!!shared.originalTitle && <h4 className="shared-visual-title">{shared.originalTitle}</h4>}
                                                                {!!shared.originalBody && (
                                                                    <p className="shared-visual-body">
                                                                        {shared.originalBody.slice(0, 220)}
                                                                        {shared.originalBody.length > 220 ? "..." : ""}
                                                                    </p>
                                                                )}
                                                                {sharedImageUrl && (
                                                                    <img
                                                                        src={sharedImageUrl}
                                                                        alt={shared.originalTitle || "Shared image"}
                                                                        className="shared-visual-image"
                                                                    />
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {!!post.title && <h4>{post.title}</h4>}
                                                            <p className="fb-content">{post.body || ""}</p>
                                                            {imageUrl && <img src={imageUrl} alt={post.title || "Post image"} className="blog-post-image" />}
                                                        </>
                                                    )}

                                                    <div className="post-actions-row">
                                                        <button type="button" className={`icon-action like-icon-btn ${post.liked ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); handleToggleLike(post._id); }} aria-label="Like post">
                                                            {post.liked ? (
                                                                <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                                                                    <path d="M12.1 21.35l-1.1-1.02C5.14 14.88 2 11.97 2 8.5C2 5.58 4.42 3.5 7.5 3.5c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3.5C19.58 3.5 22 5.58 22 8.5c0 3.47-3.14 6.38-8.99 11.83l-.91.84z" fill="currentColor" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                                    <path d="M12.1 21.35l-1.1-1.02C5.14 14.88 2 11.97 2 8.5C2 5.58 4.42 3.5 7.5 3.5c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3.5C19.58 3.5 22 5.58 22 8.5c0 3.47-3.14 6.38-8.99 11.83l-.91.84z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                            <span className="action-count">{post.likesCount || 0}</span>
                                                        </button>

                                                        <button type="button" className="icon-action comment-icon-btn" onClick={(e) => { e.stopPropagation(); openCommentsModal(post); }} aria-label="Open comments">
                                                            <svg className="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                                <path d="M21 11.5c0 4.418-4.03 8-9 8-1.104 0-2.161-.176-3.13-.5L3 21l1.3-4.333A7.37 7.37 0 0 1 3 11.5c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span className="action-count">{post.commentsCount || 0}</span>
                                                        </button>

                                                        <button type="button" className="icon-action share-icon-btn" onClick={(e) => { e.stopPropagation(); openShareModal(post); }} aria-label="Share post" title="Share">
                                                            <svg className="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                                <path d="M14 5l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M20 11H10a6 6 0 0 0-6 6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span className="action-count">Share</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                <div ref={loadMoreRef} className="feed-load-sentinel" />
                                {isLoadingMore && <p className="feed-loading-more">Loading more posts...</p>}
                                {!hasMore && visiblePosts.length > PAGE_SIZE && (
                                    <p className="feed-end-text">You’ve reached the end</p>
                                )}
                            </>
                        )}
                    </section>
                </Reveal>
            </div>

            {activePost && (
                <div className="comments-modal-overlay" onClick={closeCommentsModal}>
                    <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="comments-close" onClick={closeCommentsModal} aria-label="Close modal">✕</button>

                        <div className="comments-modal-header">
                            <div className="modal-author-row">
                                <img src={activePost.author?.profilePic ? uploadUrl(activePost.author.profilePic) : "/default-avatar.png"} alt={activePost.author?.name || "Author"} className="modal-avatar" />
                                <div>
                                    <p className="modal-name">{activePost.author?.name || "Unknown"}</p>
                                    <p className="modal-date">{activePost.createdAt ? new Date(activePost.createdAt).toLocaleDateString() : ""}</p>
                                </div>
                            </div>

                            {canManageActivePost && (
                                <div className="post-menu-wrap modal-post-menu" onClick={(e) => e.stopPropagation()}>
                                    <button type="button" className="post-menu-btn" aria-label="Post menu" onClick={() => setModalMenuOpen((v) => !v)}>⋯</button>

                                    {modalMenuOpen && (
                                        <div className="post-menu-dropdown">
                                            <button type="button" onClick={() => { setModalEditMode(true); setModalMenuOpen(false); }}>Edit</button>
                                            <button type="button" className="danger" onClick={async () => { await handleDeleteModalPost(); setModalMenuOpen(false); }}>Delete</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="comments-modal-body">
                            {modalEditMode ? (
                                <>
                                    <input className="edit-input" value={modalEditTitle} onChange={(e) => setModalEditTitle(e.target.value)} placeholder="Edit your post title" />
                                    <textarea className="edit-textarea" value={modalEditBody} onChange={(e) => setModalEditBody(e.target.value)} rows={6} placeholder="Edit your caption" />
                                    <button className="save-btn" onClick={handleUpdateModalPost}>Save Changes</button>
                                    {!!activePost?.sharedFrom?.originalPostId && (
                                        <p className="edit-shared-note">You are editing your shared post text only. Original shared content stays unchanged.</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {!!activePost?.sharedFrom?.originalPostId ? (
                                        <>
                                            {!!activePost.title && <h2 className="modal-post-title">{activePost.title}</h2>}
                                            {!!activePost.body && <p className="comments-post-body">{activePost.body}</p>}

                                            <div className="shared-visual-card modal-shared-card">
                                                <div className="shared-original-head">
                                                    <img
                                                        src={
                                                            activePost.sharedFrom.originalAuthorPic
                                                                ? uploadUrl(activePost.sharedFrom.originalAuthorPic)
                                                                : "/default-avatar.png"
                                                        }
                                                        alt={activePost.sharedFrom.originalAuthorName || "Original author"}
                                                        className="shared-original-avatar"
                                                    />
                                                    <div>
                                                        <p className="shared-original-name">{activePost.sharedFrom.originalAuthorName || "Unknown"}</p>
                                                        <p className="shared-original-date">
                                                            {activePost.sharedFrom.originalCreatedAt
                                                                ? new Date(activePost.sharedFrom.originalCreatedAt).toLocaleDateString()
                                                                : ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                {!!activePost.sharedFrom.originalTitle && <h4 className="shared-visual-title">{activePost.sharedFrom.originalTitle}</h4>}
                                                {!!activePost.sharedFrom.originalBody && <p className="shared-visual-body">{activePost.sharedFrom.originalBody}</p>}
                                                {!!activePost.sharedFrom.originalImage && (
                                                    <img
                                                        className="shared-visual-image"
                                                        src={uploadUrl(activePost.sharedFrom.originalImage)}
                                                        alt={activePost.sharedFrom.originalTitle || "Shared image"}
                                                    />
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {!!activePost.title && <h2 className="modal-post-title">{activePost.title}</h2>}
                                            <p className="comments-post-body">{activePost.body || ""}</p>
                                        </>
                                    )}
                                </>
                            )}

                            {!activePost?.sharedFrom?.originalPostId && activePost.image && (
                                <img className="comments-post-image" src={uploadUrl(activePost.image)} alt={activePost.title || "Post image"} />
                            )}
                        </div>

                        <div className="modal-bottom">
                            <div className="post-actions-row modal-actions-row">
                                <button type="button" className={`icon-action like-icon-btn ${activePost.liked ? "active" : ""}`} onClick={() => handleToggleLike(activePost._id)} aria-label="Like post">
                                    {activePost.liked ? (
                                        <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12.1 21.35l-1.1-1.02C5.14 14.88 2 11.97 2 8.5C2 5.58 4.42 3.5 7.5 3.5c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3.5C19.58 3.5 22 5.58 22 8.5c0 3.47-3.14 6.38-8.99 11.83l-.91.84z" fill="currentColor" />
                                        </svg>
                                    ) : (
                                        <svg className="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M12.1 21.35l-1.1-1.02C5.14 14.88 2 11.97 2 8.5C2 5.58 4.42 3.5 7.5 3.5c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3.5C19.58 3.5 22 5.58 22 8.5c0 3.47-3.14 6.38-8.99 11.83l-.91.84z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <span className="action-count">{activePost.likesCount || 0}</span>
                                </button>

                                <button type="button" className="icon-action comment-icon-btn" aria-label="Comments">
                                    <svg className="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M21 11.5c0 4.418-4.03 8-9 8-1.104 0-2.161-.176-3.13-.5L3 21l1.3-4.333A7.37 7.37 0 0 1 3 11.5c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="action-count">{modalComments.length}</span>
                                </button>

                                <button type="button" className="icon-action share-icon-btn" onClick={() => openShareModal(activePost)} aria-label="Share post">
                                    <svg className="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M14 5l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M20 11H10a6 6 0 0 0-6 6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="action-count">Share</span>
                                </button>
                            </div>

                            <div className="comments-list-wrap">
                                {loadingComments ? (
                                    <p>Loading comments...</p>
                                ) : modalComments.length === 0 ? (
                                    <p>No comments yet.</p>
                                ) : (
                                    <div className="comments-list">
                                        {modalComments.map((c) => (
                                            <div key={c._id} className="comment-item">
                                                <strong>{c.author?.name || "User"}:</strong> {c.body}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="comments-modal-footer">
                            <input type="text" value={modalCommentInput} onChange={(e) => setModalCommentInput(e.target.value)} placeholder={isLoggedIn ? "Write a comment..." : "Login to comment"} disabled={!isLoggedIn || postingComment} />
                            <button type="button" onClick={handleAddModalComment} disabled={!isLoggedIn || postingComment || !modalCommentInput.trim()}>
                                {postingComment ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {shareOpen && sharePost && (
                <div className="share-modal-overlay" onClick={closeShareModal}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="share-close" onClick={closeShareModal} aria-label="Close share modal">✕</button>
                        <h3>Share Post</h3>

                        {/* --- NEW INPUT FIELDS --- */}
                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                className="edit-input"
                                value={shareTitle}
                                onChange={(e) => setShareTitle(e.target.value)}
                                placeholder="Title for your shared post"
                            />
                            <textarea
                                className="edit-textarea"
                                value={shareBody}
                                onChange={(e) => setShareBody(e.target.value)}
                                rows={3}
                                placeholder="Say something about this..."
                                style={{ marginTop: '10px' }}
                            />
                        </div>

                        {/* Visual preview so they know what they are sharing */}
                        <div className="shared-visual-card" style={{ pointerEvents: 'none', opacity: 0.8, marginBottom: '1rem' }}>
                            <p className="share-caption" style={{ margin: 0, fontWeight: 'bold' }}>
                                Original post by {sharePost.sharedFrom?.originalAuthorName || sharePost.author?.name || "Unknown"}
                            </p>
                        </div>

                        <div className="share-link-preview">{getPostLink(sharePost)}</div>

                        <div className="share-actions">
                            <button type="button" className="share-btn secondary" onClick={handleCopyLink}>Copy link</button>
                            <button type="button" className="share-btn primary" onClick={handleShareAsNewPost} disabled={sharingAsPost}>
                                {sharingAsPost ? "Sharing..." : "Share in posts"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}