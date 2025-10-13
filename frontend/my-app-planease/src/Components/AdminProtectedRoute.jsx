import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const AdminProtectedRoute = ({ children }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [hasAuthority, setHasAuthority] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setHasAuthority(false);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/user/getcurrentrole`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setHasAuthority(response.data.role === "Admin"); // Set true only if Admin
            } catch (error) {
                setHasAuthority(false);
            } finally {
                setLoading(false); // Only update loading here
            }
        };

        fetchRole();
    }, []);

    if (loading) return <p>Loading...</p>;

    return hasAuthority ? children : <Navigate to="/" />;
};

export default AdminProtectedRoute;
