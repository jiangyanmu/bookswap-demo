import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { BookOpen, Upload, Tag, DollarSign, FileText, Link as LinkIcon } from 'lucide-react';

const CreateBook = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [bidIncrement, setBidIncrement] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or not a seller
  if (!isAuthenticated || !isSeller) {
    navigate('/login');
    return null; // Or show a message indicating redirection
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const bookData = {
        title,
        author,
        price: parseFloat(price),
        starting_bid: startingBid ? parseFloat(startingBid) : 0,
        bid_increment: bidIncrement ? parseFloat(bidIncrement) : 1,
        description,
        cover_image: coverImage,
      };
      await apiService.createBook(bookData);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to list book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col items-center p-4 font-sans">
       {/* Header */}
       <div className="w-full max-w-3xl flex items-center justify-between mb-8 mt-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-yellow-400 p-2 rounded-lg transform -rotate-3 shadow-sm">
                <BookOpen className="h-6 w-6 text-gray-900" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">BookSwap</span>
        </div>
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-medium text-sm">
            Cancel
        </button>
       </div>

      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-card border border-gray-100">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">List a Book for Sale</h2>
            <p className="text-gray-500">Share your knowledge with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Book Title</label>
                    <input
                        type="text"
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                        placeholder="e.g. Clean Code"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Author</label>
                    <input
                        type="text"
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                        placeholder="e.g. Robert C. Martin"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                    rows="4"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Describe the condition and content of the book..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>
          </div>

          {/* Pricing & Auction Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Pricing & Auction Rules</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Buy Now Price ($)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            className="block w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Instant purchase price.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Starting Bid ($)</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            className="block w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                            placeholder="0.00"
                            value={startingBid}
                            onChange={(e) => setStartingBid(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Minimum first bid.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bid Increment ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                        placeholder="1.00"
                        value={bidIncrement}
                        onChange={(e) => setBidIncrement(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">Min. raise per bid.</p>
                </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Book Cover</h3>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cover Image URL</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="url"
                        className="block w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                        placeholder="https://example.com/image.jpg"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                    />
                </div>
            </div>
            {coverImage && (
                <div className="mt-4 p-2 border border-gray-100 rounded-xl bg-gray-50 inline-block">
                    <img src={coverImage} alt="Preview" className="h-48 object-cover rounded-lg shadow-sm" />
                </div>
            )}
          </div>

          {error && (
             <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
            </div>
          )}

          <div className="pt-4">
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-yellow-200 text-lg font-bold text-yellow-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
            >
                {loading ? 'Listing...' : 'List Book For Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBook;