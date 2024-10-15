import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { FaCalendarAlt, FaChevronDown, FaChevronUp, FaClock, FaExclamationCircle } from 'react-icons/fa';

const TimesheetPage = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchTimeEntries();
    }
  }, [token, selectedDate]);

  const fetchTimeEntries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/timesheet/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate || undefined },
      });
      setTimeEntries(response.data || []);
    } catch (error) {
      setError('Failed to fetch time entries. Please try again later.');
    }
  };

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTimeEntries();
  };

  const toggleExpand = (date) => {
    setExpandedDates((prevState) => ({
      ...prevState,
      [date]: !prevState[date],
    }));
  };

  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? null : date;
  };

  const groupByDate = (records) => {
    return records.reduce((groups, record) => {
      const date = parseDate(record.time_clocked_in)?.toLocaleDateString() || 'Invalid Date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
      return groups;
    }, {});
  };

  const groupedEntries = groupByDate(timeEntries);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-700 mb-6">Timesheet</h1>

      {error && (
        <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 mb-4 rounded-md">
          <FaExclamationCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-lg mb-6">
        <form onSubmit={handleFilterSubmit} className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
            Filter
          </button>
        </form>
      </div>

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="text-gray-500 text-lg mt-6">No entries available for the selected date.</div>
      ) : (
        Object.keys(groupedEntries).map((date) => (
          <div key={date} className="bg-white p-6 mb-6 rounded-lg shadow-md w-full max-w-2xl">
            <div
              className="flex justify-between items-center cursor-pointer text-gray-800 font-semibold"
              onClick={() => toggleExpand(date)}
            >
              <span className="text-lg">{date}</span>
              {expandedDates[date] ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expandedDates[date] && (
              <table className="mt-4 w-full text-left">
                <thead>
                  <tr>
                    <th className="border-b border-gray-200 py-2 px-4">Time In - Out</th>
                    <th className="border-b border-gray-200 py-2 px-4">Duration</th>
                    <th className="border-b border-gray-200 py-2 px-4">Break Type</th>
                    <th className="border-b border-gray-200 py-2 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEntries[date].map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr>
                        <td className="py-2 px-4">
                          {parseDate(entry.time_clocked_in)?.toLocaleTimeString() || 'Invalid Time'} -{' '}
                          {entry.time_clocked_out ? parseDate(entry.time_clocked_out)?.toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="py-2 px-4">{formatDuration(entry.time_clocked_in, entry.time_clocked_out)}</td>
                        <td className="py-2 px-4">{entry.breaks.length > 0 ? entry.breaks[0].break_type : 'N/A'}</td>
                        <td className="py-2 px-4">{entry.notes || 'N/A'}</td>
                      </tr>

                      {entry.breaks && entry.breaks.map((breakEntry) => (
                        <tr key={breakEntry.id} className="bg-gray-50 text-gray-600">
                          <td className="py-2 px-4 pl-8">
                            {parseDate(breakEntry.time_started)?.toLocaleTimeString() || 'Invalid Time'} -{' '}
                            {breakEntry.time_ended ? parseDate(breakEntry.time_ended)?.toLocaleTimeString() : 'Ongoing'}
                          </td>
                          <td className="py-2 px-4">{formatDuration(breakEntry.time_started, breakEntry.time_ended)}</td>
                          <td className="py-2 px-4">{breakEntry.break_type || 'N/A'}</td>
                          <td className="py-2 px-4">Break</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const formatDuration = (start, end) => {
  if (!end || end === 'N/A') return 'Ongoing';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate)) return 'Invalid Duration';

  const diff = (endDate - startDate) / (1000 * 60);
  const hours = Math.floor(diff / 60);
  const minutes = Math.floor(diff % 60);

  return hours > 0 ? `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m` : `${minutes}m`;
};

export default TimesheetPage;
