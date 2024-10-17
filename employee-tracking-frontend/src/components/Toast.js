import React, { useEffect } from 'react';

const Toast = ({ message, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Toast will disappear after 3 seconds

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [isOpen, onClose]);

  return (
    isOpen && (
      <div className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded shadow-lg transition-transform transform duration-300">
        {message}
      </div>
    )
  );
};

export default Toast;
