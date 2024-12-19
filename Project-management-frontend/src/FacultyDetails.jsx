import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function FacultyDetails({ userId: userIdProp, onComplete }) {
    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId || userIdProp; // Ensure we get userId

    const [formData, setFormData] = useState({
        name: "",
        department_id: "", // This will hold the selected department ID
        designation: "",
        role: "",
        personal_email: "",
        phone_no: "",
        linkedin_profile: "",
        github_profile: "",
    });

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://localhost:8080/departments");
                setDepartments(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching departments:", error);
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/faculty", {
                user_id: userId, // Include userId
                ...formData,
            });

            alert("Faculty details added successfully!");
            navigate("/home", { state: { userId } });
        } catch (error) {
            console.error("Error adding faculty details:", error);
            alert("Failed to add faculty details. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Faculty Details</h1>
                <form onSubmit={handleSubmit}>
                    {Object.keys(formData).map((key) => {
                        if (key === "department_id") {
                            return (
                                <div className="mb-4" key={key}>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Department
                                    </label>
                                    <select
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((department) => (
                                            <option key={department.department_id} value={department.department_id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        }
                        return (
                            <div className="mb-4" key={key}>
                                <label className="block text-gray-700 font-medium mb-2 capitalize">
                                    {key.replace("_", " ")}
                                </label>
                                <input
                                    type="text"
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        );
                    })}

                    {loading ? (
                        <div className="text-center text-gray-500">Loading...</div>
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Submit
                        </button>
                    )}
                </form>
                <button
                    onClick={onComplete}
                    className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default FacultyDetails;
