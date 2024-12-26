import React from "react";
import { Link } from "react-router-dom";

function HomePage({ userId }) {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center mb-6">
                Welcome to the Home Page!
            </h1>
            <p className="text-center text-gray-700">Logged in as User ID: {userId}</p>
            <div className="flex flex-col items-center mt-8">
                <Link to={`/profile/${userId}`} className="w-60">
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600">
                        My Profile
                    </button>
                </Link>
                <Link to={`/myprojects/${userId}`} className="w-60">
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600">
                        My Projects
                    </button>
                </Link>
                <Link to="/students" className="w-60">
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600">
                        Student List
                    </button>
                </Link>
                <Link to="/faculty" className="w-60">
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600">
                        Faculty List
                    </button>
                </Link>
                <Link to="/projects-list" className="w-60">
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Project List
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
