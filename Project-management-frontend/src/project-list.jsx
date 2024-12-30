import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectList = () => {
    // State management
    const [projects, setProjects] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [themes, setThemes] = useState([]);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [projectRelations, setProjectRelations] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search states
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedTech, setSelectedTech] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Status options
    const statusOptions = ['Ongoing', 'Completed', 'Proposed']; // Add more as needed

    // Fetch all required data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all base data in parallel
                const [
                    projectsRes,
                    techRes,
                    themesRes,
                    studentsRes,
                    facultyRes
                ] = await Promise.all([
                    axios.get('/projects'),
                    axios.get('/technologies'),
                    axios.get('/themes'),
                    axios.get('/studentsidusn'),
                    axios.get('/facultyidname')
                ]);

                setProjects(projectsRes.data);
                setTechnologies(techRes.data);
                setThemes(themesRes.data);
                setStudents(studentsRes.data);
                setFaculty(facultyRes.data);

                // Fetch relations for each project
                const relations = {};
                for (const project of projectsRes.data) {
                    const [
                        projectTech,
                        projectThemes,
                        projectStudents,
                        projectFaculty
                    ] = await Promise.all([
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
                }
                setProjectRelations(relations);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper functions to get names from IDs
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

    // Filter projects based on search criteria
    const filteredProjects = projects.filter(project => {
        const matchesTitle = project.name.toLowerCase().includes(searchTitle.toLowerCase());
        const matchesStatus = !selectedStatus || project.status === selectedStatus;
        const matchesTech = !selectedTech || (
            projectRelations[project.project_id]?.technologies.some(
                t => t.technology_id === parseInt(selectedTech)
            )
        );
        const matchesTheme = !selectedTheme || (
            projectRelations[project.project_id]?.themes.some(
                t => t.theme_id === parseInt(selectedTheme)
            )
        );

        return matchesTitle && matchesStatus && matchesTech && matchesTheme;
    });

    if (loading) return <div className="p-4 text-center">Loading projects...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Projects List</h1>

            {/* Search and Filter Section */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="p-2 border rounded"
                />

                <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">All Technologies</option>
                    {technologies.map(tech => (
                        <option key={tech.Technology_id} value={tech.Technology_id}>
                            {tech.Technology_Name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">All Themes</option>
                    {themes.map(theme => (
                        <option key={theme.Theme_id} value={theme.Theme_id}>
                            {theme.Theme_Name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">All Statuses</option>
                    {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
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

export default ProjectList;