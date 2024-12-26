import React, { useState } from "react";
import axios from "axios";

function AddProject({ ownerId }) {
    console.log(ownerId);
    const [projectDetails, setProjectDetails] = useState({
        name: "",
        description: "",
        budget: "",
        status: "Proposed",
        students_involved_count: "",
        start_date: "",
        end_date: "",
        github_link: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProjectDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedData = {
            ...projectDetails,
            budget: parseFloat(projectDetails.budget).toFixed(2),
            students_involved_count: parseInt(projectDetails.students_involved_count, 10),
            owner_id: ownerId, // Pass ownerId dynamically from the parent component
        };

        axios
            .post("/projects", formattedData)
            .then(() => {
                alert("Project added successfully!");
                setProjectDetails({
                    name: "",
                    description: "",
                    budget: "",
                    status: "Proposed",
                    students_involved_count: "",
                    start_date: "",
                    end_date: "",
                    github_link: "",
                    owner_id: { ownerId },
                });
            })
            .catch((error) => {
                console.error("Error adding project:", error);
            });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Add New Project</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Project Name"
                    value={projectDetails.name}
                    onChange={handleInputChange}
                    required
                    className="border p-2 w-full"
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={projectDetails.description}
                    onChange={handleInputChange}
                    className="border p-2 w-full"
                />
                <input
                    type="number"
                    name="budget"
                    placeholder="Budget"
                    value={projectDetails.budget}
                    onChange={handleInputChange}
                    className="border p-2 w-full"
                />
                <select
                    name="status"
                    onChange={handleInputChange}
                    className="border p-2 w-full"
                    value={projectDetails.status}
                >
                    <option value="Proposed">Proposed</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                </select>
                <input
                    type="number"
                    name="students_involved_count"
                    placeholder="Students Involved Count"
                    value={projectDetails.students_involved_count}
                    onChange={handleInputChange}
                    className="border p-2 w-full"
                />
                <input
                    type="date"
                    name="start_date"
                    value={projectDetails.start_date}
                    onChange={handleInputChange}
                    className="border p-2 w-full"
                />
                <input
                    type="date"
                    name="end_date"
                    value={projectDetails.end_date}
                    onChange={handleInputChange}
                    className="border p-2 w-full"
                />
                <input
                    type="text"
                    name="github_link"
                    placeholder="GitHub Link"
                    value={projectDetails.github_link}
                    onChange={handleInputChange}
                    className="border p-2 w-full"
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white py-2 px-4 rounded"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

export default AddProject;
