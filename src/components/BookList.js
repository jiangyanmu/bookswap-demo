import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService'; // Import the default exported apiService object

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const data = await apiService.getBooks(); // Access getBooks from apiService
                setBooks(data);
                setError(null);
            } catch (error) {
                setError('Failed to fetch books. Please make sure the backend server is running.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) {
        return <div className="text-center mt-8">Loading books...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Available Books</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((book) => (
                    <Link 
                        to={`/books/${book.id}`} 
                        key={book.id} 
                        className="block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md 
                                   hover:shadow-xl transform hover:-translate-y-1 hover:scale-102 transition-all duration-300"
                    >
                        <img 
                            src={book.cover_image || 'https://via.placeholder.com/200x300?text=No+Cover'} 
                            alt={`${book.title} cover`} 
                            className="w-full h-48 object-cover" 
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-800 truncate mb-1">{book.title}</h2>
                            <p className="text-sm text-gray-600">{book.author}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BookList;
