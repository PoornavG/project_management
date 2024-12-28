import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function FacultyPage({ userId }) {
    const [facultyData, setFacultyData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [facultyTechnologies, setFacultyTechnologies] = useState([]);
    const [allTechnologies, setAllTechnologies] = useState([]);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Fetch faculty data and related technologies
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setError("No user ID provided.");
                return;
            }

            try {
                // Fetch faculty data
                const facultyResponse = await fetch(`/faculty/${userId}`);
                if (!facultyResponse.ok) {
                    throw new Error("Failed to fetch faculty data");
                }
                const data = await facultyResponse.json();
                setFacultyData(data);
                setEditedData(data);

                // Fetch faculty technologies using faculty_id
                if (data.faculty_id) {
                    try {
                        const techResponse = await fetch(`/faculty_technologies/${data.faculty_id}`);
                        const techData = await techResponse.json();

                        // Map the technology IDs to a consistent structure
                        const mappedTechData = techData.map(tech => ({
                            id: tech.id || tech.technology_id || tech.Technology_id,
                            name: tech.name || tech.technology_name || tech.Technology_Name
                        }));

                        setFacultyTechnologies(mappedTechData);
                    } catch (error) {
                        console.error('Error fetching faculty technologies:', error);
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    // Fetch departments
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://localhost:8080/departments");
                setDepartments(response.data);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchDepartments();
    }, []);

    // Fetch all available technologies
    useEffect(() => {
        const fetchTechnologies = async () => {
            try {
                const response = await axios.get("/technologies");
                const mappedTechnologies = response.data.map(tech => ({
                    id: tech.id || tech.technology_id || tech.Technology_id,
                    name: tech.name || tech.technology_name || tech.Technology_Name
                }));
                setAllTechnologies(mappedTechnologies);
                
            } catch (error) {
                console.error("Error fetching technologies:", error);
            }
        };

        fetchTechnologies();
    }, []);
    const getTechnologyInfo = (techId) => {
        return allTechnologies.find(tech => tech.id === techId) || null;
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // State for tracking unsaved technology changes
    const [pendingTechnologies, setPendingTechnologies] = useState(facultyTechnologies);

    const handleTechnologyChange = (selectedTech) => {
        // Create an updated list of technologies without making an API call yet
        const updatedTechnologies = pendingTechnologies.some((tech) => tech.id === selectedTech.id)
            ? pendingTechnologies.filter((tech) => tech.id !== selectedTech.id)
            : [...pendingTechnologies, selectedTech];

        // Update the pending technologies state
        setPendingTechnologies(updatedTechnologies);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Update profile data
            const profileResponse = await fetch(`/faculty/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });

            // Update technologies
            const techResponse = await axios.put(`/faculty_technologies/${facultyData.faculty_id}`, {
                technology_ids: pendingTechnologies.map((tech) => tech.id),
            });

            // Check responses for success
            if (profileResponse.ok && techResponse.status === 200) {
                setFacultyData(editedData); // Update profile state
                setFacultyTechnologies(pendingTechnologies); // Update technology state
                setIsEditing(false); // Exit editing mode
                setError(null); // Clear errors
                alert('Changes saved successfully!');
            } else {
                const errorData = await profileResponse.json();
                setError(errorData.error || 'Failed to update profile or technologies.');
            }
        } catch (err) {
            setError('Failed to save changes. Please try again later.');
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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

    if (loading || !facultyData) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    const departmentName = departments.find(dept =>
        String(dept.department_id) === String(facultyData.department_id)
    )?.name || "N/A";

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
                            {/* Existing Form Fields */}
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
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Technologies</label>
                                <div className="flex gap-4">
                                    {/* Search and Dropdown */}
                                    <div className="relative flex-grow">
                                        {/* Search Input */}
                                        <input
                                            type="text"
                                            placeholder="Search technologies..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {/* Dropdown for Search Results */}
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                                            {allTechnologies
                                                .filter(
                                                    (tech) =>
                                                        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                                        !pendingTechnologies.some((pt) => pt.id === tech.id)
                                                )
                                                .slice(0, 5) // Limit to 5 technologies
                                                .map((tech) => (
                                                    <div
                                                        key={tech.id}
                                                        className="px-4 py-2 hover:bg-amber-100 cursor-pointer"
                                                        onClick={() =>
                                                            handleTechnologyChange({
                                                                id: tech.id,
                                                                name: tech.name || tech.technology_name || tech.Technology_Name,
                                                            })
                                                        }
                                                    >
                                                        {tech.name || tech.technology_name || tech.Technology_Name}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Selected Technologies */}
                                    <div className="w-1/3 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                        <label className="block text-gray-700 font-semibold mb-2">Selected Technologies</label>
                                        <div className="flex flex-wrap gap-2">
                                            {pendingTechnologies.map((tech) => (
                                                <span
                                                    key={tech.id}
                                                    className="bg-amber-600 text-white px-4 py-2 rounded-full flex items-center"
                                                >
                                                    {tech.name || tech.technology_name || tech.Technology_Name}
                                                    <button
                                                        className="ml-2 text-white hover:text-red-500"
                                                        onClick={() => handleTechnologyChange(tech)}
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
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
                                        <p><strong className="text-gray-600">Department:</strong> {departmentName}</p>
                                        <p><strong className="text-gray-600">Role:</strong> {facultyData.role}</p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Technologies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {facultyTechnologies && facultyTechnologies.length > 0 ? (
                                            facultyTechnologies.map((tech, index) => {
                                                const fullTechInfo = getTechnologyInfo(tech.id);
                                                return (
                                                    <span
                                                        key={index}
                                                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {fullTechInfo ? fullTechInfo.name : tech.name || 'Unknown'}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-500">No technologies specified</p>
                                        )}
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