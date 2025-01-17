import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, Building2, FolderKanban, User, TrendingUp } from 'lucide-react';

const HomePage = ({ userId }) => {
    const [hoveredCard, setHoveredCard] = useState(null);

    const menuItems = [
        {
            id: 1,
            title: 'My Profile',
            icon: <User size={24} />,
            description: 'View and edit your academic profile',
            link: `/profile/${userId}`,
            bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500'
        },
        {
            id: 2,
            title: 'My Projects',
            icon: <BookOpen size={24} />,
            description: 'Manage your ongoing and completed projects',
            link: `/myprojects/${userId}`,
            bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500'
        },
        {
            id: 3,
            title: 'Student Directory',
            icon: <GraduationCap size={24} />,
            description: 'Browse through student profiles and projects',
            link: '/student-list',
            bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500'
        },
        {
            id: 4,
            title: 'Faculty Directory',
            icon: <Users size={24} />,
            description: 'Connect with faculty members and advisors',
            link: '/faculty-list',
            bgColor: 'bg-gradient-to-r from-orange-500 to-red-500'
        },
        {
            id: 5,
            title: 'Project Repository',
            icon: <FolderKanban size={24} />,
            description: 'Explore all academic projects and research work',
            link: '/projects-list',
            bgColor: 'bg-gradient-to-r from-pink-500 to-rose-500'
        },
        {
            id: 6,
            title: 'Projects I belong to',
            icon: <FolderKanban size={24} />,
            description: 'Explore projects you belong to',
            link: `/projectsmepart/${userId}`,
            bgColor: 'bg-gradient-to-r from-pink-500 to-indigo-500'
        },
        {
            id: 7,
            title: 'Charts',
            icon: <TrendingUp size={24} />,
            description: 'Explore projects through visualization',
            link: `/charts`,
            bgColor: 'bg-gradient-to-r from-slate-600 to-stone-400'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Project Information System
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <Building2 className="text-gray-600" size={20} />
                        <p className="text-gray-600">
                            Welcome, User ID: {userId}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.link}
                            className="transform transition-all duration-300 hover:scale-105"
                            onMouseEnter={() => setHoveredCard(item.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className={`relative rounded-xl p-6 h-48 ${item.bgColor} text-white overflow-hidden shadow-md`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    {item.icon}
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        {item.icon}
                                        <h3 className="text-xl font-semibold">{item.title}</h3>
                                    </div>
                                    <p className={`transition-opacity duration-300 ${hoveredCard === item.id ? 'opacity-100' : 'opacity-80'
                                        }`}>
                                        {item.description}
                                    </p>
                                </div>
                                <div className={`absolute bottom-0 right-0 w-32 h-32 transform translate-x-16 translate-y-16 bg-white opacity-10 rounded-full transition-transform duration-300 ${hoveredCard === item.id ? 'scale-150' : 'scale-100'
                                    }`} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;