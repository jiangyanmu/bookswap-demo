import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

const NavBar = () => {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
      isActive
        ? "text-brand bg-brand-tint"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-gray-200 supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-8 h-16 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-bold tracking-tight text-brand hover:opacity-90 transition-opacity">
          BookSwap
        </NavLink>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-4">
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
              
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-300">
                <span className="text-sm text-gray-700 hidden sm:inline-block font-medium">
                  {user.username}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="!px-3 !py-1.5 text-xs sm:text-sm hover:text-danger hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <NavLink to="/login" className={navLinkClasses}>
                Login
              </NavLink>
              <NavLink to="/register">
                <Button variant="primary" className="!px-4 !py-2 text-xs sm:text-sm shadow-none hover:shadow-soft">
                  Get Started
                </Button>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;