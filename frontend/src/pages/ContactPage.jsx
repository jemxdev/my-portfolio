import "./styles/ContactPage.css";
import { useEffect, useState } from "react";
import Reveal from "../components/Reveal";
import ScrollProgress from "../components/ScrollProgress";
import { useAuth } from "../context/AuthContext";
import Notification from "../components/Notification";
import useNotification from "../hooks/useNotification";
import api from "../api/axios";

export default function ContactPage() {
    const { user } = useAuth();
    const { notification, showNotification, closeNotification } = useNotification();

    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                name: "",
                email: "",
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.name?.trim()) {
            newErrors.name = "Name is required";
        } else if (form.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(form.email.trim())) {
            newErrors.email = "Please enter a valid email";
        }

        if (!form.message?.trim()) {
            newErrors.message = "Message is required";
        } else if (form.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!validate()) return;

        try {
            setSubmitting(true);

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                message: form.message.trim(),
            };

            const { data } = await api.post("/contact", payload);

            showNotification(data?.message || "Message sent successfully!", "success");

            setForm({
                name: user?.name || "",
                email: user?.email || "",
                message: "",
            });
        } catch (err) {
            console.error("CONTACT SUBMIT ERROR:", err);
            showNotification(
                err?.response?.data?.message || err?.message || "Failed to send message",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const resources = [
        {
            name: "W3Schools",
            url: "https://www.w3schools.com",
            description: "Beginner-friendly tutorials used for quick references and practice",
        },
        {
            name: "freeCodeCamp",
            url: "https://www.freecodecamp.org",
            description: "Hands-on coding challenges and full web development courses",
        },
        {
            name: "GitHub",
            url: "https://github.com/",
            description: "Version control and project hosting for my web development projects",
        },
        {
            name: "Figma",
            url: "https://www.figma.com/",
            description: "Used to study UI layouts and translate designs into code",
        },
        {
            name: "WebStorm",
            url: "https://www.jetbrains.com/webstorm/",
            description:
                "An IDE I use for web development that helps me write cleaner code and manage projects efficiently",
        },
        {
            name: "Stack Overflow",
            url: "https://stackoverflow.com/",
            description: "Community forum used to troubleshoot coding issues",
        },
        {
            name: "GeeksforGeeks",
            url: "https://www.geeksforgeeks.org/",
            description: "Programming explanations and examples for CS concepts",
        },
    ];

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
                        <h2>Get in Touch</h2>

                        <form onSubmit={handleSubmit}>
                            <div className={`form-field ${errors.name ? "has-error" : ""}`}>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    readOnly={!!user}
                                />
                                {errors.name && <span className="error">{errors.name}</span>}
                            </div>

                            <div className={`form-field ${errors.email ? "has-error" : ""}`}>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    readOnly={!!user}
                                />
                                {errors.email && <span className="error">{errors.email}</span>}
                            </div>

                            <div className={`form-field ${errors.message ? "has-error" : ""}`}>
                                <label>Message:</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder="Your message here..."
                                />
                                {errors.message && <span className="error">{errors.message}</span>}
                            </div>

                            <button type="submit" disabled={submitting}>
                                {submitting ? "Sending..." : "Submit"}
                            </button>
                        </form>
                    </section>
                </Reveal>

                <Reveal direction="up" delay={1}>
                    <section>
                        <h2>Resources & External Links</h2>
                        <table>
                            <thead>
                            <tr>
                                <th>Resource Name</th>
                                <th>Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {resources.map((resource, index) => (
                                <tr key={index}>
                                    <td>
                                        <a href={resource.url} target="_blank" rel="noreferrer">
                                            {resource.name}
                                        </a>
                                    </td>
                                    <td>{resource.description}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                </Reveal>

                <Reveal direction="up" delay={2}>
                    <section>
                        <h2>Location</h2>
                        <div className="map-wrap">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9767983.308107397!2d112.50944924210893!3d11.531885003155853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x324053215f87de63%3A0x784790ef7a29da57!2sPhilippines!5e1!3m2!1sen!2sph!4v1775817239798!5m2!1sen!2sph"
                                width="600"
                                height="450"
                                style={{ border: "0" }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Don Mariano Marcos Memorial State University"
                            />
                        </div>
                    </section>
                </Reveal>
            </main>
        </div>
    );
}