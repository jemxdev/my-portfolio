import { useEffect } from "react";
import "./Styles/ScrollProgress.css";

export default function ScrollProgress() {
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            const progressBar = document.getElementById("scroll-progress");
            if (progressBar) {
                progressBar.style.width = scrolled + "%";
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return <div id="scroll-progress"></div>;
}