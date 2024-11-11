import { left, right } from '@popperjs/core';
import React, { useState, useEffect } from 'react';

// Inline CSS styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  position: 'relative',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '20px 30px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  width: '400px',
  maxWidth: '90%',
};

const closeButtonStyle = {
  position: 'relative',
  top: '10px',
  marginBottom: '10px',
  left: '300px',
  background: 'transparent',
  border: 'none',
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: '#333',
  padding: '5px',
  // borderRadius: '5%',
  transition: 'background-color 0.3s ease, color 0.3s ease',
};

const closeButtonHoverStyle = {
  // backgroundColor: '#f0f0f0',
  color: '#ff0000',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#555',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '16px',
  color: '#333',
};

const buttonStyle = {
  backgroundColor: '#007BFF',
  color: 'white',
  padding: '10px 15px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.3s ease',
};

const buttonHoverStyle = {
  backgroundColor: '#0056b3',
};

const EmployeeForm = ({ employee, onSubmit, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

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
    clearForm();
    onClose();
  };

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPosition('');
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
            ...(isCloseHovered ? closeButtonHoverStyle : {}),
          }}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
          onClick={onClose}
        >
          &times;
        </button>

        <div>
          <label htmlFor="firstName" style={labelStyle}>First Name</label>
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
          <label htmlFor="lastName" style={labelStyle}>Last Name</label>
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
          <label htmlFor="email" style={labelStyle}>Email</label>
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
          <label htmlFor="position" style={labelStyle}>Position</label>
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
          <button
            type="submit"
            style={{
              ...buttonStyle,
              ...(isButtonHovered ? buttonHoverStyle : {}),
            }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            {employee ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
