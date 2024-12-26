import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function MyProjects({ userId }) {
    const [userProjects, setUserProjects] = useState([]);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [updatedFields, setUpdatedFields] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch projects created by the user
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`/projectsown/${userId}`);
                if (Array.isArray(response.data)) {
                    setUserProjects(response.data);
                } else {
                    throw new Error("Unexpected response format.");
                }
            } catch (err) {
                console.error("Error fetching user projects:", err);
                setError("Failed to load projects.");
            }
        };

        fetchProjects();
    }, [userId]);

    const openModal = (project) => {
        setSelectedProject(project);
        setUpdatedFields({ ...project }); // Populate fields with current project details
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
        setUpdatedFields({});
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setUpdatedFields((prevFields) => ({ ...prevFields, [name]: value }));
    };

    const saveChanges = async () => {
        setLoading(true);
        try {
            await axios.put(`/projects/${selectedProject.project_id}`, updatedFields);
            setUserProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.project_id === selectedProject.project_id
                        ? { ...project, ...updatedFields }
                        : project
                )
            );
            closeModal();
        } catch (err) {
            console.error("Error saving project changes:", err);
            setError("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full">
            {/* Left Side: Projects Created by User */}
            <div className="w-1/2 p-6 border-r border-gray-300">
                <h1 className="text-2xl font-bold mb-4">Projects Created by You</h1>
                <Link to={`/add-project/${userId}`}>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4">
                        Add New Project
                    </button>
                </Link>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Project List</h2>
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : userProjects.length > 0 ? (
                        <ul>
                            {userProjects.map((project) => (
                                <li key={project.project_id} className="border p-2 mb-2">
                                    <h3 className="font-bold">{project.name}</h3>
                                    <p>{project.description}</p>
                                    <p>Budget: {project.budget}</p>
                                    <p>Status: {project.status}</p>
                                    <p>Start Date: {project.start_date}</p>
                                    <p>End Date: {project.end_date}</p>
                                    {project.github_link && (
                                        <button
                                            onClick={() => window.open(project.github_link, "_blank")}
                                            className="text-blue-500 underline"
                                        >
                                            GitHub Link
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openModal(project)}
                                        className="bg-green-500 text-white py-1 px-3 rounded mt-2"
                                    >
                                        Edit
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No projects created by you yet.</p>
                    )}
                </div>
            </div>

            {/* Right Side: Placeholder for Other Content */}
            <div className="w-1/2 p-6">
                <h1 className="text-2xl font-bold mb-4">Other Side Content</h1>
                <p>Placeholder for additional content to be defined later.</p>
            </div>

            {/* Edit Modal */}
            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h2 className="text-xl font-bold mb-4">Edit Project</h2>
                        <form>
                            {/* Name */}
                            <label className="block mb-2">
                                Name:
                                <input
                                    type="text"
                                    name="name"
                                    value={updatedFields.name || ""}
                                    onChange={handleFieldChange}
                                    className="border p-1 w-full"
                                    required
                                />
                            </label>

                            {/* Description */}
                            <label className="block mb-2">
                                Description:
                                <textarea
                                    name="description"
                                    value={updatedFields.description || ""}
                                    onChange={handleFieldChange}
                                    className="border p-1 w-full"
                                    required
                                />
                            </label>

                            {/* Budget */}
                            <label className="block mb-2">
                                Budget:
                                <input
                                    type="number"
                                    name="budget"
                                    value={updatedFields.budget || ""}
                                    onChange={handleFieldChange}
                                    className="border p-1 w-full"
                                />
                            </label>

                            {/* Status */}
                            <label className="block mb-2">
                                Status:
                                <select
                                    name="status"
                                    value={updatedFields.status || ""}
                                    onChange={handleFieldChange}
                                    className="border p-1 w-full"
                                >
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Proposed">Proposed</option>
                                </select>
                            </label>

                            {/* Start Date */}
                            <label className="block mb-2">
                                Start Date:
                                <input
                                    type="date"
                                    name="start_date"
                                    value={updatedFields.start_date || ""}
                                    onChange={handleFieldChange}
                                    className="border p-1 w-full"
                                />
                            </label>

                            {/* End Date */}
                            <label className="block mb-2">
                                End Date:
                                <input
                                    type="date"
                                    name="end_date"
                                    value={updatedFields.end_date || ""}
                                    onChange={handleFieldChange}
                                    className="border p-1 w-full"
                                />
                            </label>

                            {/* GitHub Link */}
                            <label className="block mb-2">
                                GitHub Link:
                                <input
                                    type="url"
                                    name="github_link"
                                    value={updatedFields.github_link || ""}
                                    onChange={handleFieldChange}
                                    className="border p-1 w-full"
                                />
                            </label>

                            {/* Modal Actions */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-300 text-black py-1 px-3 rounded mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveChanges}
                                    className={`py-1 px-3 rounded ${loading
                                        ? "bg-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white"
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default MyProjects;
