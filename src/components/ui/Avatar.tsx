import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallback,
}) => {
  const [error, setError] = React.useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };
  
  const getFallbackInitials = () => {
    if (fallback) return fallback.charAt(0).toUpperCase();
    if (alt && alt !== 'Avatar') {
      return alt
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'U';
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full bg-gray-800 text-gray-200
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
          onError={handleError}
        />
      ) : (
        <span className="font-medium">{getFallbackInitials()}</span>
      )}
    </div>
  );
};

export default Avatar;