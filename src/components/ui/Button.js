import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark shadow-soft hover:shadow-card focus:ring-brand-light",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 shadow-sm focus:ring-gray-300",
    danger: "bg-red-50 text-danger hover:bg-red-100 hover:text-red-700 focus:ring-red-200",
    ghost: "text-gray-500 hover:text-brand hover:bg-brand-tint"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;