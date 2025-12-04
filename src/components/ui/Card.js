import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-card border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-soft ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;