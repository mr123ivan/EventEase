import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";


const SubContractorProtectedRoute = ({ children }) => {
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

                setHasAuthority(response.data.role === "Admin"||response.data.role === 'SubContractor'); // Check if role is ADMIN or SUBCONTRACTOR
            } catch (error) {
                console.error("Error fetching role:", error.response?.data || error.message);
                setHasAuthority(false);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    if (loading) return <p>Loading...</p>; 

    return hasAuthority ? children : <Navigate to="/" />;
};

export default SubContractorProtectedRoute;
