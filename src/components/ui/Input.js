import React from 'react';

const Input = ({ 
  id, 
  type = 'text', 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = '',
  min,
  step
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand focus:outline-none placeholder-gray-400 transition-all duration-200 shadow-sm sm:text-sm hover:border-gray-400"
      />
    </div>
  );
};

export default Input;