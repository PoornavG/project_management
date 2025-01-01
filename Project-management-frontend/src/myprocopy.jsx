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
    const [allTechnologies, setAllTechnologies] = useState([]);
    const [projectTechnologies, setProjectTechnologies] = useState({});
    const [pendingTechnologies, setPendingTechnologies] = useState({});
    const [allStudents, setAllStudents] = useState([]);
    const [projectStudents, setProjectStudents] = useState({});
    const [pendingStudents, setPendingStudents] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [studentSearchTerm, setStudentSearchTerm] = useState(""); // New state for student search

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`/projectsown/${userId}`);
                if (Array.isArray(response.data)) {
                    setUserProjects(response.data);
                    response.data.forEach(project => {
                        fetchProjectTechnologies(project.project_id);
                        fetchProjectStudents(project.project_id);
                    });
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

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get("/studentsidusn");
                const mappedStudents = response.data.map(student => ({
                    id: student.student_id,
                    usn: student.usn,
                }));
                setAllStudents(mappedStudents);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchStudents();
    }, []);

    const fetchProjectTechnologies = async (projectId) => {
        try {
            const response = await axios.get(`/project_technologies/${projectId}`);
            const mappedTechData = response.data.map(tech => ({
                id: tech.id || tech.technology_id || tech.Technology_id,
                name: tech.name || tech.technology_name || tech.Technology_Name || getTechnologyInfo(tech.id)?.name
            }));
            setProjectTechnologies(prev => ({
                ...prev,
                [projectId]: mappedTechData
            }));
        } catch (error) {
            console.error(`Error fetching technologies for project ${projectId}:`, error);
        }
    };

    const fetchProjectStudents = async (projectId) => {
        try {
            const response = await axios.get(`/project_students/${projectId}`);
            const mappedStudentData = response.data.map(student => ({
                id: student.student_id,
                usn: student.usn,
            }));
            setProjectStudents(prev => ({
                ...prev,
                [projectId]: mappedStudentData
            }));
        } catch (error) {
            console.error(`Error fetching students for project ${projectId}:`, error);
        }
    };

    const getTechnologyInfo = (techId) => {
        return allTechnologies.find(tech => tech.id === techId) || null;
    };

    const openModal = (project) => {
        setSelectedProject(project);
        setUpdatedFields({ ...project });
        setPendingTechnologies({
            ...pendingTechnologies,
            [project.project_id]: projectTechnologies[project.project_id] || []
        });
        setPendingStudents({
            ...pendingStudents,
            [project.project_id]: projectStudents[project.project_id] || []
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
        setUpdatedFields({});
        setSearchTerm("");
        setStudentSearchTerm("");
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setUpdatedFields(prev => ({ ...prev, [name]: value }));
    };

    const handleTechnologyChange = (selectedTech) => {
        if (!selectedProject) return;

        const projectId = selectedProject.project_id;
        const currentTechnologies = pendingTechnologies[projectId] || [];

        const updatedTechnologies = currentTechnologies.some(tech => tech.id === selectedTech.id)
            ? currentTechnologies.filter(tech => tech.id !== selectedTech.id)
            : [...currentTechnologies, selectedTech];

        setPendingTechnologies(prev => ({
            ...prev,
            [projectId]: updatedTechnologies
        }));
    };

    const handleStudentChange = (selectedStudent) => {
        if (!selectedProject) return;

        const projectId = selectedProject.project_id;
        const currentStudents = pendingStudents[projectId] || [];

        const updatedStudents = currentStudents.some(student => student.id === selectedStudent.id)
            ? currentStudents.filter(student => student.id !== selectedStudent.id)
            : [...currentStudents, selectedStudent];

        setPendingStudents(prev => ({
            ...prev,
            [projectId]: updatedStudents
        }));
    };

    const saveChanges = async () => {
        setLoading(true);
        try {
            await axios.put(`/projects/${selectedProject.project_id}`, updatedFields);

            await axios.put(`/project_technologies/${selectedProject.project_id}`, {
                technology_ids: pendingTechnologies[selectedProject.project_id].map(tech => tech.id)
            });

            await axios.put(`/project_students/${selectedProject.project_id}`, {
                student_ids: pendingStudents[selectedProject.project_id].map(student => student.id)
            });

            setUserProjects(prevProjects =>
                prevProjects.map(project =>
                    project.project_id === selectedProject.project_id
                        ? { ...project, ...updatedFields }
                        : project
                )
            );

            setProjectTechnologies(prev => ({
                ...prev,
                [selectedProject.project_id]: pendingTechnologies[selectedProject.project_id]
            }));

            setProjectStudents(prev => ({
                ...prev,
                [selectedProject.project_id]: pendingStudents[selectedProject.project_id]
            }));

            closeModal();
        } catch (err) {
            console.error("Error saving changes:", err);
            setError("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen bg-white">
            <div className="w-1/2 p-8">
                <h1 className="text-2xl font-bold mb-6">Projects Created by You</h1>
                <Link to={`/add-project/${userId}`}>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4">
                        Add New Project
                    </button>
                </Link>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Project List</h2>
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
                                    <div className="mt-2">
                                        <p className="font-semibold">Technologies:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {projectTechnologies[project.project_id]?.length > 0 ? (
                                                projectTechnologies[project.project_id].map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {tech.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-500">No technologies specified</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-semibold">Students:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {projectStudents[project.project_id]?.length > 0 ? (
                                                projectStudents[project.project_id].map((student, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {student.usn}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-500">No students specified</p>
                                            )}
                                        </div>
                                    </div>
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-2/3 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Edit Project</h2>
                        <form>
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

                            {/* Technologies Section */}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Technologies</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Search technologies..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            value={searchTerm}
                                        />
                                        {searchTerm && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                                                {allTechnologies
                                                    .filter(
                                                        (tech) =>
                                                            tech.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                                            !pendingTechnologies[selectedProject?.project_id]?.some((pt) => pt.id === tech.id)
                                                    )
                                                    .slice(0, 5)
                                                    .map((tech) => (
                                                        <div
                                                            key={tech.id}
                                                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                                            onClick={() => {
                                                                handleTechnologyChange(tech);
                                                                setSearchTerm("");
                                                            }}
                                                        >
                                                            {tech.name}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-1/3 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                        <label className="block text-gray-700 font-semibold mb-2">Selected Technologies</label>
                                        <div className="flex flex-wrap gap-2">
                                            {pendingTechnologies[selectedProject?.project_id]?.map((tech) => (
                                                <span
                                                    key={tech.id}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center"
                                                >
                                                    {tech.name}
                                                    <button
                                                        type="button"
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

                            {/* Students Section */}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Students</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                                            value={studentSearchTerm}
                                        />
                                        {studentSearchTerm && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                                                {allStudents
                                                    .filter(
                                                        (student) =>
                                                            student.usn.toLowerCase().includes(studentSearchTerm.toLowerCase()) &&
                                                            !pendingStudents[selectedProject?.project_id]?.some((ps) => ps.id === student.id)
                                                    )
                                                    .slice(0, 5)
                                                    .map((student) => (
                                                        <div
                                                            key={student.id}
                                                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                                            onClick={() => {
                                                                handleStudentChange(student);
                                                                setStudentSearchTerm("");
                                                            }}
                                                        >
                                                            {student.usn}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-1/3 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                        <label className="block text-gray-700 font-semibold mb-2">Selected Students</label>
                                        <div className="flex flex-wrap gap-2">
                                            {pendingStudents[selectedProject?.project_id]?.map((student) => (
                                                <span
                                                    key={student.id}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center"
                                                >
                                                    {student.usn}
                                                    <button
                                                        type="button"
                                                        className="ml-2 text-white hover:text-red-500"
                                                        onClick={() => handleStudentChange(student)}
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                    className={`py-1 px-3 rounded ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"}`}
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