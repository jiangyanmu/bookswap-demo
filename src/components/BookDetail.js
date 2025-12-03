// src/components/BookDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/apiService'; // Import the default exported apiService object
import { FEATURES } from '../config/featureFlags';

const BookDetail = () => {
    const { id } = useParams(); // Get the book ID from the URL
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const data = await apiService.getBookById(id); // Use apiService.getBookById
                setBook(data);
                setError(null);
            } catch (error) {
                setError(`Failed to fetch book with ID: ${id}. Please make sure the backend server is running.`);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBook();
        }
    }, [id]);

    if (loading) {
        return <div className="text-center mt-8">Loading book details...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }

    if (!book) {
        return <div className="text-center mt-8">Book not found.</div>;
    }

    const discountPrice = book.price ? (book.price * 0.8).toFixed(2) : 'N/A'; // Calculate discount price if price exists

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
                <img 
                    src={book.cover_image || 'https://via.placeholder.com/300x450?text=No+Cover'} 
                    alt={`${book.title} cover`} 
                    className="w-full md:w-1/3 h-64 md:h-auto object-cover" 
                />
                <div className="p-6 md:w-2/3">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">{book.title}</h1>
                    <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
                    <p className="text-gray-700 leading-relaxed mb-6">{book.description || 'No description available.'}</p>
                    
                    <div className="flex items-baseline mb-6">
                        <span className="text-2xl font-semibold text-gray-900">${book.price ? book.price.toFixed(2) : 'N/A'}</span>
                        {book.price && FEATURES.ENABLE_SMART_BIDDING && (
                            <span className="ml-3 text-lg text-gray-500 line-through">${(book.price / 0.8).toFixed(2)}</span>
                        )}
                    </div>

                    {/* === Feature Toggle Logic === */}
                    {FEATURES.ENABLE_SMART_BIDDING ? (
                        // New feature: Smart Bidding
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                            <p className="font-bold">Testing Hypothesis: Quick Bid Reduces Friction</p>
                            <p>Get this book now with a special 20% discount!</p>
                        </div>
                    ) : (
                        // Old feature: Contact Seller
                        <div className="bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4 mb-6" role="alert">
                            <p className="font-bold">Control Group: Manual Contact</p>
                            <p>Contact the seller to negotiate the price.</p>
                        </div>
                    )}

                    {FEATURES.ENABLE_SMART_BIDDING ? (
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            ⚡ One-Click Bid: ${discountPrice} (20% OFF)
                        </button>
                    ) : (
                        <button
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Contact Seller to Negotiate
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetail;
