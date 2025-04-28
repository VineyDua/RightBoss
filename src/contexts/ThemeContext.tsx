import React, { createContext, useContext, useState, ReactNode } from 'react';

// Theme types and configuration
export type ThemeMode = 'onboarding' | 'profile';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackground: string;
  borderColor: string;
}

const themes: Record<ThemeMode, ThemeConfig> = {
  onboarding: {
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#111827',
    textColor: '#F9FAFB',
    cardBackground: '#1F2937',
    borderColor: '#374151'
  },
  profile: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#6366F1',
    backgroundColor: '#F9FAFB',
    textColor: '#111827',
    cardBackground: '#FFFFFF',
    borderColor: '#E5E7EB'
  }
};

export const getTheme = (mode: ThemeMode): ThemeConfig => themes[mode];

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'profile',
  setMode: () => {},
  theme: getTheme('profile'),
});

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialMode = 'profile'
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 