import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  mode?: 'default' | 'enhanced' | 'indicator';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
  showSteps?: boolean;
  steps?: number;
  stepsLabels?: string[];
  onStepClick?: (step: number) => void;
  color?: 'primary' | 'success' | 'warning' | 'gradient';
}

export function ProgressBar({
  value,
  max = 100,
  mode = 'default',
  size = 'md',
  showValue = false,
  animated = true,
  className = '',
  showSteps = false,
  steps = 5,
  stepsLabels = [],
  onStepClick,
  color = 'gradient'
}: ProgressBarProps) {
  const { theme, mode: themeMode } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Animation for the progress value
  useEffect(() => {
    if (animated) {
      // Reset to 0 if the value decreases significantly
      if (value < displayValue - 10) {
        setDisplayValue(0);
      }
      
      const interval = setInterval(() => {
        setDisplayValue(prev => {
          if (prev < value) {
            return Math.min(prev + 1, value);
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 20);
      
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated, displayValue]);

  // Height classes based on size
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Color classes based on color prop
  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    gradient: themeMode === 'onboarding' 
      ? 'bg-gradient-to-r from-purple-600 to-pink-500'
      : 'bg-gradient-to-r from-indigo-600 to-blue-500'
  };

  // Calculate step markers
  const stepMarkers = showSteps
    ? Array.from({ length: steps }).map((_, index) => {
        const stepValue = (100 / (steps - 1)) * index;
        const isCompleted = displayValue >= stepValue;
        const label = stepsLabels[index] || `${stepValue}%`;
        
        return { value: stepValue, isCompleted, label };
      })
    : [];

  if (mode === 'indicator') {
    return (
      <div className={`w-full ${className}`}>
        {/* Top linear progress bar */}
        <div className="fixed top-0 left-0 right-0 z-10 h-1 bg-gray-900">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stepper with circles, numbers and titles - desktop version */}
        <div className="hidden md:flex justify-between items-center max-w-xl mx-auto mb-8">
          {stepMarkers.map((step, index) => (
            <div key={index} className="flex flex-col items-center relative group">
              {/* Connector lines between steps */}
              {index > 0 && (
                <div className="absolute h-0.5 bg-gray-700 w-full -left-1/2 top-4 -z-10" />
              )}
              {/* Completed connector lines */}
              {index > 0 && index <= displayValue && (
                <div 
                  className="absolute h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 w-full -left-1/2 top-4 -z-10"
                  style={{ width: index === displayValue ? '50%' : '100%' }}
                />
              )}

              {/* Step circle */}
              <div 
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2
                  ${index < displayValue 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30' 
                    : index === displayValue
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ring-4 ring-purple-500/20'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'}
                  transition-all duration-300
                  ${index < displayValue ? 'group-hover:scale-110' : ''}
                `}
              >
                {index < displayValue ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step title */}
              <div 
                className={`
                  text-sm font-medium mb-1 whitespace-nowrap
                  ${index <= displayValue ? 'text-white' : 'text-gray-500'}
                `}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile version - simplified but more informative */}
        <div className="md:hidden px-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">
              Step {Math.floor(displayValue) + 1} of {steps}
            </span>
            <span className="text-sm font-medium text-purple-400">
              {Math.round(percentage)}% Complete
            </span>
          </div>
          
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-in-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="text-center">
            <h4 className="text-white font-medium">{stepMarkers[Math.floor(displayValue)]?.label}</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar track & fill */}
      <div className={`w-full ${heightClasses[size]} bg-gray-700 rounded-full overflow-hidden relative`}>
        <div
          className={`${heightClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${displayValue}%` }}
        >
          {animated && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="animate-pulse-light opacity-30 h-full w-full"></div>
            </div>
          )}
        </div>
        
        {/* Step markers */}
        {showSteps && (
          <div className="absolute inset-0 flex items-center justify-between">
            {stepMarkers.map((step, index) => (
              <div
                key={index}
                className={`${onStepClick ? 'cursor-pointer' : ''}`}
                onClick={() => onStepClick && onStepClick(index)}
              >
                <div className={`
                  w-3 h-3 rounded-full border-2 border-gray-700
                  ${step.isCompleted 
                    ? themeMode === 'onboarding' ? 'bg-pink-500' : 'bg-indigo-500' 
                    : 'bg-gray-900'
                  }
                  transition-all duration-300
                `}></div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Step labels */}
      {showSteps && (
        <div className="flex justify-between mt-2">
          {stepMarkers.map((step, index) => (
            <div 
              key={index}
              className={`
                text-xs transition-colors duration-300
                ${step.isCompleted ? 'text-gray-200' : 'text-gray-500'}
                ${index === 0 ? 'text-left' : ''}
                ${index === stepMarkers.length - 1 ? 'text-right' : ''}
              `}
            >
              {step.label}
            </div>
          ))}
        </div>
      )}
      
      {/* Value display */}
      {showValue && (
        <div className="mt-2 text-right">
          <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            {mode === 'enhanced' ? `${value} of ${max} complete` : `${Math.round(percentage)}%`}
          </span>
        </div>
      )}
    </div>
  );
}