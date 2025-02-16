import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, X, ChevronDown } from 'lucide-react';

const UserProjects = ({ userId }) => {
    // State management
    const [projects, setProjects] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [themes, setThemes] = useState([]);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [projectRelations, setProjectRelations] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userSpecificId, setUserSpecificId] = useState(null);

    // Search states (modified for multiselect)
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedTech, setSelectedTech] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');

    const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
    const [techSearch, setTechSearch] = useState('');
    const [themeSearch, setThemeSearch] = useState('');

    const techDropdownRef = useRef(null);
    const themeDropdownRef = useRef(null);
    // Status options
    const statusOptions = ['Ongoing', 'Completed', 'Proposed'];


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
                setIsTechDropdownOpen(false);
            }
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
                setIsThemeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Step 1: Fetch user role
    const fetchUserRole = async () => {
        try {
            const response = await axios.get(`/users/${userId}`);
            setUserRole(response.data.role);
            return response.data.role;
        } catch (err) {
            setError('Failed to fetch user role');
            throw err;
        }
    };

    // Step 2: Fetch user-specific ID (student_id or faculty_id)
    const fetchUserSpecificId = async (role) => {
        try {
            if (role === 'Student') {
                const response = await axios.get(`/studentsgetstdid/${userId}`);
                return response.data.student_id;
            } else if (role === 'Faculty') {
                const response = await axios.get(`/facultyid/${userId}`);
                return response.data.faculty_id;
            }
        } catch (err) {
            setError('Failed to fetch user details');
            throw err;
        }
    };

    // Step 3: Fetch user's projects
    const fetchUserProjects = async (role, specificId) => {
        try {
            const endpoint = role === 'Student'
                ? `/student_projects/${specificId}`
                : `/faculty_projects/${specificId}`;
            console.log({ specificId });

            const response = await axios.get(endpoint);
            console.log('API Response:', response);
            // Check if response.data exists and is an array
            if (!Array.isArray(response.data)) {
                throw new Error('Invalid project data received');
            }
            return response.data.map(item => item.project_id);
        } catch (err) {
            if (err.response?.status === 404) {
                // If no projects found, return empty array instead of throwing error
                return [];
            }
            setError('Failed to fetch user projects');
            throw err;
        }
    };

    // Step 4: Fetch project details and relations
    const fetchProjectDetails = async (projectIds) => {
        try {
            if (!projectIds.length) {
                return []; // Return empty array if no project IDs
            }

            const projectPromises = projectIds.map(id =>
                axios.get(`/projects/${id}`)
                    .then(response => response.data)
                    .catch(err => {
                        console.error(`Failed to fetch project ${id}:`, err);
                        return null;
                    })
            );

            const projectResponses = await Promise.all(projectPromises);
            // Filter out any null responses from failed requests
            return projectResponses.filter(project => project !== null);
        } catch (err) {
            setError('Failed to fetch project details');
            throw err;
        }
    };

    // Main data fetching logic
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Step 1: Get user role
                const role = await fetchUserRole();

                // Step 2: Get specific ID
                const specificId = await fetchUserSpecificId(role);
                setUserSpecificId(specificId);

                // Step 3: Get project IDs
                const projectIds = await fetchUserProjects(role, specificId);

                // Step 4: Get project details
                const projectDetails = await fetchProjectDetails(projectIds);
                setProjects(projectDetails);

                if (projectDetails.length === 0) {
                    setLoading(false);
                    return; // Exit early if no projects
                }

                // Fetch supporting data
                try {
                    const [techRes, themesRes, studentsRes, facultyRes] = await Promise.all([
                        axios.get('/technologies'),
                        axios.get('/themes'),
                        axios.get('/studentsidusn'),
                        axios.get('/facultyidname')
                    ]);

                    setTechnologies(techRes.data);
                    setThemes(themesRes.data);
                    setStudents(studentsRes.data);
                    setFaculty(facultyRes.data);

                    // Fetch relations for each project
                    const relations = {};
                    for (const project of projectDetails) {
                        try {
                            const [projectTech, projectThemes, projectStudents, projectFaculty] =
                                await Promise.all([
                                    axios.get(`/project_technologies/${project.project_id}`),
                                    axios.get(`/project_themes/${project.project_id}`),
                                    axios.get(`/project_students/${project.project_id}`),
                                    axios.get(`/project_faculty/${project.project_id}`)
                                ]);

                            relations[project.project_id] = {
                                technologies: projectTech.data,
                                themes: projectThemes.data,
                                students: projectStudents.data,
                                faculty: projectFaculty.data
                            };
                        } catch (err) {
                            console.error(`Failed to fetch relations for project ${project.project_id}:`, err);
                            relations[project.project_id] = {
                                technologies: [],
                                themes: [],
                                students: [],
                                faculty: []
                            };
                        }
                    }
                    setProjectRelations(relations);
                } catch (err) {
                    console.error('Failed to fetch supporting data:', err);
                    setError('Failed to fetch complete project information');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error in fetchAllData:', err);
                setError(err.message || 'Failed to fetch data');
                setLoading(false);
            }
        };

        fetchAllData();
    }, [userId]);

    // Helper functions (reused from ProjectList)
    const getTechName = (techId) => {
        const tech = technologies.find(t => t.Technology_id === techId);
        return tech ? tech.Technology_Name : 'Unknown';
    };

    const getThemeName = (themeId) => {
        const theme = themes.find(t => t.Theme_id === themeId);
        return theme ? theme.Theme_Name : 'Unknown';
    };

    const getStudentUSN = (studentId) => {
        const student = students.find(s => s.student_id === studentId);
        return student ? student.usn : 'Unknown';
    };

    const getFacultyName = (facultyId) => {
        const facultyMember = faculty.find(f => f.faculty_id === facultyId);
        return facultyMember ? facultyMember.name : 'Unknown';
    };

    const toggleTech = (techId) => {
        setSelectedTech(prev =>
            prev.includes(techId)
                ? prev.filter(id => id !== techId)
                : [...prev, techId]
        );
    };

    const toggleTheme = (themeId) => {
        setSelectedTheme(prev =>
            prev.includes(themeId)
                ? prev.filter(id => id !== themeId)
                : [...prev, themeId]
        );
    };

    // Filter functions
    const filteredTechnologies = technologies.filter(tech =>
        tech.Technology_Name.toLowerCase().includes(techSearch.toLowerCase())
    );

    const filteredThemes = themes.filter(theme =>
        theme.Theme_Name.toLowerCase().includes(themeSearch.toLowerCase())
    );

    const clearFilters = () => {
        setSearchTitle('');
        setSelectedTech([]);
        setSelectedTheme([]);
        setSelectedStatus('');
        setTechSearch('');
        setThemeSearch('');
    };

    // Filter projects (modified for multiselect)
    const filteredProjects = projects.filter(project => {
        const matchesTitle = project.name.toLowerCase().includes(searchTitle.toLowerCase());
        const matchesStatus = !selectedStatus || project.status === selectedStatus;

        const matchesTech = selectedTech.length === 0 || (
            projectRelations[project.project_id]?.technologies.some(
                t => selectedTech.includes(t.technology_id.toString())
            )
        );

        const matchesTheme = selectedTheme.length === 0 || (
            projectRelations[project.project_id]?.themes.some(
                t => selectedTheme.includes(t.theme_id.toString())
            )
        );

        return matchesTitle && matchesStatus && matchesTech && matchesTheme;
    });

    // Handle multiselect changes
    const handleTechChange = (e) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedTech(values);
    };

    const handleThemeChange = (e) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedTheme(values);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your projects...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-4 text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        </div>
    );
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
                My Projects ({userRole === 'Student' ? 'Student' : 'Faculty'})
            </h1>

            {/* Search and Filter Section */}
            <div className="mb-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                    {/* Title Search */}
                    <div className="flex-1 min-w-[240px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title..."
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTitle}
                                onChange={(e) => setSearchTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Technologies Dropdown */}
                    <div className="min-w-[200px] relative" ref={techDropdownRef}>
                        <button
                            className="w-full border rounded-lg p-2 flex justify-between items-center bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onClick={() => setIsTechDropdownOpen(!isTechDropdownOpen)}
                        >
                            <span className="text-gray-700">
                                {selectedTech.length
                                    ? `${selectedTech.length} technologies selected`
                                    : 'Select Technologies'}
                            </span>
                            <ChevronDown className="text-gray-400" size={20} />
                        </button>

                        {isTechDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                <div className="p-2">
                                    <input
                                        type="text"
                                        placeholder="Search technologies..."
                                        className="w-full p-2 border rounded-lg"
                                        value={techSearch}
                                        onChange={(e) => setTechSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredTechnologies.map((tech) => (
                                        <div
                                            key={tech.Technology_id}
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => toggleTech(tech.Technology_id.toString())}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTech.includes(tech.Technology_id.toString())}
                                                onChange={() => { }}
                                                className="mr-2"
                                            />
                                            <span>{tech.Technology_Name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Themes Dropdown */}
                    <div className="min-w-[200px] relative" ref={themeDropdownRef}>
                        <button
                            className="w-full border rounded-lg p-2 flex justify-between items-center bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                        >
                            <span className="text-gray-700">
                                {selectedTheme.length
                                    ? `${selectedTheme.length} themes selected`
                                    : 'Select Themes'}
                            </span>
                            <ChevronDown className="text-gray-400" size={20} />
                        </button>

                        {isThemeDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                <div className="p-2">
                                    <input
                                        type="text"
                                        placeholder="Search themes..."
                                        className="w-full p-2 border rounded-lg"
                                        value={themeSearch}
                                        onChange={(e) => setThemeSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredThemes.map((theme) => (
                                        <div
                                            key={theme.Theme_id}
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => toggleTheme(theme.Theme_id.toString())}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTheme.includes(theme.Theme_id.toString())}
                                                onChange={() => { }}
                                                className="mr-2"
                                            />
                                            <span>{theme.Theme_Name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="min-w-[200px]">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
                    >
                        <X size={16} />
                        Clear Filters
                    </button>
                </div>

                {/* Results Counter */}
                <div className="text-sm text-gray-600">
                    Showing {filteredProjects.length} of {projects.length} projects
                </div>
            </div>

            {/* Projects Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left border">Project Name</th>
                            <th className="p-3 text-left border">Description</th>
                            <th className="p-3 text-left border">Status</th>
                            <th className="p-3 text-left border">Technologies</th>
                            <th className="p-3 text-left border">Themes</th>
                            <th className="p-3 text-left border">Students</th>
                            <th className="p-3 text-left border">Faculty</th>
                            <th className="p-3 text-left border">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.project_id} className="hover:bg-gray-50">
                                <td className="p-3 border">{project.name}</td>
                                <td className="p-3 border">{project.description}</td>
                                <td className="p-3 border">{project.status}</td>
                                <td className="p-3 border">
                                    {projectRelations[project.project_id]?.technologies.map(tech => (
                                        <span key={tech.technology_id} className="inline-block bg-blue-100 rounded px-2 py-1 text-sm m-1">
                                            {getTechName(tech.technology_id)}
                                        </span>
                                    ))}
                                </td>
                                <td className="p-3 border">
                                    {projectRelations[project.project_id]?.themes.map(theme => (
                                        <span key={theme.theme_id} className="inline-block bg-green-100 rounded px-2 py-1 text-sm m-1">
                                            {getThemeName(theme.theme_id)}
                                        </span>
                                    ))}
                                </td>
                                <td className="p-3 border">
                                    {projectRelations[project.project_id]?.students.map(student => (
                                        <span key={student.student_id} className="block text-sm">
                                            {getStudentUSN(student.student_id)}
                                        </span>
                                    ))}
                                </td>
                                <td className="p-3 border">
                                    {projectRelations[project.project_id]?.faculty.map(f => (
                                        <span key={f.faculty_id} className="block text-sm">
                                            {getFacultyName(f.faculty_id)}
                                        </span>
                                    ))}
                                </td>
                                <td className="p-3 border">
                                    <div className="text-sm">
                                        <div>Budget: {project.budget}</div>
                                        <div>Start: {new Date(project.start_date).toLocaleDateString()}</div>
                                        <div>End: {new Date(project.end_date).toLocaleDateString()}</div>
                                        {project.github_link && (
                                            <a
                                                href={project.github_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                GitHub
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserProjects;