import { useCallback, useState } from "react";

export default function useNotification() {
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        type: "success",
        duration: 2500,
    });

    const showNotification = useCallback((message, type = "success", duration = 2500) => {
        setNotification({ open: true, message, type, duration });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification((prev) => ({ ...prev, open: false }));
    }, []);

    return { notification, showNotification, closeNotification };
}