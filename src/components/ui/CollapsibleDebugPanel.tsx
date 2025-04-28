import React, { useState } from 'react';

interface DebugInfoItem {
  label: string;
  value: any;
  color?: string;
  highlight?: boolean;
}

interface CollapsibleDebugPanelProps {
  title?: string;
  items: DebugInfoItem[];
  initiallyExpanded?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showInProd?: boolean;
}

const CollapsibleDebugPanel: React.FC<CollapsibleDebugPanelProps> = ({
  title = 'Debug Information',
  items,
  initiallyExpanded = false,
  position = 'top-left',
  showInProd = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  
  // Only show in development mode unless showInProd is true
  if (process.env.NODE_ENV !== 'development' && !showInProd) {
    return null;
  }
  
  // Position styles
  const positionStyles = {
    'top-left': { top: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' }
  };
  
  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'empty array';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[object]';
      }
    }
    return String(value);
  };
  
  return (
    <div 
      className="fixed rounded-md overflow-hidden shadow-lg transition-all duration-300 ease-in-out z-50 border border-gray-700"
      style={{
        ...positionStyles[position],
        maxWidth: '350px',
        fontSize: '12px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        backgroundColor: 'rgba(25, 25, 30, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transform: `scale(${isExpanded ? '1' : '0.98'})`,
        opacity: isExpanded ? '1' : '0.95',
      }}
    >
      {/* Header / Toggle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center cursor-pointer p-2 bg-gray-800 bg-opacity-60 border-b border-gray-700 hover:bg-opacity-80 transition-colors"
      >
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
          <span className="font-medium text-gray-200">{title}</span>
        </div>
        <span className="text-gray-400 ml-2 px-1 flex items-center justify-center rounded hover:bg-gray-700 transition-colors">
          {isExpanded ? '▼' : '►'}
        </span>
      </div>
      
      {/* Content */}
      {isExpanded && (
        <div className="p-3 overflow-auto max-h-[calc(100vh-120px)]">
          {items.map((item, index) => (
            <div 
              key={index} 
              className={`mb-2 pb-2 flex flex-wrap justify-between items-start text-xs ${
                index < items.length - 1 ? 'border-b border-gray-700 border-opacity-50' : ''
              }`}
            >
              <span className="text-gray-400 font-medium mr-2 mb-1">
                {item.label}:
              </span>
              <span 
                className={`${item.highlight ? 'font-semibold' : 'font-normal'} max-w-[200px] text-right break-words`}
                style={{ color: item.color || '#fff' }}
              >
                {formatValue(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleDebugPanel; 