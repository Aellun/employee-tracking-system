import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider'; // Adjust the import path as necessary

const TasksPage = () => {
    const { token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const [notes, setNotes] = useState({});
    const [selectedStatus, setSelectedStatus] = useState({});
    const [activeGroupOpen, setActiveGroupOpen] = useState(true);
    const [completedGroupOpen, setCompletedGroupOpen] = useState(false);
    const [awaitingGroupOpen, setAwaitingGroupOpen] = useState(false);

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
                setTasks(data);
            } catch (error) {
                setError(error.message);
            }
        };

        if (token) {
            fetchTasks();
        }
    }, [token]);

    const handleActionSubmit = async (taskId) => {
        const status = selectedStatus[taskId];
        const note = notes[taskId] || '';

        if (!note) {
            alert('Please provide notes before submitting.');
            return;
        }

        try {
            let updateData = {};
            let completionDate = null;
            let approvalDate = null;

            if (status === 'completed') {
                completionDate = new Date().toISOString();
                updateData = { status: 'completed', notes: note, completed_date: completionDate };
            } else if (status === 'request_extension') {
                approvalDate = new Date().toISOString();
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

            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId ? { ...task, ...updateData } : task
                )
            );

            setNotes(prevNotes => ({ ...prevNotes, [taskId]: '' }));
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg" style={{ width: '80%', background: 'linear-gradient(135deg, #e0f7fa 10%, #80d8ff 100%)' }}>
            <h1 className="text-5xl font-bold text-center mb-6 text-blue-900 shadow-sm" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>Your Tasks</h1>
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Active Task Section */}
            <div className="mb-4">
                <button 
                    onClick={() => setActiveGroupOpen(!activeGroupOpen)} 
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full text-left font-semibold transition hover:bg-blue-700"
                >
                    {activeGroupOpen ? 'Hide' : 'Show'} Active Tasks
                </button>
                {activeGroupOpen && (
                    <ul className="space-y-6 mt-4">
                        {tasks.filter(task => task.status !== 'completed' && task.status !== 'awaiting_approval').map(task => (
                            <li key={task.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    <span className="text-blue-700">{task.name}</span>
                                </h2>
                                <p className="text-lg text-gray-600 mb-2">{task.description}</p>
                                <p className="text-md text-blue-600 mb-2">Due Date: <span className="font-medium">{new Date(task.due_date).toLocaleString()}</span></p>
                                <p className="text-md mb-4">
                                    Status: 
                                    <span className={`ml-2 py-1 px-3 rounded-full text-white font-bold ${task.status === 'completed' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                                        {task.status.replace(/_/g, ' ')}
                                    </span>
                                </p>

                                <div className="mt-4">
                                    <select 
                                        className="border border-gray-300 p-3 rounded-lg w-full bg-blue-50"
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
                                        className="mt-4 border border-gray-300 p-3 rounded-lg w-full h-24 bg-blue-50"
                                        disabled={task.status === 'completed' || task.status === 'awaiting_approval'}
                                    />

                                    <button
                                        className="mt-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition"
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

            {/* Completed Task Section */}
            <div className="mb-4">
                <button 
                    onClick={() => setCompletedGroupOpen(!completedGroupOpen)} 
                    className="bg-green-600 text-white py-2 px-4 rounded-lg w-full text-left font-semibold transition hover:bg-green-700"
                >
                    {completedGroupOpen ? 'Hide' : 'Show'} Completed Tasks
                </button>
                {completedGroupOpen && (
                    <ul className="space-y-6 mt-4">
                        {tasks.filter(task => task.status === 'completed').map(task => (
                            <li key={task.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    <span className="text-green-700">{task.name}</span>
                                </h2>
                                <p className="text-lg text-gray-600 mb-2">{task.description}</p>
                                <p className="text-md text-blue-600 mb-2">Completed On: <span className="font-medium">{new Date(task.completed_date).toLocaleString()}</span></p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Awaiting Approval Task Section */}
            <div className="mb-4">
                <button 
                    onClick={() => setAwaitingGroupOpen(!awaitingGroupOpen)} 
                    className="bg-yellow-600 text-white py-2 px-4 rounded-lg w-full text-left font-semibold transition hover:bg-yellow-700"
                >
                    {awaitingGroupOpen ? 'Hide' : 'Show'} Awaiting Approval
                </button>
                {awaitingGroupOpen && (
                    <ul className="space-y-6 mt-4">
                        {tasks.filter(task => task.status === 'awaiting_approval').map(task => (
                            <li key={task.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    <span className="text-yellow-700">{task.name}</span>
                                </h2>
                                <p className="text-lg text-gray-600 mb-2">{task.description}</p>
                                <p className="text-md text-blue-600 mb-2">Awaiting Approval Since: <span className="font-medium">{new Date(task.awaiting_approval_date).toLocaleString()}</span></p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TasksPage;
