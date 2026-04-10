// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;

    // Not logged in
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role-protected route (admin only)
    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}