const envBase =
    (typeof process !== "undefined" &&
        process.env &&
        process.env.REACT_APP_API_URL) ||
    "https://my-portfolio-oe6w.onrender.com/api";

const API_BASE_URL = envBase.replace(/\/+$/, "");
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export function uploadUrl(fileName) {
    if (!fileName) return "";

    // If the fileName is already a full Cloudinary URL, return it directly
    if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
        return fileName;
    }

    // OLD: Fallback for old images that only saved the filename
    return `${API_ORIGIN}/uploads/${fileName}`;
}