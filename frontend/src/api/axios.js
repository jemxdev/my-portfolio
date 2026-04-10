import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: false,
    timeout: 15000,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    // Do NOT attach token to public contact endpoint
    const url = config.url || "";
    const isContact = url === "/contact" || url.startsWith("/contact?");

    if (token && !isContact) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default instance;