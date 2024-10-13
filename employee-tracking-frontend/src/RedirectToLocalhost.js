import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Use `useNavigate` instead of `useHistory`

const RedirectToLocalhost = () => {
  const navigate = useNavigate();  // Initialize `useNavigate`

  useEffect(() => {
    const currentUrl = window.location.href;

    // Check if the URL is using 127.0.0.1 and redirect to localhost
    if (currentUrl.includes('localhost')) {
    //   const newUrl = currentUrl.replace('127.0.0.1', 'localhost');
      const newUrl = currentUrl.replace('localhost', '127.0.0.1');
      window.location.replace(newUrl);  // Use window.location.replace to reload with the new URL
    }
  }, [navigate]);  // useNavigate in the dependency array ensures it’s available for navigation if needed

  return null;  // No UI component is rendered
};

export default RedirectToLocalhost;
