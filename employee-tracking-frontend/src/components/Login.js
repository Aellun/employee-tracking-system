import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthProvider'; // Import the AuthProvider

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const { login, token, isAdmin } = useAuth(); // Destructure login, token, and isAdmin from AuthProvider
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true
    setErrorMessage(''); // Reset error message

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        console.log('Login response:', response.data); // Log the entire response

        // Store the token and admin status
        login({
          token: response.data.token,
          is_admin: response.data.is_admin,
        });
      } else {
        setErrorMessage(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      if (error.response) {
        setErrorMessage(error.response.data.error || 'An unknown error occurred');
      } else {
        setErrorMessage('Network error. Please try again later.');
      }
    } finally {
      setIsLoading(false); // Set loading to false after the request
    }
  };

  useEffect(() => {
    if (token && isAdmin !== undefined) {
      if (isAdmin) {
        navigate('/AdminHomePage.js');
      } else {
        navigate('/HomePage');
      }
    }
  }, [token, isAdmin, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login to Your Account</h2>
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
