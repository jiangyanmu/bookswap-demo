import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [bidMessage, setBidMessage] = useState('');

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const data = await apiService.getBookById(id);
                setBook(data);
            } catch (err) {
                setError('Failed to fetch book details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    const handleBid = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            await apiService.placeBid(book.id, parseFloat(bidAmount));
            setBidMessage('Bid placed successfully!');
            setBidAmount('');
        } catch (err) {
            setBidMessage('Failed to place bid. Please try again.');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
    );
    
    if (error) return (
        <div className="text-center mt-12 text-danger bg-red-50 p-6 rounded-xl max-w-md mx-auto border border-red-100">
            {error}
        </div>
    );

    if (!book) return <div className="text-center mt-12 text-gray-500">Book not found</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <Button 
                variant="ghost" 
                onClick={() => navigate(-1)} 
                className="mb-6 pl-0 hover:bg-transparent hover:text-brand group"
            >
                <span className="inline-block transition-transform group-hover:-translate-x-1 mr-1">←</span>
                Back to Books
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Book Cover */}
                <div className="md:col-span-5 lg:col-span-4">
                    <Card className="p-6 h-auto flex items-center justify-center bg-white border border-gray-100 shadow-card overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white -z-10" />
                        <img 
                            src={book.cover_image || 'https://via.placeholder.com/300x450?text=No+Cover'} 
                            alt={book.title} 
                            className="w-full h-auto object-cover rounded shadow-lg transform transition-transform duration-700 group-hover:scale-105" 
                        />
                    </Card>
                </div>

                {/* Right Column: Book Details */}
                <div className="md:col-span-7 lg:col-span-8">
                    <Card className="h-full flex flex-col p-8 shadow-soft hover:shadow-card transition-shadow border border-gray-100">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{book.title}</h1>
                                    <p className="text-xl text-brand font-medium">{book.author}</p>
                                </div>
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold bg-brand-tint text-brand-dark">
                                    ${book.price}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {book.description || "No description available for this book."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Place a Bid</h3>
                            
                            {bidMessage && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-medium flex items-center ${bidMessage.includes('success') ? 'bg-green-50 text-success border border-green-100' : 'bg-red-50 text-danger border border-red-100'}`}>
                                    {bidMessage}
                                </div>
                            )}
                            
                            <form onSubmit={handleBid} className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="w-full sm:flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Enter your bid amount"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        required
                                        min={book.price}
                                        step="0.01"
                                        className="w-full"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={!isAuthenticated}
                                    className="w-full sm:w-auto h-[42px]"
                                >
                                    {isAuthenticated ? 'Submit Bid' : 'Login to Bid'}
                                </Button>
                            </form>
                            
                            {!isAuthenticated && (
                                <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                    You need to be logged in to participate in auctions.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;