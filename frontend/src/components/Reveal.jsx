import { useEffect, useRef } from "react";
import "./Styles/Reveal.css";

export default function Reveal({
                                   children,
                                   direction = "up",
                                   delay = 0,
                                   className = "",
                                   once = false // Set to true if you only want animation once
                               }) {
    const ref = useRef(null);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -100px 0px",
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    // Only unobserve if once prop is true
                    if (once) {
                        observer.unobserve(entry.target);
                    }
                } else {
                    // Remove show class when scrolling out of view (unless once is true)
                    if (!once) {
                        entry.target.classList.remove("show");
                    }
                }
            });
        }, observerOptions);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [once]);

    return (
        <div
            ref={ref}
            className={`reveal reveal-${direction} reveal-delay-${delay} ${className}`}
        >
            {children}
        </div>
    );
}