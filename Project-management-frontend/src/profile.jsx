import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage({ userId }) {
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await fetch(`/students/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setStudentData(data);
                    setEditedData(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error);
                }
            } catch (err) {
                setError("Failed to fetch student data. Please try again later.");
            }
        };

        if (userId) fetchStudentData();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Validate CGPA before submission
            const cgpa = parseFloat(editedData.cgpa);
            if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                setError('CGPA must be a number between 0 and 10');
                return;
            }

            const response = await fetch(`/students/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData)
            });

            if (response.ok) {
                setStudentData(editedData);
                setIsEditing(false);
                setError(null);
                alert('Profile updated successfully!');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update profile');
            }
        } catch (err) {
            setError("Failed to update student data. Please try again later.");
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white shadow-xl rounded-lg p-8 text-center max-w-md w-full">
                    <p className="text-red-500 mb-4 text-lg">{error}</p>
                    <button
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => {
                            setError(null);
                            if (error.includes('CGPA')) setIsEditing(true);
                        }}
                    >
                        {error.includes('CGPA') ? 'Fix CGPA' : 'Go Back'}
                    </button>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        <button
                            className="bg-white text-blue-600 py-2 px-6 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">CGPA</label>
                                    <input
                                        type="number"
                                        name="cgpa"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        value={editedData.cgpa}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">GitHub Profile</label>
                                    <input
                                        type="url"
                                        name="github_profile"
                                        value={editedData.github_profile}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition duration-300 ease-in-out transform hover:scale-[1.01] shadow-lg"
                            >
                                Save Changes
                            </button>
                        </form>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Profile Image and Basic Info */}
                            <div className="md:col-span-1 text-center">
                                <img
                                    src={`data:image/jpeg;base64,${studentData.image}`}
                                    alt="Profile"
                                    className="w-48 h-48 object-cover rounded-full mx-auto mb-4 shadow-lg border-4 border-white"
                                />
                                <h2 className="text-2xl font-bold text-gray-800">{studentData.name}</h2>
                                <p className="text-gray-500 text-sm">USN: {studentData.usn}</p>
                            </div>

                            {/* Detailed Profile Information */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Academic Details</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <p><strong className="text-gray-600">Department:</strong> {studentData.department_id}</p>
                                        <p><strong className="text-gray-600">CGPA:</strong> {studentData.cgpa}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Contact Information</h3>
                                    <div className="space-y-2">
                                        <p><strong className="text-gray-600">Email:</strong> {studentData.personal_email}</p>
                                        <p><strong className="text-gray-600">Phone:</strong> {studentData.phone_no}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Professional Profiles</h3>
                                    <div className="space-y-2">
                                        <p>
                                            <strong className="text-gray-600">LinkedIn:</strong>{" "}
                                            <a
                                                href={studentData.linkedin_profile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {studentData.linkedin_profile}
                                            </a>
                                        </p>
                                        <p>
                                            <strong className="text-gray-600">GitHub:</strong>{" "}
                                            <a
                                                href={studentData.github_profile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {studentData.github_profile}
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

export default ProfilePage;