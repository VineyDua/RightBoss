import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CollapsibleDebugPanel from './CollapsibleDebugPanel';

// Create a context for debug state
interface DebugContextType {
  isDebugEnabled: boolean;
  showDebugBanners: boolean;
  toggleDebug: () => void;
  toggleDebugBanners: () => void;
  addDebugData: (key: string, value: any) => void;
  clearDebugData: () => void;
  debugData: Record<string, any>;
}

const DebugContext = createContext<DebugContextType>({
  isDebugEnabled: false,
  showDebugBanners: false,
  toggleDebug: () => {},
  toggleDebugBanners: () => {},
  addDebugData: () => {},
  clearDebugData: () => {},
  debugData: {}
});

// Hook to use debug context
export const useDebug = () => useContext(DebugContext);

// Debug Controller Provider
interface DebugControllerProviderProps {
  children: ReactNode;
  initiallyEnabled?: boolean;
}

export const DebugControllerProvider: React.FC<DebugControllerProviderProps> = ({ 
  children, 
  initiallyEnabled = false 
}) => {
  // Initialize debug state from localStorage or props
  const [isDebugEnabled, setIsDebugEnabled] = useState(
    initiallyEnabled || localStorage.getItem('debug_mode') === 'true'
  );
  
  // For banner visibility (defaulting to false now)
  const [showDebugBanners, setShowDebugBanners] = useState(
    localStorage.getItem('show_debug_banners') === 'true' // Default to false unless explicitly set to true
  );
  
  const [debugData, setDebugData] = useState<Record<string, any>>({});
  
  // Toggle debug mode
  const toggleDebug = () => {
    const newState = !isDebugEnabled;
    setIsDebugEnabled(newState);
    localStorage.setItem('debug_mode', String(newState));
  };
  
  // Toggle debug banners
  const toggleDebugBanners = () => {
    const newState = !showDebugBanners;
    setShowDebugBanners(newState);
    localStorage.setItem('show_debug_banners', String(newState));
  };
  
  // Add debug data
  const addDebugData = (key: string, value: any) => {
    setDebugData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Clear debug data
  const clearDebugData = () => {
    setDebugData({});
  };
  
  // Listen for keyboard shortcut to toggle debug (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDebug();
      }
      // Add keyboard shortcut for banners only (Ctrl+Shift+B)
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        toggleDebugBanners();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDebugEnabled, showDebugBanners]);
  
  return (
    <DebugContext.Provider value={{ 
      isDebugEnabled, 
      showDebugBanners,
      toggleDebug, 
      toggleDebugBanners,
      addDebugData, 
      clearDebugData, 
      debugData 
    }}>
      {children}
      
      {/* Always show minimal debug toggle in corner */}
      <div className="fixed bottom-4 right-4 z-[9999]">
        {isDebugEnabled ? (
          <div className="p-2 rounded bg-black bg-opacity-70 border border-gray-600 shadow-lg">
            <div className="flex flex-col gap-2">
              {/* Debug mode toggle */}
              <button
                onClick={toggleDebug}
                className="px-3 py-1.5 rounded text-xs font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors flex items-center"
              >
                <span className="mr-1">Debug Mode: ON</span>
                <kbd className="ml-1 px-1.5 py-0.5 text-xs rounded bg-gray-700 text-gray-300 hidden sm:inline-block">
                  Ctrl+Shift+D
                </kbd>
              </button>
              
              {/* Banner toggle */}
              <button
                onClick={toggleDebugBanners}
                className="px-3 py-1.5 rounded text-xs font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors flex items-center"
              >
                <span className="mr-1">Debug Banners: {showDebugBanners ? 'ON' : 'OFF'}</span>
                <kbd className="ml-1 px-1.5 py-0.5 text-xs rounded bg-gray-700 text-gray-300 hidden sm:inline-block">
                  Ctrl+Shift+B
                </kbd>
              </button>
            </div>
            
            {/* Global debug data panel (only show if there's actual data) */}
            {Object.keys(debugData).length > 0 && (
              <CollapsibleDebugPanel
                title="Global Debug Data"
                position="bottom-right"
                initiallyExpanded={false}
                items={Object.entries(debugData).map(([key, value]) => ({
                  label: key,
                  value,
                  color: typeof value === 'boolean' ? (value ? '#90EE90' : '#FF6347') : undefined
                }))}
              />
            )}
          </div>
        ) : (
          <button 
            onClick={toggleDebug}
            className="px-2 py-1 rounded-sm text-xs font-medium bg-gray-800 text-white opacity-50 hover:opacity-100 transition-opacity"
          >
            Debug Mode
          </button>
        )}
      </div>
    </DebugContext.Provider>
  );
};

// Debug panel that can be used in any component
interface DebugPanelProps {
  title?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  dataKey: string; // Unique identifier for this debug panel
  getData: () => Record<string, any>; // Function to get current debug data
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  title = 'Debug Panel',
  position = 'top-right',
  dataKey,
  getData
}) => {
  const { isDebugEnabled } = useDebug();
  const [data, setData] = useState<Record<string, any>>({});
  
  // Update data every second
  useEffect(() => {
    if (!isDebugEnabled) return;
    
    const updateData = () => {
      setData(getData());
    };
    
    // Initial update
    updateData();
    
    // Set interval for updates
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, [isDebugEnabled, getData]);
  
  if (!isDebugEnabled) return null;
  
  // Convert data to items for panel
  const items = Object.entries(data).map(([key, value]) => ({
    label: key,
    value,
    color: typeof value === 'boolean' 
      ? (value ? '#90EE90' : '#FF6347') 
      : undefined,
    highlight: key.includes('Error') || key.includes('warning')
  }));
  
  return (
    <CollapsibleDebugPanel
      title={title}
      position={position}
      initiallyExpanded={false}
      items={items}
    />
  );
};

export default DebugControllerProvider; 