import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-200 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost text-gray-600 gap-2 hover:bg-gray-100 hover:scale-105 transition-all duration-300 rounded-full"
          >
            <ChevronLeft size={24} />
            <span className="text-lg font-semibold">Back</span>
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">Sign Up</h2>
          <div></div>
        </div>
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            className="btn bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-none hover:from-cyan-600 hover:to-teal-600 w-full rounded-full hover:scale-105 transition-all duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-cyan-500 hover:underline hover:text-cyan-700 transition-all duration-300"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;