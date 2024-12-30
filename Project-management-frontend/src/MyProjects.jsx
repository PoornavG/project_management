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
    const [allThemes, setAllThemes] = useState([]);
    const [projectThemes, setProjectThemes] = useState({});
    const [pendingThemes, setPendingThemes] = useState({});
    const [allStudents, setAllStudents] = useState([]);
    const [projectStudents, setProjectStudents] = useState({});
    const [pendingStudents, setPendingStudents] = useState({});
    const [allFacultys, setAllFacultys] = useState([]);
    const [projectFacultys, setProjectFacultys] = useState({});
    const [pendingFacultys, setPendingFacultys] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [themeSearchTerm, setThemeSearchTerm] = useState("");
    const [studentSearchTerm, setStudentSearchTerm] = useState(""); // New state for student search
    const [facultySearchTerm, setFacultySearchTerm] = useState("");
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`/projectsown/${userId}`);
                if (Array.isArray(response.data)) {
                    setUserProjects(response.data);
                    response.data.forEach(project => {
                        fetchProjectTechnologies(project.project_id);
                        fetchProjectStudents(project.project_id);
                        fetchProjectFacultys(project.project_id);
                        fetchProjectThemes(project.project_id);
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
        const fetchThemes = async () => {
            try {
                const response = await axios.get("/themes");
                const mappedThemes = response.data.map(theme => ({
                    id: theme.id || theme.theme_id || theme.Theme_id,
                    name: theme.name || theme.theme_name || theme.Theme_Name
                }));
                setAllThemes(mappedThemes);

            } catch (error) {
                console.error("Error fetching Themes:", error);
            }
        };
        fetchThemes();
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
    useEffect(() => {
        const fetchFacultys = async () => {
            try {
                const response = await axios.get("/facultyidname");
                const mappedFacultys = response.data.map(faculty => ({
                    id: faculty.faculty_id,
                    name: faculty.name,
                }));
                setAllFacultys(mappedFacultys);
            } catch (error) {
                console.error("Error fetching facultys:", error);
            }
        };

        fetchFacultys();
    }, []);


    const fetchProjectTechnologies = async (projectId) => {
        try {
            // Fetch project technologies
            const projectTechResponse = await axios.get(`/project_technologies/${projectId}`);
            const projectTechData = projectTechResponse.data;

            // Fetch all technologies
            const techResponse = await axios.get("/technologies");
            const allTechnologies = techResponse.data;

            // Map project technologies with their names
            const mappedTechData = projectTechData.map(projTech => {
                const matchingTech = allTechnologies.find(tech =>
                    tech.Technology_id === projTech.technology_id
                );
                return {
                    id: projTech.technology_id,
                    name: matchingTech ? matchingTech.Technology_Name : 'Unnamed Technology',
                };
            });

            console.log("Mapped Project Technologies:", mappedTechData);

            // Set state with the mapped data
            setProjectTechnologies(prev => ({
                ...prev,
                [projectId]: mappedTechData,
            }));
        } catch (error) {
            console.error(`Error fetching technologies for project ${projectId}:`, error);
        }
    };

    const fetchProjectThemes = async (projectId) => {
        try {
            // Fetch project themes
            const projectThemeResponse = await axios.get(`/project_themes/${projectId}`);
            const projectThemeData = projectThemeResponse.data;

            // Fetch all themes
            const themeResponse = await axios.get("/themes");
            const allThemes = themeResponse.data;

            // Map project themes with their names
            const mappedThemeData = projectThemeData.map(projTheme => {
                const matchingTheme = allThemes.find(theme =>
                    theme.Theme_id === projTheme.theme_id
                );
                return {
                    id: projTheme.theme_id,
                    name: matchingTheme ? matchingTheme.Theme_Name : 'Unnamed Theme',
                };
            });

            console.log("Mapped Project Themes:", mappedThemeData);

            // Set state with the mapped data
            setProjectThemes(prev => ({
                ...prev,
                [projectId]: mappedThemeData,
            }));
        } catch (error) {
            console.error(`Error fetching themes for project ${projectId}:`, error);
        }
    };


    const fetchProjectStudents = async (projectId) => {
        try {
            // Fetch project students
            const projectStudentsResponse = await axios.get(`/project_students/${projectId}`);
            const projectStudentsData = projectStudentsResponse.data;

            // Fetch all students with their USNs
            const studentsResponse = await axios.get("/studentsidusn");
            const allStudents = studentsResponse.data;

            // Map project students with their USNs
            const studentIdToUsnMap = Object.fromEntries(
                allStudents.map(student => [student.student_id, student.usn || student.USN])
            );

            const mappedStudentData = projectStudentsData.map(projStudent => ({
                id: projStudent.student_id,
                usn: studentIdToUsnMap[projStudent.student_id] || 'Unknown USN',
            }));

            console.log("Mapped Project Students:", mappedStudentData);

            // Set state with the mapped data
            setProjectStudents(prev => ({
                ...prev,
                [projectId]: mappedStudentData,
            }));
        } catch (error) {
            console.error(`Error fetching students for project ${projectId}:`, error);
        }
    };

    const fetchProjectFacultys = async (projectId) => {
        try {
            // Fetch project Facultys
            const projectFacultysResponse = await axios.get(`/project_faculty/${projectId}`);
            const projectFacultysData = projectFacultysResponse.data;

            // Fetch all Facultys with their USNs
            const facultysResponse = await axios.get("/facultyidname");
            const allFacultys = facultysResponse.data;

            // Map project facultys with their USNs
            const facultyIdToUsnMap = Object.fromEntries(
                allFacultys.map(faculty => [faculty.faculty_id, faculty.name || faculty.USN])
            );

            const mappedFacultyData = projectFacultysData.map(projFaculty => ({
                id: projFaculty.faculty_id,
                name: facultyIdToUsnMap[projFaculty.faculty_id] || 'Unknown Name',
            }));

            console.log("Mapped Project Facultys:", mappedFacultyData);

            // Set state with the mapped data
            setProjectFacultys(prev => ({
                ...prev,
                [projectId]: mappedFacultyData,
            }));
        } catch (error) {
            console.error(`Error fetching facultys for project ${projectId}:`, error);
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
        setPendingFacultys({
            ...pendingFacultys,
            [project.project_id]: projectFacultys[project.project_id] || []
        });
        setPendingThemes({
            ...pendingThemes,
            [project.project_id]: projectThemes[project.project_id] || []
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
        setUpdatedFields({});
        setSearchTerm("");
        setStudentSearchTerm("");
        setFacultySearchTerm("");
        setThemeSearchTerm("");
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

    const handleThemeChange = (selectedTheme) => {
        if (!selectedProject) return;

        const projectId = selectedProject.project_id;
        const currentThemes = pendingThemes[projectId] || [];

        const updatedThemes = currentThemes.some(theme => theme.id === selectedTheme.id)
            ? currentThemes.filter(theme => theme.id !== selectedTheme.id)
            : [...currentThemes, selectedTheme];

        setPendingThemes(prev => ({
            ...prev,
            [projectId]: updatedThemes
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

    const handleFacultyChange = (selectedFaculty) => {
        if (!selectedProject) return;

        const projectId = selectedProject.project_id;
        const currentFacultys = pendingFacultys[projectId] || [];

        const updatedFacultys = currentFacultys.some(faculty => faculty.id === selectedFaculty.id)
            ? currentFacultys.filter(faculty => faculty.id !== selectedFaculty.id)
            : [...currentFacultys, selectedFaculty];

        setPendingFacultys(prev => ({
            ...prev,
            [projectId]: updatedFacultys
        }));
    };

    const saveChanges = async () => {
        setLoading(true);
        try {
            await axios.put(`/projects/${selectedProject.project_id}`, updatedFields);

            await axios.put(`/project_technologies/${selectedProject.project_id}`, {
                technology_ids: pendingTechnologies[selectedProject.project_id].map(tech => tech.id)
            });

            await axios.put(`/project_themes/${selectedProject.project_id}`, {
                theme_ids: pendingThemes[selectedProject.project_id].map(theme => theme.id)
            });
            await axios.put(`/project_students/${selectedProject.project_id}`, {
                student_ids: pendingStudents[selectedProject.project_id].map(student => student.id)
            });
            await axios.put(`/project_faculty/${selectedProject.project_id}`, {
                faculty_ids: pendingFacultys[selectedProject.project_id].map(faculty => faculty.id)
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

            setProjectThemes(prev => ({
                ...prev,
                [selectedProject.project_id]: pendingThemes[selectedProject.project_id]
            }));

            setProjectStudents(prev => ({
                ...prev,
                [selectedProject.project_id]: pendingStudents[selectedProject.project_id]
            }));
            setProjectFacultys(prev => ({
                ...prev,
                [selectedProject.project_id]: pendingFacultys[selectedProject.project_id]
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

        <div className="flex justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-3/4 p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Projects Created by You</h1>
                <Link to={`/add-project/${userId}`}>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg mb-6 transition-colors duration-200 shadow-sm">
                        Add New Project
                    </button>
                </Link>
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Project List</h2>
                    {error ? (
                        <p className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</p>
                    ) : userProjects.length > 0 ? (
                        <ul className="space-y-6">
                            {
                                userProjects.map((project) => (
                                    <li key={project.project_id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">{project.name}</h3>
                                        <p className="text-gray-600 mb-3 break-words">{project.description}</p>
                                        <p className="text-gray-700 mb-2"><span className="font-semibold">Budget:</span> {project.budget}</p>
                                        <p className="text-gray-700 mb-2">
                                            <span className="font-semibold">Status:</span>
                                            <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                                {project.status}
                                            </span>
                                        </p>
                                        <p className="text-gray-700 mb-2"><span className="font-semibold">Start Date:</span> {project.start_date}</p>
                                        <p className="text-gray-700 mb-4"><span className="font-semibold">End Date:</span> {project.end_date}</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="font-semibold text-gray-700 mb-2">Technologies:</p>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {projectTechnologies[project.project_id]?.map((tech) => (
                                                        <span
                                                            key={tech.id}
                                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {tech.name || tech.technology_name || tech.Technology_Name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-700 mb-2">Themes:</p>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {projectThemes[project.project_id]?.map((theme) => (
                                                        <span
                                                            key={theme.id}
                                                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {theme.name || theme.theme_name || theme.Theme_Name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-700 mb-2">Students:</p>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {projectStudents[project.project_id]?.map((student) => (
                                                        <span
                                                            key={student.id}
                                                            className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {student.usn || student.USN}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-700 mb-2">Faculty:</p>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {projectFacultys[project.project_id]?.map((faculty) => (
                                                        <span
                                                            key={faculty.id}
                                                            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {faculty.name || faculty.NAME}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            {project.github_link && (
                                                <button
                                                    onClick={() => window.open(project.github_link, "_blank")}
                                                    className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                                                >
                                                    GitHub Link
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openModal(project)}
                                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">No projects created by you yet.</p>
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

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Themes</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Search themes..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            onChange={(e) => setThemeSearchTerm(e.target.value)}
                                            value={themeSearchTerm}
                                        />
                                        {themeSearchTerm && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                                                {allThemes
                                                    .filter(
                                                        (theme) =>
                                                            theme.name.toLowerCase().includes(themeSearchTerm.toLowerCase()) &&
                                                            !pendingThemes[selectedProject?.project_id]?.some((pt) => pt.id === theme.id)
                                                    )
                                                    .slice(0, 5)
                                                    .map((theme) => (
                                                        <div
                                                            key={theme.id}
                                                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                                            onClick={() => {
                                                                handleThemeChange(theme);
                                                                setThemeSearchTerm("");
                                                            }}
                                                        >
                                                            {theme.name}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-1/3 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                        <label className="block text-gray-700 font-semibold mb-2">Selected Themes</label>
                                        <div className="flex flex-wrap gap-2">
                                            {pendingThemes[selectedProject?.project_id]?.map((theme) => (
                                                <span
                                                    key={theme.id}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center"
                                                >
                                                    {theme.name}
                                                    <button
                                                        type="button"
                                                        className="ml-2 text-white hover:text-red-500"
                                                        onClick={() => handleThemeChange(theme)}
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

                            {/*Faculty section*/}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Faculty</label>
                                <div className="flex gap-4">
                                    {/* Faculty Search Input */}
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Search faculty..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            onChange={(e) => setFacultySearchTerm(e.target.value)}
                                            value={facultySearchTerm}
                                        />
                                        {/* Dropdown Suggestions */}
                                        {facultySearchTerm && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                                                {allFacultys
                                                    ?.filter(
                                                        (faculty) =>
                                                            faculty.name.toLowerCase().includes(facultySearchTerm.toLowerCase()) &&
                                                            !pendingFacultys[selectedProject?.project_id]?.some((ps) => ps.id === faculty.id)
                                                    )
                                                    .slice(0, 5)
                                                    .map((faculty) => (
                                                        <div
                                                            key={faculty.id}
                                                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                                            onClick={() => {
                                                                handleFacultyChange(faculty, "add"); // Updated to explicitly add faculty
                                                                setFacultySearchTerm("");
                                                            }}
                                                        >
                                                            {faculty.name}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Faculty List */}
                                    <div className="w-1/3 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                        <label className="block text-gray-700 font-semibold mb-2">Selected Facultys</label>
                                        <div className="flex flex-wrap gap-2">
                                            {pendingFacultys[selectedProject?.project_id]?.map((faculty) => (
                                                <span
                                                    key={faculty.id}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center"
                                                >
                                                    {faculty.name}
                                                    <button
                                                        type="button"
                                                        className="ml-2 text-white hover:text-red-500"
                                                        onClick={() => handleFacultyChange(faculty, "remove")} // Updated to explicitly remove faculty
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