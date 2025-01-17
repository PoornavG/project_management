import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const ProjectDashboard = () => {
    const [selectedChart, setSelectedChart] = useState('tech-distribution');
    const [projects, setProjects] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [themes, setThemes] = useState([]);
    const [projectTechnologies, setProjectTechnologies] = useState([]);
    const [projectThemes, setProjectThemes] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all basic data
                const [projectsRes, techRes, themesRes] = await Promise.all([
                    fetch('/projects'),
                    fetch('/technologies'),
                    fetch('/themes')
                ]);

                const projectsData = await projectsRes.json();
                const techData = await techRes.json();
                const themesData = await themesRes.json();

                setProjects(projectsData);
                setTechnologies(techData);
                setThemes(themesData);

                // Fetch project technologies and themes
                const techPromises = projectsData.map(project =>
                    fetch(`/project_technologies/${project.project_id}`).then(res => res.json())
                );
                const themePromises = projectsData.map(project =>
                    fetch(`/project_themes/${project.project_id}`).then(res => res.json())
                );

                const allProjectTechs = await Promise.all(techPromises);
                const allProjectThemes = await Promise.all(themePromises);

                setProjectTechnologies(allProjectTechs.flat());
                setProjectThemes(allProjectThemes.flat());

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const prepareChartData = () => {
        switch (selectedChart) {
            case 'tech-distribution': {
                const techDist = projectTechnologies.reduce((acc, pt) => {
                    acc[pt.technology_id] = (acc[pt.technology_id] || 0) + 1;
                    return acc;
                }, {});

                return Object.entries(techDist).map(([techId, count]) => ({
                    name: technologies.find(t => t.Technology_id === Number(techId))?.Technology_Name || 'Unknown',
                    count
                }));
            }

            case 'theme-distribution': {
                const themeDist = projectThemes.reduce((acc, pt) => {
                    acc[pt.theme_id] = (acc[pt.theme_id] || 0) + 1;
                    return acc;
                }, {});

                return Object.entries(themeDist).map(([themeId, count]) => ({
                    name: themes.find(t => t.Theme_id === Number(themeId))?.Theme_Name || 'Unknown',
                    count
                }));
            }

            case 'student-involvement': {
                const themeStudents = {};

                projects.forEach(project => {
                    const projectThemeIds = projectThemes
                        .filter(pt => pt.project_id === project.project_id)
                        .map(pt => pt.theme_id);

                    projectThemeIds.forEach(themeId => {
                        themeStudents[themeId] = (themeStudents[themeId] || 0) + project.students_involved_count;
                    });
                });

                return Object.entries(themeStudents).map(([themeId, count]) => ({
                    name: themes.find(t => t.Theme_id === Number(themeId))?.Theme_Name || 'Unknown',
                    students: count
                }));
            }

            case 'status-distribution': {
                const statusDist = projects.reduce((acc, project) => {
                    acc[project.status] = (acc[project.status] || 0) + 1;
                    return acc;
                }, {});

                return Object.entries(statusDist).map(([status, value]) => ({
                    name: status,
                    value
                }));
            }

            default:
                return [];
        }
    };

    const renderChart = () => {
        const data = prepareChartData();

        switch (selectedChart) {
            case 'status-distribution':
                return (
                    <PieChart width={600} height={400}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );

            case 'tech-distribution':
            case 'theme-distribution':
                return (
                    <BarChart width={600} height={400} data={data}>
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                );

            case 'student-involvement':
                return (
                    <BarChart width={600} height={400} data={data}>
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="students" fill="#82ca9d" />
                    </BarChart>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading dashboard data...</div>;
    }

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Project Analytics Dashboard</h2>
                    <div className="w-full max-w-xs">
                        <select
                            value={selectedChart}
                            onChange={(e) => setSelectedChart(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white shadow-sm"
                        >
                            <option value="tech-distribution">Distribution of Projects by Technology</option>
                            <option value="student-involvement">Student Involvement by Theme</option>
                            <option value="status-distribution">Project Status Distribution</option>
                            <option value="theme-distribution">Distribution of Projects by Theme</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-center">
                    {renderChart()}
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;