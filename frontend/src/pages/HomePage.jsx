import "./styles/HomePage.css";

import Image1 from "../assets/home/img.png";
import Image2 from "../assets/home/img2.png";

import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ScrollProgress from "../components/ScrollProgress";
import Reveal from "../components/Reveal";
import api from "../api/axios";
import { uploadUrl } from "../utils/url";

export default function HomePage() {
    const typingIntervalRef = useRef(null);
    const [latestPosts, setLatestPosts] = useState([]);

    useEffect(() => {
        const texts = [
            "Building amazing web experiences",
            "Learning web development",
            "Creating responsive designs",
            "Writing clean code",
        ];

        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const delayBetweenTexts = 2000;

        const typingElement = document.getElementById("typing-text");

        const type = () => {
            const currentText = texts[textIndex];
            if (!typingElement) return;

            if (!isDeleting) {
                if (charIndex < currentText.length) {
                    typingElement.textContent = currentText.substring(0, charIndex + 1);
                    charIndex++;
                    typingIntervalRef.current = setTimeout(type, typingSpeed);
                } else {
                    isDeleting = true;
                    typingIntervalRef.current = setTimeout(type, delayBetweenTexts);
                }
            } else {
                if (charIndex > 0) {
                    typingElement.textContent = currentText.substring(0, charIndex - 1);
                    charIndex--;
                    typingIntervalRef.current = setTimeout(type, deletingSpeed);
                } else {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                    typingIntervalRef.current = setTimeout(type, 500);
                }
            }
        };

        type();

        return () => {
            if (typingIntervalRef.current) clearTimeout(typingIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        const fetchLatestPosts = async () => {
            try {
                const { data } = await api.get("/posts");
                setLatestPosts(Array.isArray(data) ? data.slice(0, 3) : []);
            } catch {
                setLatestPosts([]);
            }
        };
        fetchLatestPosts();
    }, []);

    return (
        <div className="home-page">
            <ScrollProgress />

            <div className="page-layout">
                <aside className="sidebar">
                    <p>Hello.</p>
                    <p>I'm Jemxdev</p>

                    <h2>Welcome to My Portfolio</h2>

                    <h4>
                        <span id="typing-text"></span>
                        <span className="cursor">|</span>
                    </h4>

                    <div className="button-group">
                        <Link to="/about" className="btn btn-primary">
                            About
                        </Link>
                        <Link to="/contact" className="btn btn-outline">
                            Contact Us
                        </Link>
                    </div>
                </aside>

                <div className="main">
                    <img src={Image1} alt="Hero" className="hero-image dark-mode-image" />
                    <img src={Image2} alt="Hero" className="hero-image light-mode-image" />
                </div>
            </div>

            <main>
                <Reveal direction="left">
                    <section>
                        <h3>Key Highlights</h3>
                        <ul>
                            <li>An overview of my journey learning web development</li>
                            <li>Key skills I've built using HTML, CSS, and JavaScript</li>
                            <li>Projects, tools, and resources that shaped my growth</li>
                        </ul>
                    </section>
                </Reveal>

                <Reveal direction="right" delay={1}>
                    <section>
                        <h3>About the Topic</h3>
                        <p>
                            A brief look into my journey learning web development, the
                            challenges I faced, and how I explored modern tools and best
                            practices.
                        </p>
                    </section>
                </Reveal>

                <Reveal direction="left" delay={2}>
                    <section>
                        <h3>Get in Touch</h3>
                        <p>
                            Reach out for questions, collaboration, or to explore the
                            resources and tools that support my learning and projects.
                        </p>
                    </section>
                </Reveal>

                <Reveal direction="up" delay={3}>
                    <section className="latest-posts-section">
                        <div className="latest-posts-header">
                            <h3>Latest Posts</h3>
                            <Link to="/blog" className="btn btn-outline latest-posts-viewall">
                                View All Posts
                            </Link>
                        </div>

                        {latestPosts.length === 0 ? (
                            <p className="latest-posts-empty">No posts yet.</p>
                        ) : (
                            <div className="latest-posts-list">
                                {latestPosts.map((post) => {
                                    const imageUrl = uploadUrl(post?.image);

                                    return (
                                        <article key={post._id} className="latest-post-item">
                                            {imageUrl && (
                                                <img
                                                    src={imageUrl}
                                                    alt={post.title}
                                                    className="latest-post-item-image"
                                                />
                                            )}

                                            <div className="latest-post-item-content">
                                                <h4>
                                                    <Link to={`/post/${post._id}`}>{post.title}</Link>
                                                </h4>

                                                <p className="latest-post-item-body">
                                                    {(post.body || "").slice(0, 160)}
                                                    {(post.body || "").length > 160 ? "..." : ""}
                                                </p>

                                                <p className="latest-post-item-author">
                                                    By: {post.author?.name || "Unknown"}
                                                </p>

                                                <Link to={`/post/${post._id}`} className="latest-post-item-read">
                                                    Read More →
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </Reveal>
            </main>
        </div>
    );
}