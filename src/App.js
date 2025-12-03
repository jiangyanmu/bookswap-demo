// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useNavigate, // Use useNavigate for programmatic navigation
} from "react-router-dom";
import BookList from "./components/BookList";
import BookDetail from "./components/BookDetail";
import Login from "./components/Login";
import Register from "./components/Register"; // Import the new Register component
import CreateBook from "./components/CreateBook"; // Import the new CreateBook component
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import AuthProvider and useAuth

// Navigation Bar Component (moved to a separate component for cleaner App.js)
const NavBar = () => {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
      <NavLink to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
        BookSwap
      </NavLink>
      <div className="flex items-center space-x-2">
        <NavLink to="/" className={navLinkClasses}>
          Home
        </NavLink>
        {isAuthenticated ? (
          <>
            {isSeller && (
              <NavLink to="/create-book" className={navLinkClasses}>
                List Book
              </NavLink>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              Logout ({user.username})
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClasses}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClasses}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap the entire application with AuthProvider */}
        <div className="App bg-gray-100 min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <NavBar /> {/* Use the new NavBar component */}
          </header>

          <main className="container mx-auto px-4 py-8 flex-grow">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<BookList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> {/* New route for Register */}
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/create-book" element={<CreateBook />} /> {/* New route for CreateBook */}
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
              <p>&copy; {new Date().getFullYear()} BookSwap. All Rights Reserved.</p>
              <p>A DevSecOps Demo Project</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
