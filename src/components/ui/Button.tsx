import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
  iconOnly?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  gradient = false,
  iconOnly = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const sizeClasses = {
    sm: iconOnly ? 'p-2 text-sm' : 'px-4 py-2 text-sm',
    md: iconOnly ? 'p-2.5 text-base' : 'px-5 py-2.5 text-base',
    lg: iconOnly ? 'p-3 text-lg' : 'px-6 py-3 text-lg',
  };
  
  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 active:from-purple-800 active:to-pink-700 focus:ring-purple-500'
      : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 focus:ring-purple-500',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-gray-600 text-gray-200 hover:bg-gray-800 active:bg-gray-700 focus:ring-gray-400',
    ghost: 'text-gray-200 hover:bg-gray-800 active:bg-gray-700 focus:ring-gray-400',
    success: gradient
      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700 focus:ring-green-500'
      : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
  };
  
  // Add disabled styles
  const disabledClasses = (props.disabled || isLoading) 
    ? 'opacity-60 cursor-not-allowed pointer-events-none' 
    : '';
  
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${disabledClasses}
    ${iconOnly ? 'aspect-square' : ''}
    ${className}
  `;
  
  // Wrap the onClick handler to add debugging
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button: onClick event triggered', { 
      disabled: props.disabled || isLoading,
      variant,
      buttonText: typeof children === 'string' ? children : 'non-string children'
    });
    
    // Call the original onClick handler if provided
    if (onClick && !isLoading && !props.disabled) {
      onClick(e);
    }
  };

  return (
    <button
      className={buttonClasses}
      disabled={isLoading || props.disabled}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{iconOnly ? '' : 'Loading...'}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className={`${iconOnly ? '' : 'mr-2'}`}>{leftIcon}</span>}
          {!iconOnly && children}
          {iconOnly && !leftIcon && children}
          {rightIcon && !iconOnly && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;