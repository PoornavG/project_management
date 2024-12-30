import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [studentTechnologies, setStudentTechnologies] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTechs, setSelectedTechs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [studentsRes, techRes] = await Promise.all([
                    axios.get('/students'),
                    axios.get('/technologies'),
                ]);

                const studentsData = studentsRes.data;
                const techData = techRes.data;

                const studentTechMap = {};
                await Promise.all(
                    studentsData.map(async (student) => {
                        const techRes = await axios.get(`/student_technologies/${student.student_id}`);
                        studentTechMap[student.student_id] = techRes.data;
                    })
                );

                setStudents(studentsData);
                setTechnologies(techData);
                setStudentTechnologies(studentTechMap);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStudents = students.filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (selectedTechs.length === 0) return matchesSearch;

        const studentTechs = studentTechnologies[student.student_id] || [];
        const hasMatchingTech = selectedTechs.some((selectedTech) =>
            studentTechs.some((st) => st.technology_id === selectedTech)
        );

        return matchesSearch && hasMatchingTech;
    });

    const getTechnologyName = (techId) => {
        const tech = technologies.find((t) => t.Technology_id === techId);
        return tech ? tech.Technology_Name : 'Unknown';
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 max-w-full">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="pl-10 pr-4 py-2 w-full border rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        multiple
                        className="border rounded-lg p-2 min-w-[200px]"
                        value={selectedTechs}
                        onChange={(e) =>
                            setSelectedTechs(Array.from(e.target.selectedOptions, (option) => parseInt(option.value)))
                        }
                    >
                        {technologies.map((tech) => (
                            <option key={tech.Technology_id} value={tech.Technology_id}>
                                {tech.Technology_Name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-sm text-gray-600">
                    Showing {filteredStudents.length} of {students.length} students
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">USN</th>
                            <th className="px-4 py-2 border">CGPA</th>
                            <th className="px-4 py-2 border">Technologies</th>
                            <th className="px-4 py-2 border">Email</th>
                            <th className="px-4 py-2 border">Phone</th>
                            <th className="px-4 py-2 border">LinkedIn</th>
                            <th className="px-4 py-2 border">GitHub</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => {
                            const studentTechs = studentTechnologies[student.student_id] || [];
                            const techNames = studentTechs
                                .map((st) => getTechnologyName(st.technology_id))
                                .filter(Boolean)
                                .join(', ');

                            return (
                                <tr key={student.student_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border">{student.name}</td>
                                    <td className="px-4 py-2 border">{student.usn}</td>
                                    <td className="px-4 py-2 border">{student.cgpa}</td>
                                    <td className="px-4 py-2 border">{techNames}</td>
                                    <td className="px-4 py-2 border">
                                        <a href={`mailto:${student.personal_email}`} className="text-blue-600 hover:underline">
                                            {student.personal_email}
                                        </a>
                                    </td>
                                    <td className="px-4 py-2 border">{student.phone_no}</td>
                                    <td className="px-4 py-2 border">
                                        {student.linkedin_profile && (
                                            <a
                                                href={student.linkedin_profile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                View LinkedIn
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {student.github_profile && (
                                            <a
                                                href={student.github_profile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Explore GitHub
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentList;
