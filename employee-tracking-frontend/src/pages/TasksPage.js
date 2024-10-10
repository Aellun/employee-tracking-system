import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider'; // Adjust the import path as necessary

const TasksPage = () => {
    const { token } = useAuth(); // Get the token from AuthProvider
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const [notes, setNotes] = useState({}); // To store notes for task actions
    const [selectedStatus, setSelectedStatus] = useState({}); // To store selected status for tasks
    const [activeGroupOpen, setActiveGroupOpen] = useState(true); // To control collapsible state
    const [completedGroupOpen, setCompletedGroupOpen] = useState(false); // To control collapsible state
    const [awaitingGroupOpen, setAwaitingGroupOpen] = useState(false); // To control collapsible state

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTasks(data); // Set the tasks data to state
            } catch (error) {
                setError(error.message); // Handle any errors
            }
        };

        if (token) {
            fetchTasks(); // Fetch tasks only if token exists
        }
    }, [token]); // Dependency on token to refetch if it changes

    const handleActionSubmit = async (taskId) => {
        const status = selectedStatus[taskId]; // Get the selected status
        const note = notes[taskId] || ''; // Get the associated notes

        // Ensure that notes are provided
        if (!note) {
            alert('Please provide notes before submitting.'); 
            return;
        }

        try {
            let updateData = {};
            let completionDate = null;
            let approvalDate = null;

            if (status === 'completed') {
                completionDate = new Date().toISOString(); // Capture the current date and time for completion
                updateData = { status: 'completed', notes: note, completed_date: completionDate };
            } else if (status === 'request_extension') {
                approvalDate = new Date().toISOString(); // Capture current date and time for approval request
                updateData = { status: 'awaiting_approval', notes: note, awaiting_approval_date: approvalDate };
            } else if (status === 'in_progress') {
                updateData = { status: 'in_progress', notes: note };
            }

            const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/update/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Update the tasks state locally after the action
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId ? { ...task, ...updateData } : task
                )
            );

            // Clear the notes after submission
            setNotes(prevNotes => ({ ...prevNotes, [taskId]: '' }));
        } catch (error) {
            setError(error.message); // Handle any errors
        }
    };

    // Render the tasks or any error message
    return (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-indigo-200 to-purple-300 rounded-lg shadow-lg" style={{ width: '60%' }}>
            <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Your Tasks</h1>
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Active Tasks Section */}
            <div className="mb-4">
                <button 
                    onClick={() => setActiveGroupOpen(!activeGroupOpen)} 
                    className="bg-purple-500 text-white py-2 px-4 rounded w-full text-left"
                >
                    {activeGroupOpen ? 'Hide' : 'Show'} Active Tasks
                </button>
                {activeGroupOpen && (
                    <ul className="space-y-6">
                        {tasks.filter(task => task.status !== 'completed' && task.status !== 'awaiting_approval').map(task => (
                            <li key={task.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <h2 className="text-2xl font-semibold mb-2">
                                    <button className="bg-green-400 text-gray-800 py-2 px-4 rounded shadow hover:bg-green-500 transition">
                                        {task.name}
                                    </button>
                                </h2>
                                <p className="text-lg text-gray-700 mb-2 bg-gray-200 p-2 rounded">{task.description}</p>
                                <p className="text-md text-gray-500 mb-2 bg-blue-100 p-2 rounded">
                                    Due Date: 
                                    <span className="font-medium"> {new Date(task.due_date).toLocaleString()}</span>
                                </p>
                                <p className="text-md text-gray-500 mb-2">
                                    Status: 
                                    <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded shadow hover:bg-gray-300 transition opacity-80">
                                        {task.status.replace(/_/g, ' ')}
                                    </button>
                                </p>

                                {/* Dropdown for changing task status */}
                                <div className="mt-4">
                                    <select 
                                        className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-600 transition bg-white"
                                        value={selectedStatus[task.id] || ''} 
                                        onChange={(e) => setSelectedStatus(prevStatus => ({ ...prevStatus, [task.id]: e.target.value }))} 
                                        disabled={task.status === 'completed' || task.status === 'awaiting_approval'}
                                    >
                                        <option value="" disabled>Select an action</option>
                                        <option value="completed">Mark as Completed</option>
                                        <option value="in_progress">Mark as In Progress</option>
                                        <option value="request_extension">Request Extension</option>
                                    </select>

                                    <textarea
                                        placeholder="Enter your notes here..."
                                        value={notes[task.id] || ''}
                                        onChange={(e) => setNotes(prevNotes => ({ ...prevNotes, [task.id]: e.target.value }))}
                                        className="mt-2 border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-600 transition h-24 bg-white"
                                        disabled={task.status === 'completed' || task.status === 'awaiting_approval'}
                                    />

                                    <button
                                        className="mt-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                                        onClick={() => handleActionSubmit(task.id)}
                                        disabled={task.status === 'completed' || task.status === 'awaiting_approval'}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Completed Tasks Section */}
            <div className="mb-4">
                <button 
                    onClick={() => setCompletedGroupOpen(!completedGroupOpen)} 
                    className="bg-purple-500 text-white py-2 px-4 rounded w-full text-left"
                >
                    {completedGroupOpen ? 'Hide' : 'Show'} Completed Tasks
                </button>
                {completedGroupOpen && (
                    <ul className="space-y-6">
                        {tasks.filter(task => task.status === 'completed').map(task => (
                            <li key={task.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <h2 className="text-2xl font-semibold mb-2">
                                    <button className="bg-green-400 text-gray-800 py-2 px-4 rounded shadow hover:bg-green-500 transition">
                                        {task.name}
                                    </button>
                                </h2>
                                <p className="text-lg text-gray-700 mb-2 bg-gray-200 p-2 rounded">{task.description}</p>
                                <p className="text-md text-gray-500 mb-2 bg-blue-100 p-2 rounded">
                                    Due Date: 
                                    <span className="font-medium"> {new Date(task.due_date).toLocaleString()}</span>
                                </p>
                                <p className="text-md text-gray-500 mb-2">
                                    Status: 
                                    <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded shadow hover:bg-gray-300 transition opacity-80">
                                        {task.status.replace(/_/g, ' ')}
                                    </button>
                                </p>
                                <p className="text-md text-gray-500 mb-2">
                                    Completed On: 
                                    <button className="bg-yellow-300 text-gray-700 py-2 px-4 rounded shadow opacity-80">
                                        {new Date(task.completed_date).toLocaleString()}
                                    </button>
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Awaiting Approval Tasks Section */}
            <div className="mb-4">
                <button 
                    onClick={() => setAwaitingGroupOpen(!awaitingGroupOpen)} 
                    className="bg-purple-500 text-white py-2 px-4 rounded w-full text-left"
                >
                    {awaitingGroupOpen ? 'Hide' : 'Show'} Awaiting Approval Tasks
                </button>
                {awaitingGroupOpen && (
                    <ul className="space-y-6">
                        {tasks.filter(task => task.status === 'awaiting_approval').map(task => (
                            <li key={task.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <h2 className="text-2xl font-semibold mb-2">
                                    <button className="bg-green-400 text-gray-800 py-2 px-4 rounded shadow hover:bg-green-500 transition">
                                        {task.name}
                                    </button>
                                </h2>
                                <p className="text-lg text-gray-700 mb-2 bg-gray-200 p-2 rounded">{task.description}</p>
                                <p className="text-md text-gray-500 mb-2 bg-blue-100 p-2 rounded">
                                    Due Date: 
                                    <span className="font-medium"> {new Date(task.due_date).toLocaleString()}</span>
                                </p>
                                <p className="text-md text-gray-500 mb-2">
                                    Status: 
                                    <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded shadow hover:bg-gray-300 transition opacity-80">
                                        {task.status.replace(/_/g, ' ')}
                                    </button>
                                </p>
                                <p className="text-md text-gray-500 mb-2">
                                    Awaiting Approval Since: 
                                    <button className="bg-yellow-300 text-gray-700 py-2 px-4 rounded shadow opacity-80">
                                        {new Date(task.awaiting_approval_date).toLocaleString()}
                                    </button>
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TasksPage;
