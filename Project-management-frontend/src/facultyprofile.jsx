import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FacultyPage({ userId }) {
    const [facultyData, setFacultyData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFacultyData = async () => {
            if (!userId) {
                console.error("No user ID provided.");
                setError("No user ID provided.");
                return;
            }

            console.log(`Fetching data for userId: ${userId}`); // Log userId to verify
            try {
                const response = await fetch(`/faculty/${userId}`);
                console.log("Response Status: ", response.status); // Log status of response
                if (response.ok) {
                    const data = await response.json();
                    console.log("Fetched Faculty Data: ", data); // Log fetched data
                    setFacultyData(data);
                    setEditedData(data);
                } else {
                    const errorData = await response.json();
                    console.log("Error fetching data: ", errorData); // Log error response
                    setError(errorData.error);
                }
            } catch (err) {
                console.error("Failed to fetch faculty data: ", err); // Log fetch error
                setError("Failed to fetch faculty data. Please try again later.");
            }
        };

        fetchFacultyData();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field changed: ${name}, New value: ${value}`); // Log field change
        setEditedData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        console.log("Updated Data to Submit: ", editedData); // Log the data being submitted

        try {
            const response = await fetch(`/faculty/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData)
            });

            if (response.ok) {
                console.log("Profile updated successfully"); // Log success
                setFacultyData(editedData);
                setIsEditing(false);
                setError(null);
                alert('Profile updated successfully!');
            } else {
                const errorData = await response.json();
                console.log("Error updating profile: ", errorData); // Log error response
                setError(errorData.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error("Failed to update faculty data: ", err); // Log update error
            setError("Failed to update faculty data. Please try again later.");
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
                <div className="bg-white shadow-xl rounded-lg p-8 text-center max-w-md w-full">
                    <p className="text-red-500 mb-4 text-lg">{error}</p>
                    <button
                        className="bg-amber-600 text-white py-2 px-6 rounded-lg hover:bg-amber-700 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => {
                            setError(null);
                            setIsEditing(true);
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!facultyData) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-amber-600 to-brown-700 p-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        <button
                            className="bg-white text-brown-600 py-2 px-6 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="p-8">
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={editedData.designation}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Personal Email</label>
                                    <input
                                        type="email"
                                        name="personal_email"
                                        value={editedData.personal_email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone_no"
                                        value={editedData.phone_no}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        name="linkedin_profile"
                                        value={editedData.linkedin_profile}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">GitHub Profile</label>
                                    <input
                                        type="url"
                                        name="github_profile"
                                        value={editedData.github_profile}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-amber-600 to-brown-700 text-white py-3 rounded-lg hover:opacity-90 transition duration-300 ease-in-out transform hover:scale-[1.01] shadow-lg"
                            >
                                Save Changes
                            </button>
                        </form>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Profile Image and Basic Info */}
                            <div className="md:col-span-1 text-center">
                                <img
                                    src={`data:image/jpeg;base64,${facultyData.image}`}
                                    alt="Profile"
                                    className="w-48 h-48 object-cover rounded-full mx-auto mb-4 shadow-lg border-4 border-white"
                                />
                                <h2 className="text-2xl font-bold text-gray-800">{facultyData.name}</h2>
                                <p className="text-gray-500 text-sm">{facultyData.designation}</p>
                            </div>

                            {/* Detailed Profile Information */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Professional Details</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <p><strong className="text-gray-600">Department:</strong> {facultyData.department_id}</p>
                                        <p><strong className="text-gray-600">Role:</strong> {facultyData.role}</p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Contact Information</h3>
                                    <div className="space-y-2">
                                        <p><strong className="text-gray-600">Email:</strong> {facultyData.personal_email}</p>
                                        <p><strong className="text-gray-600">Phone:</strong> {facultyData.phone_no}</p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Professional Profiles</h3>
                                    <div className="space-y-2">
                                        <p>
                                            <strong className="text-gray-600">LinkedIn:</strong>{" "}
                                            <a
                                                href={facultyData.linkedin_profile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-amber-600 hover:underline"
                                            >
                                                {facultyData.linkedin_profile}
                                            </a>
                                        </p>
                                        <p>
                                            <strong className="text-gray-600">GitHub:</strong>{" "}
                                            <a
                                                href={facultyData.github_profile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-amber-600 hover:underline"
                                            >
                                                {facultyData.github_profile}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FacultyPage;
