import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function MyProjects({ userId }) {
    const [userProjects, setUserProjects] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        // Fetch projects created by the user
        axios.get(`/projectsown/${userId}`)
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setUserProjects(response.data);
                } else {
                    console.error("API did not return an array.");
                    setError("Failed to load projects.");
                }
            })
            .catch((error) => {
                console.error("Error fetching user projects:", error);
                setError("Error fetching user projects.");
            });
    }, [userId]);

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
                                        <a
                                            href={project.github_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline"
                                        >
                                            GitHub Link
                                        </a>
                                    )}
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
        </div>
    );
}

export default MyProjects;
