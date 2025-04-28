import React, { useEffect } from 'react';
import { useDebug } from './DebugController';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  const { isDebugEnabled } = useDebug();
  
  useEffect(() => {
    console.log('LoadingScreen mounted:', { message, timestamp: new Date().toISOString() });
    
    return () => {
      console.log('LoadingScreen unmounted:', { timestamp: new Date().toISOString() });
    };
  }, [message]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-purple-600/20 border-t-purple-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-400">{message}</p>
        
        {/* Debug information - only shows when debug mode is enabled */}
        {isDebugEnabled && (
          <div className="mt-2 text-xs text-gray-600">
            <p>Debug info: {new Date().toISOString()}</p>
            <p>Component: LoadingScreen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;