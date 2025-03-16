import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://0.0.0.0:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/voice');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-200 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
            />
          </div>
          <button
            onClick={handleLogin}
            className="btn bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-none hover:from-cyan-600 hover:to-teal-600 w-full rounded-full hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </div>
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{' '}
          <button
            onClick={() => navigate('/register')} // Assuming a register route exists
            className="text-cyan-500 hover:underline hover:text-cyan-700 transition-all duration-300"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;