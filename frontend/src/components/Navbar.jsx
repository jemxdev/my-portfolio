import { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { uploadUrl } from "../utils/url";
import "./Styles/Navbar.css";

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [user, setUser] = useState(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [guestMenuOpen, setGuestMenuOpen] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedMode = localStorage.getItem("theme-mode");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldBeDark = savedMode ? savedMode === "dark" : prefersDark;
        setIsDarkMode(shouldBeDark);
        applyTheme(shouldBeDark);
    }, []);

    useEffect(() => {
        const syncUser = () => {
            const raw = localStorage.getItem("user");
            setUser(raw ? JSON.parse(raw) : null);
        };
        syncUser();
        window.addEventListener("storage", syncUser);
        window.addEventListener("focus", syncUser);
        window.addEventListener("auth-changed", syncUser);
        return () => {
            window.removeEventListener("storage", syncUser);
            window.removeEventListener("focus", syncUser);
            window.removeEventListener("auth-changed", syncUser);
        };
    }, []);

    useEffect(() => {
        const loadProfilePic = async () => {
            const token = localStorage.getItem("token");
            if (!token || !user) return setProfilePicUrl("");
            try {
                const { data } = await api.get("/auth/me");
                setProfilePicUrl(data?.profilePic ? uploadUrl(data.profilePic) : "");
            } catch {
                setProfilePicUrl("");
            }
        };
        loadProfilePic();
    }, [user]);

    const applyTheme = (isDark) => {
        if (isDark) {
            document.body.classList.remove("light-mode");
            localStorage.setItem("theme-mode", "dark");
        } else {
            document.body.classList.add("light-mode");
            localStorage.setItem("theme-mode", "light");
        }
    };

    const toggleTheme = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        applyTheme(next);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
        setUser(null);
        setUserMenuOpen(false);
        setGuestMenuOpen(false);
        setProfilePicUrl("");
        navigate("/");
    };

    const ThemeToggleButton = () => (
        <button
            className="nav-link profile-logout-btn dropdown-item-flex"
            onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
            }}
            type="button"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isDarkMode ? (
                    <>
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </>
                ) : (
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                )}
            </svg>
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
    );

    return (
        <>
            <header className="top-nav-header">
                <nav className="horizontal-nav">
                    <div className="desktop-nav">
                        <div className="nav-left-group">
                            <ul className="nav-links nav-links-left">
                                <li><NavLink to="/home" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Home</NavLink></li>
                                <li><NavLink to="/about" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>About</NavLink></li>
                                <li><NavLink to="/blog" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Blog</NavLink></li>
                                <li><NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Contact</NavLink></li>
                            </ul>
                        </div>

                        <div className="nav-right">
                            {!user ? (
                                <div className="profile-not-logged">
                                    <button className="guest-text-btn" onClick={() => setGuestMenuOpen((v) => !v)} type="button">Log in</button>
                                    <button className="profile-trigger" onClick={() => setGuestMenuOpen((v) => !v)} type="button"><span className="profile-fallback">?</span></button>
                                    {guestMenuOpen && (
                                        <div className="profile-dropdown">
                                            <Link className="nav-link" to="/login" onClick={() => setGuestMenuOpen(false)}>Login</Link>
                                            <Link className="nav-link" to="/register" onClick={() => setGuestMenuOpen(false)}>Register</Link>
                                            <ThemeToggleButton />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="profile-menu-wrap">
                                    <button className="guest-text-btn" onClick={() => setUserMenuOpen((v) => !v)} type="button">{user.name}</button>
                                    <button className="profile-trigger" onClick={() => setUserMenuOpen((v) => !v)} type="button">
                                        {profilePicUrl ? <img src={profilePicUrl} alt="Profile" className="profile-avatar" /> : <span className="profile-fallback">{(user.name || "U")[0].toUpperCase()}</span>}
                                    </button>
                                    {userMenuOpen && (
                                        <div className="profile-dropdown">
                                            <NavLink className="nav-link" to="/profile" onClick={() => setUserMenuOpen(false)}>Profile</NavLink>
                                            {user.role === "admin" && <NavLink className="nav-link" to="/admin" onClick={() => setUserMenuOpen(false)}>Admin Dashboard</NavLink>}
                                            <ThemeToggleButton />
                                            <button className="nav-link profile-logout-btn" onClick={logout} type="button">Logout</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            <nav className="mobile-fb-tabs" aria-label="Mobile navigation">
                <NavLink to="/home" end className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}>
                    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
                </NavLink>

                <NavLink to="/about" className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}>
                    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                </NavLink>

                <NavLink to="/blog" className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}>
                    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h9.5" /><path d="M17 2.5a2.121 2.121 0 0 1 3 3L12 13l-4 1 1-4 9.5-9.5z" /></svg>
                </NavLink>

                <NavLink to="/contact" className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}>
                    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </NavLink>

                {user ? (
                    <div className="mobile-profile-wrap" style={{ display: "flex", width: "100%", height: "100%" }}>
                        <button className={`tab-item profile-tab ${userMenuOpen ? "active" : ""}`} onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", width: "100%", padding: 0 }} type="button">
                            {profilePicUrl ? <img src={profilePicUrl} alt="Profile" className="tab-avatar" /> : <span className="tab-avatar-fallback">{(user?.name || "U")[0].toUpperCase()}</span>}
                        </button>

                        {userMenuOpen && (
                            <div className="profile-dropdown mobile-dropdown">
                                <NavLink className="nav-link" to="/profile" onClick={() => setUserMenuOpen(false)}>Profile</NavLink>
                                {user.role === "admin" && <NavLink className="nav-link" to="/admin" onClick={() => setUserMenuOpen(false)}>Admin Dashboard</NavLink>}
                                <ThemeToggleButton />
                                <button className="nav-link profile-logout-btn" onClick={logout} type="button">Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mobile-profile-wrap" style={{ display: "flex", width: "100%", height: "100%" }}>
                        <button className={`tab-item profile-tab ${guestMenuOpen ? "active" : ""}`} onClick={() => setGuestMenuOpen(!guestMenuOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", width: "100%", padding: 0 }} type="button">
                            <span className="tab-avatar-fallback">?</span>
                        </button>

                        {guestMenuOpen && (
                            <div className="profile-dropdown mobile-dropdown">
                                <NavLink className="nav-link" to="/login" onClick={() => setGuestMenuOpen(false)}>Login</NavLink>
                                <NavLink className="nav-link" to="/register" onClick={() => setGuestMenuOpen(false)}>Register</NavLink>
                                <ThemeToggleButton />
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </>
    );
}