import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowRight, User, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/'); 
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col justify-center items-center p-4 font-sans">
      {/* Logo / Home Link */}
      <div className="mb-8 cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
        <div className="bg-yellow-400 p-2 rounded-lg transform -rotate-3 shadow-md">
          <BookOpen className="h-8 w-8 text-gray-900" />
        </div>
        <span className="text-3xl font-bold text-gray-800 tracking-tight">BookSwap</span>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-card border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">Sign in to continue your reading journey</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-yellow-200 text-sm font-bold text-yellow-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-900"></div>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <span 
                onClick={() => navigate('/register')} 
                className="font-medium text-yellow-700 hover:text-yellow-800 cursor-pointer hover:underline"
            >
              Create one now
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;