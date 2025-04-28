import React from 'react';
import { classNames } from '../../lib/helpers';

export type CardVariant = 'default' | 'profile' | 'job';
export type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  elevated?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  size = 'md',
  className,
  footer,
  header,
  elevated = false,
  hoverable = false,
  bordered = false,
  onClick
}: CardProps) {
  // Build className based on props
  const baseClasses = 'rounded-lg overflow-hidden';
  
  // Variant classes
  let variantClasses = '';
  if (variant === 'default') variantClasses = 'bg-gray-800';
  else if (variant === 'profile') variantClasses = 'bg-blue-50/10';
  else if (variant === 'job') variantClasses = 'bg-gray-50/10';
  
  // Size classes
  let sizeClasses = '';
  if (size === 'sm') sizeClasses = 'p-4';
  else if (size === 'md') sizeClasses = 'p-6';
  else if (size === 'lg') sizeClasses = 'p-8';
  
  // Elevation classes
  const elevationClasses = elevated ? 'shadow-lg shadow-black/30' : 'shadow-md shadow-black/20';
  
  // Hover classes
  const hoverClasses = hoverable ? 'transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 hover:transform hover:-translate-y-1' : '';
  
  // Border classes
  const borderClasses = bordered ? 'border border-gray-700' : '';
  
  // Interactive classes
  const interactiveClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={classNames(
        baseClasses,
        variantClasses,
        sizeClasses,
        elevationClasses,
        hoverClasses,
        borderClasses,
        interactiveClasses,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {header && (
        <div className="mb-4 border-b border-gray-700 pb-4">
          {header}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;