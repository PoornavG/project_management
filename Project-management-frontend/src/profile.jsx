import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentPage from "./studentprofile";   // Assuming the file name is StudentPage.jsx
import FacultyPage from "./facultyprofile";
function ProfilePage({ userId }) {
    const [role, setRole] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch user role based on the provided userId
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch("/users");
                if (response.ok) {
                    const users = await response.json();
                    const currentUser = users.find(user => user.user_id === userId);
                    if (currentUser) {
                        setRole(currentUser.role);
                    } else {
                        setError('User not found');
                    }
                } else {
                    setError('Failed to fetch user roles');
                }
            } catch (err) {
                setError("Failed to fetch user role. Please try again later.");
            }
        };

        if (userId) fetchUserRole();
    }, [userId]);

    // Handle error
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white shadow-xl rounded-lg p-8 text-center max-w-md w-full">
                    <p className="text-red-500 mb-4 text-lg">{error}</p>
                    <button
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => setError(null)}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Render the StudentPage directly if the role is "Student"
    if (role === "Student") {
        return <StudentPage userId={userId} />;
    }

    if (role === 'Faculty') {
        return <FacultyPage userId={userId} />;
    }
    // You can handle other roles here like "Faculty", or display default message
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-lg text-gray-700">Role-based profile page for other roles goes here.</p>
        </div>
    );
}

export default ProfilePage;
