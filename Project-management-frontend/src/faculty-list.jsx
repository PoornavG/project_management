import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

const FacultyList = () => {
    const [faculty, setFaculty] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [facultyTechnologies, setFacultyTechnologies] = useState({});
    const [nameSearch, setNameSearch] = useState('');
    const [selectedTechs, setSelectedTechs] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tech dropdown states
    const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);
    const [techSearch, setTechSearch] = useState('');
    const techDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
                setIsTechDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [facultyRes, techRes, deptRes] = await Promise.all([
                    axios.get('/faculty').then(res => res.data),
                    axios.get('/technologies').then(res => res.data),
                    axios.get('/departments').then(res => res.data)
                ]);

                const facultyTechMap = {};
                await Promise.all(
                    facultyRes.map(async (facultyMember) => {
                        const techRes = await axios.get(`/faculty_technologies/${facultyMember.faculty_id}`);
                        facultyTechMap[facultyMember.faculty_id] = techRes.data;
                    })
                );

                setFaculty(facultyRes);
                setTechnologies(techRes);
                setDepartments(deptRes);
                setFacultyTechnologies(facultyTechMap);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const clearFilters = () => {
        setNameSearch('');
        setSelectedTechs([]);
        setSelectedDepartment('');
        setTechSearch('');
    };

    const toggleTech = (techId) => {
        setSelectedTechs(prev =>
            prev.includes(techId)
                ? prev.filter(id => id !== techId)
                : [...prev, techId]
        );
    };

    const filteredTechnologies = technologies.filter(tech =>
        tech.Technology_Name.toLowerCase().includes(techSearch.toLowerCase())
    );

    const filteredFaculty = faculty.filter((facultyMember) => {
        const matchesName = facultyMember.name.toLowerCase().includes(nameSearch.toLowerCase());
        const matchesDepartment = !selectedDepartment || facultyMember.department_id === parseInt(selectedDepartment);

        const facultyTechs = facultyTechnologies[facultyMember.faculty_id] || [];
        const matchesTech = selectedTechs.length === 0 || selectedTechs.some(
            selectedTech => facultyTechs.some(ft => ft.technology_id === parseInt(selectedTech))
        );

        return matchesName && matchesDepartment && matchesTech;
    });

    const getDepartmentName = (deptId) => {
        const dept = departments.find(d => d.department_id === deptId);
        return dept ? dept.name : 'Unknown';
    };

    const getTechnologyName = (techId) => {
        const tech = technologies.find(t => t.Technology_id === techId);
        return tech ? tech.Technology_Name : 'Unknown';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Faculty Directory</h2>
            </div>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 min-w-[240px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={nameSearch}
                                onChange={(e) => setNameSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Department Dropdown */}
                    <div className="min-w-[200px]">
                        <select
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept.department_id} value={dept.department_id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Technologies Multi-select Dropdown */}
                    <div className="min-w-[200px] relative" ref={techDropdownRef}>
                        <button
                            className="w-full border rounded-lg p-2 flex justify-between items-center bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onClick={() => setIsTechDropdownOpen(!isTechDropdownOpen)}
                        >
                            <span className="text-gray-700">
                                {selectedTechs.length
                                    ? `${selectedTechs.length} technologies selected`
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
                                            <div className="flex items-center flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTechs.includes(tech.Technology_id.toString())}
                                                    onChange={() => { }}
                                                    className="mr-2"
                                                />
                                                <span>{tech.Technology_Name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                    Showing {filteredFaculty.length} of {faculty.length} faculty members
                </div>

                {/* Table */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technologies</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFaculty.map((facultyMember) => {
                                const facultyTechs = facultyTechnologies[facultyMember.faculty_id] || [];
                                const techNames = facultyTechs
                                    .map(ft => getTechnologyName(ft.technology_id))
                                    .filter(Boolean)
                                    .join(', ');

                                return (
                                    <tr key={facultyMember.faculty_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{facultyMember.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getDepartmentName(facultyMember.department_id)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{facultyMember.designation}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{facultyMember.role}</td>
                                        <td className="px-6 py-4">{techNames}</td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <a href={`mailto:${facultyMember.personal_email}`} className="text-blue-600 hover:underline block">
                                                    {facultyMember.personal_email}
                                                </a>
                                                <span className="text-gray-500 block">{facultyMember.phone_no}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-x-4">
                                                {facultyMember.linkedin_profile && (
                                                    <a
                                                        href={facultyMember.linkedin_profile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline inline-block"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                )}
                                                {facultyMember.github_profile && (
                                                    <a
                                                        href={facultyMember.github_profile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline inline-block"
                                                    >
                                                        GitHub
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyList;