import { useEffect } from "react";
import "./Styles/Notification.css";

export default function Notification({
                                         open,
                                         message,
                                         type = "success", // success | error | info | warning
                                         duration = 2500,
                                         onClose,
                                     }) {
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => {
            onClose?.();
        }, duration);
        return () => clearTimeout(t);
    }, [open, duration, onClose]);

    if (!open) return null;

    return (
        <div className={`notify notify-${type}`} role="status" aria-live="polite">
            <span className="notify-dot" />
            <span className="notify-message">{message}</span>
            <button
                className="notify-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}