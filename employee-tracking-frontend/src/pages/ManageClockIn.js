import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const ManageClockIn = () => {
  const [clockInRecords, setClockInRecords] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    time_clocked_in: '',
    time_clocked_out: '',
    extra_hours: '',
    user_id: '',
    hours_worked: '',
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClockInRecords();
  }, []);

  const fetchClockInRecords = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/clockins/');
      setClockInRecords(response.data);
    } catch (error) {
      setError('Failed to fetch records. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateRecord();
    } else {
      await addRecord();
    }
  };

  const addRecord = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/clockins/', formData);
      setClockInRecords([...clockInRecords, response.data]);
      resetForm();
    } catch (error) {
      setError('Failed to add record. Please try again.');
    }
  };

  const updateRecord = async () => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/clockins/${formData.id}/`, formData);
      setClockInRecords((prevRecords) =>
        prevRecords.map((record) => (record.id === response.data.id ? response.data : record))
      );
      resetForm();
    } catch (error) {
      setError('Failed to update record. Please try again.');
    }
  };

  const deleteRecord = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/clockins/${id}/`);
      setClockInRecords(clockInRecords.filter((record) => record.id !== id));
    } catch (error) {
      setError('Failed to delete record. Please try again.');
    }
  };

  const editRecord = (record) => {
    setFormData(record);
    setEditing(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      time_clocked_in: '',
      time_clocked_out: '',
      extra_hours: '',
      user_id: '',
      hours_worked: '',
    });
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-700 mb-6">Manage Clock In Records</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Record' : 'Add Record'}</h2>
        <input type="hidden" name="id" value={formData.id} onChange={handleChange} />

        <div className="mb-4">
          <label className="block mb-1">Time Clocked In:</label>
          <input
            type="datetime-local"
            name="time_clocked_in"
            value={formData.time_clocked_in}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Time Clocked Out:</label>
          <input
            type="datetime-local"
            name="time_clocked_out"
            value={formData.time_clocked_out}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Extra Hours:</label>
          <input
            type="number"
            name="extra_hours"
            value={formData.extra_hours}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">User ID:</label>
          <input
            type="number"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Hours Worked:</label>
          <input
            type="number"
            name="hours_worked"
            value={formData.hours_worked}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
          {editing ? 'Update Record' : 'Add Record'}
        </button>
      </form>

      <table className="bg-white w-full rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="border-b border-gray-200 py-2 px-4">ID</th>
            <th className="border-b border-gray-200 py-2 px-4">Time Clocked In</th>
            <th className="border-b border-gray-200 py-2 px-4">Time Clocked Out</th>
            <th className="border-b border-gray-200 py-2 px-4">Extra Hours</th>
            <th className="border-b border-gray-200 py-2 px-4">User ID</th>
            <th className="border-b border-gray-200 py-2 px-4">Hours Worked</th>
            <th className="border-b border-gray-200 py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clockInRecords.map((record) => (
            <tr key={record.id}>
              <td className="py-2 px-4">{record.id}</td>
              <td className="py-2 px-4">{new Date(record.time_clocked_in).toLocaleString()}</td>
              <td className="py-2 px-4">{record.time_clocked_out ? new Date(record.time_clocked_out).toLocaleString() : 'N/A'}</td>
              <td className="py-2 px-4">{record.extra_hours}</td>
              <td className="py-2 px-4">{record.user_id}</td>
              <td className="py-2 px-4">{record.hours_worked}</td>
              <td className="py-2 px-4">
                <button onClick={() => editRecord(record)} className="text-blue-500 hover:underline mr-2">
                  <FaEdit />
                </button>
                <button onClick={() => deleteRecord(record.id)} className="text-red-500 hover:underline">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageClockIn;
