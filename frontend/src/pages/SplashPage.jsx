import React, { useEffect, useState } from "react";
import "./styles/Splash.css";
import { useNavigate } from "react-router-dom";

export default function SplashPage() {
    const navigate = useNavigate();

    const loadingMessages = [
        "Initializing ⚙",
        "Loading assets 📦",
        "Preparing components 🔧",
        "Building interface 🎨",
        "Almost ready ✨",
        "Welcome! 🚀",
    ];

    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 1;

                const newMessageIndex = Math.floor((next / 100) * (loadingMessages.length - 1));
                setMessageIndex(newMessageIndex);

                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsLoaded(true), 250); // show buttons after loading
                }

                return next;
            });
        }, 40);

        return () => clearInterval(interval);
    }, []);

    const goHome = () => navigate("/home");
    const goBlog = () => navigate("/blog");
    const skipIntro = () => setIsLoaded(true);

    return (
        <div className="splash-page">
            <div className="code-animation-container">
                <div className="code-snippet">&lt;div&gt;</div>
                <div className="code-snippet">{`{ }`}</div>
                <div className="code-snippet">&lt;/&gt;</div>
                <div className="code-snippet">function()</div>
                <div className="code-snippet">=&gt;</div>
            </div>

            <div className="loader-container">
                <div className="branding">Jemxdev</div>

                <div className="logo">💻</div>

                <h1>Welcome</h1>
                <p className="subtitle">Preparing your experience</p>

                <span className="divider"></span>

                {!isLoaded ? (
                    <div className="loading-wrapper">
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: progress + "%" }} />
                        </div>

                        <div className="progress-text">{progress}%</div>

                        <div className="loading-status">{loadingMessages[messageIndex]}</div>
                    </div>
                ) : (
                    <div className="splash-actions">
                        <p className="ready-text">You’re all set. Where do you want to go?</p>
                        <div className="action-buttons">
                            <button className="go-btn primary" onClick={goHome}>
                                Go to Home
                            </button>
                            <button className="go-btn outline" onClick={goBlog}>
                                Go to Blog
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {!isLoaded && (
                <button className="skip-button" onClick={skipIntro}>
                    Skip Intro →
                </button>
            )}
        </div>
    );
}