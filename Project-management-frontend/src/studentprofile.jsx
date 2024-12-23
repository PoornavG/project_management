import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function StudentPage({ userId }) {
    const [studentData, setStudentData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [studentTechnologies, setStudentTechnologies] = useState([]);
    const [allTechnologies, setAllTechnologies] = useState([]);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setError("No user ID provided.");
                return;
            }

            try {
                // Fetch student data
                const studentResponse = await fetch(`/students/${userId}`);
                if (!studentResponse.ok) {
                    throw new Error("Failed to fetch student data");
                }
                const data = await studentResponse.json();
                setStudentData(data);
                setEditedData(data);

                // Fetch student technologies using student_id
                if (data.student_id) {
                    try {
                        const techResponse = await fetch(`/student_technologies/${data.student_id}`);
                        const techData = await techResponse.json();

                        // Map the technology IDs to a consistent structure
                        const mappedTechData = techData.map(tech => ({
                            id: tech.id || tech.technology_id || tech.Technology_id,
                            name: tech.name || tech.technology_name || tech.Technology_Name
                        }));

                        setStudentTechnologies(mappedTechData);
                    } catch (error) {
                        console.error('Error fetching student technologies:', error);
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
    const departmentName = departments.find(dept => String(dept.department_id) === String(studentData.department_id))?.name || "N/A";
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
        setEditedData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const [pendingTechnologies, setPendingTechnologies] = useState(studentTechnologies);

    const handleTechnologyChange = (selectedTech) => {
        // Update pending technologies
        const updatedTechnologies = pendingTechnologies.some((tech) => tech.id === selectedTech.id)
            ? pendingTechnologies.filter((tech) => tech.id !== selectedTech.id)
            : [...pendingTechnologies, selectedTech];

        setPendingTechnologies(updatedTechnologies);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update profile data
            const profileResponse = await fetch(`/students/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });

            // Update technologies
            const techResponse = await axios.put(`/student_technologies/${studentData.student_id}`, {
                technology_ids: pendingTechnologies.map((tech) => tech.id),
            });

            if (profileResponse.ok && techResponse.status === 200) {
                setStudentData(editedData); // Update profile state
                setStudentTechnologies(pendingTechnologies); // Update technology state
                setIsEditing(false);
                setError(null);
                alert('Changes saved successfully!');
            } else {
                const errorData = await profileResponse.json();
                setError(errorData.error || 'Failed to update profile or technologies.');
            }
        } catch (err) {
            setError('Failed to save changes. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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
                            {/* Technology Editor */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Technologies</label>
                                <div className="relative">
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
                                <div className="mt-4 flex flex-wrap gap-2">
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
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {studentData.name}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    USN: {studentData.usn}
                                </p>
                            </div>

                            {/* Technologies Section */}
                            <div className="bg-gradient-to-r from-white to-white p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-black mb-2">
                                    Technologies
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {studentTechnologies && studentTechnologies.length > 0 ? (
                                        studentTechnologies.map((tech, index) => {
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
                                        <p className="text-gray-200">No technologies specified</p>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Profile Information */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Academic Details */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                        Academic Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <p>
                                            <strong className="text-gray-600">Department:</strong>{" "}
                                            {departmentName}
                                        </p>
                                        <p>
                                            <strong className="text-gray-600">CGPA:</strong>{" "}
                                            {studentData.cgpa}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <p>
                                            <strong className="text-gray-600">Email:</strong>{" "}
                                            {studentData.personal_email}
                                        </p>
                                        <p>
                                            <strong className="text-gray-600">Phone:</strong>{" "}
                                            {studentData.phone_no}
                                        </p>
                                    </div>
                                </div>

                                {/* Professional Profiles */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                        Professional Profiles
                                    </h3>
                                    <div className="space-y-3">
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

export default StudentPage;