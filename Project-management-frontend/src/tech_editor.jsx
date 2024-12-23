import React, { useState, useEffect } from 'react';

const TechnologyEditor = ({ facultyData, initialTechnologies, onSave }) => {
    const [searchTerm, setSearchTerm] = useState('');
    // Keep track of both current and temporary states
    const [facultyTechnologies, setFacultyTechnologies] = useState(initialTechnologies);
    const [tempFacultyTechnologies, setTempFacultyTechnologies] = useState(initialTechnologies);
    const [hasChanges, setHasChanges] = useState(false);

    // Reset temp state when initial technologies change
    useEffect(() => {
        setFacultyTechnologies(initialTechnologies);
        setTempFacultyTechnologies(initialTechnologies);
        setHasChanges(false);
    }, [initialTechnologies]);

    const handleTechnologyChange = (selectedTech) => {
        const updatedTechnologies = tempFacultyTechnologies.some(tech => tech.id === selectedTech.id)
            ? tempFacultyTechnologies.filter(tech => tech.id !== selectedTech.id)
            : [...tempFacultyTechnologies, selectedTech];

        setTempFacultyTechnologies(updatedTechnologies);
        setHasChanges(true);
    };

    const handleSaveChanges = async () => {
        try {
            await axios.put(`/faculty_technologies/${facultyData.faculty_id}`, {
                technology_ids: tempFacultyTechnologies.map(tech => tech.id),
            });

            // Only update the main state after successful save
            setFacultyTechnologies(tempFacultyTechnologies);
            setHasChanges(false);
        } catch (error) {
            console.error("Error updating technologies:", error);
            // You might want to show an error message to the user here
        }
    };

    const handleCancel = () => {
        setTempFacultyTechnologies(facultyTechnologies);
        setHasChanges(false);
    };

    return (
        <div>
            <label className="block text-gray-700 font-semibold mb-2">Technologies</label>
            <div className="relative">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search technologies..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Dropdown for Search Results */}
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                    {allTechnologies
                        .filter(
                            (tech) =>
                                tech.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                !tempFacultyTechnologies.some((ft) => ft.id === tech.id)
                        )
                        .map((tech) => (
                            <div
                                key={tech.id}
                                className="px-4 py-2 hover:bg-amber-100 cursor-pointer"
                                onClick={() => handleTechnologyChange({
                                    id: tech.id,
                                    name: tech.name || tech.technology_name || tech.Technology_Name
                                })}
                            >
                                {tech.name || tech.technology_name || tech.Technology_Name}
                            </div>
                        ))}
                </div>
            </div>
            {/* Selected Technologies */}
            <div className="mt-4 flex flex-wrap gap-2">
                {tempFacultyTechnologies.map((tech) => (
                    <span
                        key={tech.id}
                        className="bg-amber-600 text-white px-4 py-2 rounded-full flex items-center"
                    >
                        {tech.name || tech.technology_name || tech.Technology_Name}
                        <button
                            className="ml-2 text-white hover:text-red-500"
                            onClick={() => handleTechnologyChange(tech)}
                        >
                            ✕
                        </button>
                    </span>
                ))}
            </div>

            {/* Save/Cancel Buttons */}
            {hasChanges && (
                <div className="mt-4 flex gap-2">
                    <button
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                        onClick={handleSaveChanges}
                    >
                        Save Changes
                    </button>
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default TechnologyEditor;