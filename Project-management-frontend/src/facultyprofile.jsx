import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, X, ChevronDown } from 'lucide-react';


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
    const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);
    const [techSearch, setTechSearch] = useState('');
    const techDropdownRef = useRef(null);
    const [pendingTechnologies, setPendingTechnologies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
                setIsTechDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const filteredTechnologies = allTechnologies.filter(tech =>
        tech.name.toLowerCase().includes(techSearch.toLowerCase()) &&
        !pendingTechnologies.some(pt => pt.id === tech.id)
    );

    const toggleTech = (techId, techName) => {
        setPendingTechnologies(prev =>
            prev.some(tech => tech.id === techId)
                ? prev.filter(tech => tech.id !== techId)
                : [...prev, { id: techId, name: techName }]
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
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
                technology_ids: pendingTechnologies.map(tech => tech.id),
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

    const technologiesSection = (
        <div className="space-y-4">
            <label className="block text-gray-700 font-semibold">Technologies</label>

            {/* Technologies Dropdown */}
            <div className="relative" ref={techDropdownRef}>
                <button
                    type="button"
                    className="w-full border rounded-lg p-3 flex justify-between items-center bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onClick={() => setIsTechDropdownOpen(!isTechDropdownOpen)}
                >
                    <span className="text-gray-700">
                        {pendingTechnologies.length
                            ? `${pendingTechnologies.length} technologies selected`
                            : 'Select Technologies'}
                    </span>
                    <ChevronDown className="text-gray-400" size={20} />
                </button>

                {isTechDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <div className="p-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search technologies..."
                                    className="w-full pl-10 p-2 border rounded-lg"
                                    value={techSearch}
                                    onChange={(e) => setTechSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {filteredTechnologies.map((tech) => (
                                <div
                                    key={tech.id}
                                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => toggleTech(tech.id, tech.name)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={pendingTechnologies.some(t => t.id === tech.id)}
                                        onChange={() => { }}
                                        className="mr-2"
                                    />
                                    <span>{tech.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Technologies Display */}
            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {pendingTechnologies.map((tech) => (
                        <span
                            key={tech.id}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                            {tech.name}
                            <button
                                type="button"
                                onClick={() => toggleTech(tech.id, tech.name)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

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

                            {technologiesSection}

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