import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { Link } from 'react-router-dom';

// Task Item Component
const TaskItem = ({ 
  task, 
  editable, 
  selectedStatus, 
  onStatusChange, 
  note, 
  onNoteChange, 
  onSubmit 
}) => (
  <li className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">
      <span className={task.status === 'completed' ? 'text-green-700' : 
                      task.status === 'awaiting_approval' ? 'text-yellow-700' : 
                      'text-blue-700'}>
        {task.name}
      </span>
    </h2>
    <p className="text-lg text-gray-600 mb-2">{task.description}</p>
    
    {task.completed_date && (
      <p className="text-md text-blue-600 mb-2">
        Completed On: <span className="font-medium">{new Date(task.completed_date).toLocaleString()}</span>
      </p>
    )}
    
    {task.awaiting_approval_date && (
      <p className="text-md text-blue-600 mb-2">
        Awaiting Since: <span className="font-medium">{new Date(task.awaiting_approval_date).toLocaleString()}</span>
      </p>
    )}
    
    {!task.completed_date && !task.awaiting_approval_date && (
      <p className="text-md text-blue-600 mb-2">
        Due Date: <span className="font-medium">{new Date(task.due_date).toLocaleString()}</span>
      </p>
    )}
    
    <p className="text-md mb-4">
      Status: 
      <span className={`ml-2 py-1 px-3 rounded-full text-white font-bold ${
        task.status === 'completed' ? 'bg-green-500' : 
        task.status === 'in_progress' ? 'bg-blue-500' : 
        task.status === 'awaiting_approval' ? 'bg-yellow-500' : 
        'bg-gray-500'
      }`}>
        {task.status.replace(/_/g, ' ')}
      </span>
    </p>

    {editable && (
      <div className="mt-4">
        <select 
          className="border border-gray-300 p-3 rounded-lg w-full bg-blue-50"
          value={selectedStatus || ''} 
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="" disabled>Select an action</option>
          <option value="completed">Mark as Completed</option>
          <option value="in_progress">Mark as In Progress</option>
          <option value="request_extension">Request Extension</option>
        </select>

        <textarea
          placeholder="Enter your notes here..."
          value={note || ''}
          onChange={(e) => onNoteChange(e.target.value)}
          className="mt-4 border border-gray-300 p-3 rounded-lg w-full h-24 bg-blue-50"
        />

        <button
          className="mt-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={onSubmit}
        >
          Submit
        </button>
      </div>
    )}
  </li>
);

// Task Group Component
const TaskGroup = ({ 
  title, 
  isOpen, 
  onToggle, 
  buttonColor, 
  hoverColor, 
  children 
}) => (
  <div className="mb-4">
    <button 
      onClick={onToggle} 
      className={`${buttonColor} ${hoverColor} text-white py-2 px-4 rounded-lg w-full text-left font-semibold transition flex justify-between items-center`}
    >
      <span>{isOpen ? 'Hide' : 'Show'} {title}</span>
      <span>{isOpen ? '▲' : '▼'}</span>
    </button>
    {isOpen && <ul className="space-y-6 mt-4">{children}</ul>}
  </div>
);

const TasksPage = () => {
  const { token, logout } = useAuth();
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
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError(error.message);
      }
    };

    token && fetchTasks();
  }, [token]);

  const handleActionSubmit = async (taskId) => {
    if (!notes[taskId]) return alert('Please provide notes before submitting');

    try {
      const status = selectedStatus[taskId];
      const note = notes[taskId];
      const updateData = { notes: note };
      let dateField = '';

      if (status === 'completed') {
        updateData.status = 'completed';
        dateField = 'completed_date';
      } else if (status === 'request_extension') {
        updateData.status = 'awaiting_approval';
        dateField = 'awaiting_approval_date';
      } else if (status === 'in_progress') {
        updateData.status = 'in_progress';
      }

      if (dateField) updateData[dateField] = new Date().toISOString();

      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...updateData } : task
      ));
      
      // Reset task-specific state
      setNotes(prev => ({ ...prev, [taskId]: '' }));
      setSelectedStatus(prev => ({ ...prev, [taskId]: '' }));
    } catch (error) {
      setError(error.message);
    }
  };

  // Filter tasks by status
  const activeTasks = tasks.filter(task => 
    !['completed', 'awaiting_approval'].includes(task.status)
  );
  
  const completedTasks = tasks.filter(task => 
    task.status === 'completed'
  );
  
  const awaitingTasks = tasks.filter(task => 
    task.status === 'awaiting_approval'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
      {/* Navigation Bar */}
      <nav className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link 
              to="/" 
              className="text-2xl font-bold flex items-center"
            >
              <span className="mr-2">🏠</span> Task Manager
            </Link>
            <div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-800">
          Your Tasks
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Active Tasks */}
        <TaskGroup 
          title="Active Tasks"
          isOpen={activeGroupOpen}
          onToggle={() => setActiveGroupOpen(!activeGroupOpen)}
          buttonColor="bg-blue-600"
          hoverColor="hover:bg-blue-700"
        >
          {activeTasks.length > 0 ? activeTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              editable={true}
              selectedStatus={selectedStatus[task.id]}
              onStatusChange={(value) => setSelectedStatus(prev => ({ ...prev, [task.id]: value }))}
              note={notes[task.id] || ''}
              onNoteChange={(value) => setNotes(prev => ({ ...prev, [task.id]: value }))}
              onSubmit={() => handleActionSubmit(task.id)}
            />
          )) : (
            <li className="text-center py-8 text-gray-500 italic">
              No active tasks found. Enjoy your day!
            </li>
          )}
        </TaskGroup>

        {/* Completed Tasks */}
        <TaskGroup 
          title="Completed Tasks"
          isOpen={completedGroupOpen}
          onToggle={() => setCompletedGroupOpen(!completedGroupOpen)}
          buttonColor="bg-green-600"
          hoverColor="hover:bg-green-700"
        >
          {completedTasks.length > 0 ? completedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              editable={false} 
            />
          )) : (
            <li className="text-center py-8 text-gray-500 italic">
              No completed tasks yet. Keep going!
            </li>
          )}
        </TaskGroup>

        {/* Awaiting Approval Tasks */}
        <TaskGroup 
          title="Awaiting Approval"
          isOpen={awaitingGroupOpen}
          onToggle={() => setAwaitingGroupOpen(!awaitingGroupOpen)}
          buttonColor="bg-yellow-600"
          hoverColor="hover:bg-yellow-700"
        >
          {awaitingTasks.length > 0 ? awaitingTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              editable={false} 
            />
          )) : (
            <li className="text-center py-8 text-gray-500 italic">
              No tasks awaiting approval
            </li>
          )}
        </TaskGroup>
      </div>
    </div>
  );
};

export default TasksPage;