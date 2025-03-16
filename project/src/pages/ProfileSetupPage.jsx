import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';

function ProfileSetupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    contactNumber: '',
    residentialAddressCurrent: '',
    residentialAddressPermanent: '',
    nationality: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error');
    }
  };

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
          <h2 className="text-2xl font-semibold text-gray-900">Complete Your Profile</h2>
          <div></div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="select select-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleInputChange}
              className="select select-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
              required
            >
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="Enter your contact number"
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Current Residential Address</label>
            <textarea
              name="residentialAddressCurrent"
              value={formData.residentialAddressCurrent}
              onChange={handleInputChange}
              placeholder="Enter your current residential address"
              className="textarea textarea-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Permanent Residential Address</label>
            <textarea
              name="residentialAddressPermanent"
              value={formData.residentialAddressPermanent}
              onChange={handleInputChange}
              placeholder="Enter your permanent residential address"
              className="textarea textarea-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Nationality</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              placeholder="Enter your nationality"
              className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-cyan-500 focus:ring-0 rounded-xl transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="btn bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-none hover:from-cyan-600 hover:to-teal-600 w-full rounded-full hover:scale-105 transition-all duration-300"
          >
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetupPage;