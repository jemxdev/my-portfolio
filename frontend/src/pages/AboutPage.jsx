import "./styles/AboutPage.css";

import batoImg from "../assets/about/batobatopik.png";
import studyImg from "../assets/about/studytime.png";
import about1 from "../assets/about/about1.png";
import about2 from "../assets/about/about2.png";

import ScrollProgress from "../components/ScrollProgress";
import Reveal from "../components/Reveal";
import Quiz from "../components/Quiz";

export default function AboutPage() {
    return (
        <div className="about-page">
            <ScrollProgress />

            {/* TITLE */}
            <Reveal direction="up">
                <div className="about-title">
                    <h1>About</h1>
                    <p>A closer look at my journey and passion for web programming</p>
                </div>
            </Reveal>

            {/* PROGRAMMING WORKS */}
            <Reveal direction="up" delay={1}>
                <section>
                    <h2>Programming Works</h2>

                    <div className="works-grid">
                        <a
                            href="https://github.com/ze-r0o0/BatoBatoPikGame"
                            target="_blank"
                            rel="noreferrer"
                            className="work-card"
                        >
                            <img src={batoImg} alt="Game Screenshot" />
                            <div className="work-overlay">View on GitHub →</div>
                            <div className="work-content">
                                <h4>Bato Bato Pik Game</h4>
                                <p>
                                    A simple game project showcasing logic, conditions and object
                                    oriented concepts.
                                </p>
                                <div className="tags">
                                    <span>Java</span>
                                    <span>Game</span>
                                    <span>OOP</span>
                                </div>
                            </div>
                        </a>

                        <a
                            href="https://github.com/ze-r0o0/studytime"
                            target="_blank"
                            rel="noreferrer"
                            className="work-card"
                        >
                            <img src={studyImg} alt="Study Time" />
                            <div className="work-overlay">View on GitHub →</div>
                            <div className="work-content">
                                <h4>Study Time</h4>
                                <p>
                                    A web based study tracker built to practice component based UI
                                    and responsiveness.
                                </p>
                                <div className="tags">
                                    <span>React</span>
                                    <span>Web Dev</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </section>
            </Reveal>

            {/* MINI GAME / QUIZ */}
            <Reveal direction="up" delay={2}>
                <section>
                    <h2>Mini Game</h2>

                    <div className="works-grid">
                        <div className="work-card quiz-card">
                            <div className="work-content">
                                <Quiz />
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* WHAT I LOVE */}
            <Reveal direction="left" delay={3}>
                <section className="about-split">
                    <div className="about-text">
                        <h2>What I Love About Web Programming</h2>
                        <p>
                            Web programming allows me to transform ideas into interactive and
                            functional websites. Seeing code run in the browser gives a strong
                            sense of achievement.
                        </p>
                        <p>
                            I enjoy how web development combines logic and creativity. Writing
                            clean code, designing layouts, and improving user experience all
                            work together.
                        </p>
                    </div>
                    <div className="about-image">
                        <img src={about1} alt="Working" />
                    </div>
                </section>
            </Reveal>

            {/* JOURNEY */}
            <Reveal direction="right" delay={4}>
                <section className="about-full">
                    <h2>My Journey with Web Programming</h2>
                    <p>
                        My journey started when I was introduced to basic HTML and CSS in
                        school. Through practice and experimentation I slowly understood how
                        different parts of a website work together.
                    </p>
                    <div className="parallax-wrap">
                        <img src={about2} alt="Learning" />
                    </div>
                </section>
            </Reveal>

            {/* TIMELINE */}
            <Reveal direction="up" delay={5}>
                <section>
                    <h2>My Learning Timeline</h2>
                    <ol>
                        <li>
                            I was first introduced to HTML during Grade 7 in high school,
                            where I learned the basic structure of web pages and how content
                            is displayed in a browser.
                        </li>
                        <li>
                            From Grade 8 to Grade 10, my interest in web development grew as I
                            continued exploring HTML and became more curious about how
                            websites are designed and built.
                        </li>
                        <li>
                            During these years, I experimented with simple layouts and tried
                            modifying existing web pages, which helped me understand how small
                            changes in code affect the overall design.
                        </li>
                        <li>
                            In my first year of college, I was exposed to HTML again, this
                            time with a deeper focus on proper structure, best practices, and
                            real-world usage.
                        </li>
                        <li>
                            I started researching modern web technologies such as CSS
                            frameworks, JavaScript libraries, and frontend tools used in
                            professional web development.
                        </li>
                        <li>
                            As I learned more, I became interested in how different web
                            technology stacks work together to create responsive, efficient,
                            and user-friendly applications.
                        </li>
                    </ol>
                </section>
            </Reveal>

            {/* QUOTE */}
            <Reveal direction="up" delay={6}>
                <blockquote className="about-quote">
                    Web development is not just about writing code, it's about creating
                    experiences.
                </blockquote>
            </Reveal>
        </div>
    );
}