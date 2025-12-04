import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import BookList from "./components/BookList";
import BookDetail from "./components/BookDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import CreateBook from "./components/CreateBook";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-soft flex flex-col font-sans text-gray-900 selection:bg-brand-light/30">
          <NavBar />

          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<BookList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/create-book" element={<CreateBook />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-sm font-semibold text-gray-900">BookSwap</h3>
                  <p className="text-sm text-gray-500 mt-1">DevSecOps Demo Project</p>
                </div>
                <div className="text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} BookSwap. All Rights Reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;