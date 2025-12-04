import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import Card from './ui/Card';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const data = await apiService.getBooks();
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
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-danger text-center font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Discover Books</h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    Explore our curated collection of second-hand technical books at unbeatable prices.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {books.map((book) => (
                    <Link to={`/books/${book.id}`} key={book.id} className="block group h-full">
                        <Card className="h-full p-4 border border-gray-100 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col">
                            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-100 mb-4 relative shadow-inner">
                                <img 
                                    src={book.cover_image || 'https://via.placeholder.com/200x300?text=No+Cover'} 
                                    alt={`${book.title} cover`} 
                                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/5 transition-colors duration-300" />
                            </div>
                            <div className="space-y-2 mt-auto">
                                <h2 className="text-lg font-semibold text-gray-900 truncate group-hover:text-brand transition-colors">
                                    {book.title}
                                </h2>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 truncate flex-1 mr-2">{book.author}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-tint text-brand-dark">
                                        ${book.price}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BookList;