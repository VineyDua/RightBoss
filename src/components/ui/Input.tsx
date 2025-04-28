import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  valid?: boolean;
  required?: boolean;
  helpText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  valid = false,
  required = false,
  helpText,
  onFocus,
  onBlur,
  onClick,
  ...props
}) => {
  const { mode } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showHelpText, setShowHelpText] = useState(false);
  
  // Apply theme-specific styling
  const baseInputStyle = mode === 'onboarding'
    ? 'bg-gray-800 text-white rounded-lg border border-gray-700 text-base shadow-sm'
    : 'bg-gray-900 text-gray-200 rounded-lg border border-gray-700 text-base';
    
  // Apply different styles based on state
  const inputStyle = error 
    ? `${baseInputStyle} border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent`
    : valid 
      ? `${baseInputStyle} border-green-500 focus:ring-2 focus:ring-green-500 focus:border-transparent`
      : focused
        ? `${baseInputStyle} border-purple-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent`
        : `${baseInputStyle} focus:ring-2 focus:ring-purple-500 focus:border-transparent`;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event from bubbling up
    setFocused(true);
    setShowHelpText(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event from bubbling up
    setFocused(false);
    setTimeout(() => setShowHelpText(false), 200);
    if (onBlur) onBlur(e);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop event from bubbling up
    if (onClick) onClick(e);
  };
  
  return (
    <div 
      className={`mb-5 ${fullWidth ? 'w-full' : ''}`}
      onClick={(e) => e.stopPropagation()} // Stop clicks on the container from bubbling up
    >
      {label && (
        <label 
          className="block text-gray-300 text-sm font-medium mb-2 flex items-center"
          onClick={(e) => e.stopPropagation()} // Stop clicks on the label from bubbling up
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
          {helpText && (
            <button 
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-300 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation(); // Stop event bubbling
                setShowHelpText(!showHelpText);
              }}
              aria-label="Show help text"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </label>
      )}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            ${inputStyle}
            block w-full px-4 py-3 transition duration-150 ease-in-out
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || valid ? 'pr-10' : ''}
            ${className}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleClick}
          {...props}
        />
        
        {/* Show valid icon if field is valid */}
        {valid && !rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-green-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {/* Show custom right icon if provided */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && <p className="mt-1.5 text-sm text-red-500 flex items-center"><span className="mr-1">⚠</span>{error}</p>}
      
      {/* Help text - shown on focus or button click */}
      {showHelpText && helpText && !error && (
        <p className="mt-1.5 text-sm text-purple-400 transition-opacity duration-200 bg-gray-800/80 p-2 rounded">{helpText}</p>
      )}
      
      {/* Static hint text - always shown */}
      {hint && !error && !showHelpText && <p className="mt-1.5 text-sm text-gray-400">{hint}</p>}
    </div>
  );
};

export default Input;