import { useState, useEffect } from 'react';

/**
 * Hook to get theme-aware colors
 */
export const useThemeColor = () => {
  const [theme, setTheme] = useState('light'); // Default to light
  useEffect(() => {
    // Update theme based on system preference or settings
    // This could be replaced with your actual theme detection logic
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  const getColor = (lightColor: string, darkColor: string) => {
    return theme === 'dark' ? darkColor : lightColor;
  };

  return { theme, getColor };
};