import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import axios from 'axios';
import './CommunityPage.css';

const defaultImage = 'https://drive.google.com/uc?export=view&id=10F1VXqbxPYF2Prmck9FP39tW_5VuLrPb';

function CommunityPage() {
  const navigate = useNavigate();
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    image: null,
  });
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const API_BASE_URL = 'http://172.16.63.225:5001';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view community posts.');
          navigate('/login');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/community`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to load posts. Please try again later.');
        }
      }
    };
    fetchPosts();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.title || !formData.author || !formData.description) {
      setError('Title, author, and description are required.');
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to create a post.');
        navigate('/login');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/api/community`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      const newPost = {
        _id: response.data.post_id,
        title: formData.title,
        author: formData.author,
        description: formData.description,
        image_url: formData.image ? `/uploads/${formData.image.name}` : null,
        created_at: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        comments: 0,
        is_liked: false,
        is_disliked: false,
      };
      setPosts((prev) => [newPost, ...prev]);
      setFormVisible(false);
      setFormData({ title: '', author: '', description: '', image: null });
      document.getElementById('image-input').value = '';
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to create post.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to like a post.');
        navigate('/login');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/api/community/${postId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const { likes, is_liked, dislikes, is_disliked } = response.data;
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, likes, is_liked, dislikes, is_disliked } : post))
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prev) => ({ ...prev, likes, is_liked, dislikes, is_disliked }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to toggle like.');
      }
    }
  };

  const handleDislike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to dislike a post.');
        navigate('/login');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/api/community/${postId}/dislike`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const { dislikes, is_disliked, likes, is_liked } = response.data;
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, dislikes, is_disliked, likes, is_liked } : post))
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prev) => ({ ...prev, dislikes, is_disliked, likes, is_liked }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to toggle dislike.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost text-gray-600 gap-2 hover:bg-gray-100 hover:scale-105 transition-all duration-300 rounded-full"
          >
            <ChevronLeft size={20} />
            <span className="text-lg font-semibold">Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Community Posts</h1>
          <button
            onClick={() => setFormVisible(true)}
            className="btn bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 rounded-full"
          >
            <Plus size={20} />
            Create Post
          </button>
        </div>

        {formVisible && (
          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-0 transition-all duration-300"
                  placeholder="Enter the post title"
                />
              </div>
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-0 transition-all duration-300"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-0 transition-all duration-300"
                  rows="4"
                  placeholder="Write your post description here"
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image (Optional)</label>
                <input
                  type="file"
                  id="image-input"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded-xl"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 px-4 rounded-xl hover:from-cyan-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormVisible(false)}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-400 hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">No posts yet. Be the first to share!</p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="post-card bg-white/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border border-gray-200"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.image_url ? `${API_BASE_URL}${post.image_url}` : defaultImage}
                  alt={post.title || 'Community Post'}
                  className="w-full h-48 object-cover rounded-t-xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                  }}
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">By {post.author} on {new Date(post.created_at).toLocaleDateString()}</p>
                  <p className="text-gray-700 line-clamp-2">{post.description.substring(0, 100)}...</p>
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(post._id); }}
                      className="flex items-center text-cyan-500 hover:text-cyan-700 transition-all duration-300"
                    >
                      <ThumbsUp
                        size={18}
                        className="mr-1"
                        fill={post.is_liked ? 'currentColor' : 'none'}
                        stroke={post.is_liked ? 'currentColor' : 'currentColor'}
                      />
                      {post.likes}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDislike(post._id); }}
                      className="flex items-center text-red-500 hover:text-red-700 transition-all duration-300"
                    >
                      <ThumbsDown
                        size={18}
                        className="mr-1"
                        fill={post.is_disliked ? 'currentColor' : 'none'}
                        stroke={post.is_disliked ? 'currentColor' : 'currentColor'}
                      />
                      {post.dislikes}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedPost && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="bg-white/90 backdrop-blur-md rounded-xl p-6 w-3/4 max-h-[80vh] overflow-y-auto shadow-xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPost.image_url ? `${API_BASE_URL}${selectedPost.image_url}` : defaultImage}
                alt={selectedPost.title || 'Community Post'}
                className="w-full h-64 object-cover rounded-t-xl"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                }}
              />
              <h2 className="text-2xl font-bold text-gray-900 mt-4">{selectedPost.title}</h2>
              <p className="text-sm text-gray-600 mt-2">By {selectedPost.author} on {new Date(selectedPost.created_at).toLocaleDateString()}</p>
              <p className="text-gray-700 mt-4">{selectedPost.description}</p>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => handleLike(selectedPost._id)}
                  className="flex items-center text-cyan-500 hover:text-cyan-700 transition-all duration-300"
                >
                  <ThumbsUp
                    size={18}
                    className="mr-1"
                    fill={selectedPost.is_liked ? 'currentColor' : 'none'}
                    stroke={selectedPost.is_liked ? 'currentColor' : 'currentColor'}
                  />
                  {selectedPost.likes} Likes
                </button>
                <button
                  onClick={() => handleDislike(selectedPost._id)}
                  className="flex items-center text-red-500 hover:text-red-700 transition-all duration-300"
                >
                  <ThumbsDown
                    size={18}
                    className="mr-1"
                    fill={selectedPost.is_disliked ? 'currentColor' : 'none'}
                    stroke={selectedPost.is_disliked ? 'currentColor' : 'currentColor'}
                  />
                  {selectedPost.dislikes} Dislikes
                </button>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="mt-6 bg-gray-300 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-400 hover:scale-105 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityPage;