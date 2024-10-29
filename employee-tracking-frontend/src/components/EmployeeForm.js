import React, { useState, useEffect } from 'react';

// Inline CSS styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000, // Ensure it's above other elements
};

const modalStyle = {
  position: 'relative',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  width: '400px', // Set a width for the modal
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'transparent',
  border: 'none',
  fontSize: '24px',  // Increased font size
  fontWeight: 'bold',
  cursor: 'pointer',
  color: '#333',
  padding: '5px 10px',  // Added padding for a larger clickable area
  borderRadius: '50%',
  transition: 'background-color 0.3s ease, color 0.3s ease',  // Smooth transition for hover
};

const closeButtonHoverStyle = {
  backgroundColor: '#f0f0f0',  // Light grey background on hover
  color: '#ff0000',            // Red color on hover
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const buttonStyle = {
  backgroundColor: '#007BFF', // Bootstrap primary color
  color: 'white',
  padding: '10px 15px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const EmployeeForm = ({ employee, onSubmit, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (employee) {
      setFirstName(employee.first_name);
      setLastName(employee.last_name);
      setEmail(employee.email);
      setPosition(employee.position);
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ first_name: firstName, last_name: lastName, email, position });
    onClose(); // Close the modal after submission
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <form
        style={modalStyle}
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
        onSubmit={handleSubmit}
      >
        {/* Close Button */}
        <button
          type="button"
          style={{
            ...closeButtonStyle,
            ...(isHovered ? closeButtonHoverStyle : {}),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClose}
        >
          &times;
        </button>

        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="position">Position</label>
          <input
            type="text"
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ textAlign: 'right' }}>
          <button type="submit" style={buttonStyle}>
            {employee ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
