const envBase =
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
    "http://localhost:5000/api";

const API_BASE_URL = envBase.replace(/\/+$/, "");
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export function uploadUrl(fileName) {
    if (!fileName) return "";
    return `${API_ORIGIN}/uploads/${fileName}`;
}