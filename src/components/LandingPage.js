import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, BookOpen, User, LogOut, PlusCircle, ShoppingBag } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch books from backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await apiService.getBooks();
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch books", err);
        // Fallback to some empty state or handled error
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleBookClick = (id) => {
    navigate(`/books/${id}`);
  };

  const handleListBook = () => {
    if (isAuthenticated) {
      navigate('/create-book');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter books based on search
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFFBF5] font-sans selection:bg-yellow-200 selection:text-yellow-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-yellow-400 p-2 rounded-lg transform -rotate-3">
                <BookOpen className="h-6 w-6 text-gray-900" />
              </div>
              <span className="text-2xl font-bold text-gray-800 tracking-tight">BookSwap</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <button onClick={() => navigate('/')} className="px-4 py-2 bg-yellow-200 text-yellow-900 rounded-full font-medium text-sm hover:bg-yellow-300 transition-colors">
                Home
              </button>
              <button onClick={handleListBook} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full font-medium text-sm transition-colors flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                List Book
              </button>
              
              {isAuthenticated ? (
                  <>
                    <span className="px-4 py-2 text-gray-600 font-medium text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {user?.username || 'User'}
                    </span>
                    <button onClick={handleLogout} className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                  </>
              ) : (
                  <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full font-medium text-sm transition-colors flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Login
                  </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1507842217121-9e96a471343d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")' 
          }}
        >
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto pt-16">
          <span className="inline-block py-1 px-3 rounded-full bg-yellow-400/90 text-gray-900 text-xs font-bold tracking-wider mb-6 uppercase">
            Premium Marketplace
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your Next <br/>
            <span className="text-yellow-300">Great Read</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-light">
            A curated community for buying and selling high-quality second-hand technical and classic books at affordable prices.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative -mt-8 px-4 z-20 mb-12">
        <div className="max-w-3xl mx-auto bg-white rounded-full shadow-xl p-2 flex items-center border border-gray-100">
          <div className="flex-1 flex items-center px-4 border-r border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search by title, author..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          
          <div className="hidden sm:flex items-center px-4 gap-2 cursor-pointer hover:bg-gray-50 rounded-full py-2 transition-colors">
            <span className="text-sm font-medium text-gray-600">Sort by</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          <div className="hidden sm:flex items-center px-4 border-l border-gray-200 gap-2 cursor-pointer hover:bg-gray-50 rounded-full py-2 transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filters</span>
          </div>

          <button className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ml-2">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Collection</h2>
          <a href="#" className="text-yellow-700 font-medium hover:text-yellow-800 hover:underline">View all books &rarr;</a>
        </div>
        
        {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
                <div 
                    key={book.id} 
                    onClick={() => handleBookClick(book.id)}
                    className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer"
                >
                <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-gray-100">
                    <img 
                    src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Cover'} 
                    alt={book.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Tag Placeholder - We could add tags to backend model later */}
                    <div className="absolute top-3 right-3">
                        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-600 shadow-sm">
                            Book
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 leading-tight group-hover:text-yellow-600 transition-colors">
                    {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{book.author}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase">
                            {book.current_bid > 0 ? 'Current Bid' : 'Buy Now'}
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                            ${book.current_bid > 0 ? book.current_bid : book.price}
                        </span>
                    </div>
                    <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-2 rounded-full transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {!loading && filteredBooks.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                No books found matching your search.
            </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-gray-900 p-1.5 rounded transform -rotate-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BookSwap</span>
            </div>
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} BookSwap. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
