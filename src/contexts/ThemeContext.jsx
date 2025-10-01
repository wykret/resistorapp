// Import React hooks and functions for creating context and managing state
import React, { createContext, useContext, useState, useEffect } from 'react';
// Import AsyncStorage for persistent storage of theme preference
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import Appearance API to detect system theme preference
import { Appearance } from 'react-native';

// Create a React context for sharing theme state throughout the app
const ThemeContext = createContext();

// Custom hook to use the theme context - throws error if used outside provider
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Main theme provider component that manages theme state
export const ThemeProvider = ({ children }) => {
  // State to track if dark mode is active
  const [isDark, setIsDark] = useState(false);
  // State to track if theme is still loading
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load theme preference when component mounts
  useEffect(() => {
    loadTheme();
  }, []);

  // Async function to load saved theme or detect system preference
  const loadTheme = async () => {
    try {
      // Try to get saved theme from storage
      let savedTheme = null;
      try {
        savedTheme = await AsyncStorage.getItem('theme');
      } catch (storageError) {
        console.warn('AsyncStorage not available, using system theme:', storageError);
      }

      // If saved theme exists, use it
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Auto-detect system theme if no saved preference
        let colorScheme = 'light';
        try {
          colorScheme = Appearance.getColorScheme() || 'light';
        } catch (appearanceError) {
          console.warn('Appearance API not available:', appearanceError);
        }
        setIsDark(colorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setIsDark(false); // Fallback to light theme
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle between light and dark themes
  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Theme object containing colors and glassmorphism styles
  const theme = {
    // Current theme state
    isDark,
    // Color palette that adapts to light/dark mode
    colors: {
      background: isDark ? '#000000' : '#ffffff',
      surface: isDark ? '#1a1a1a' : '#f5f5f5',
      card: isDark ? '#2a2a2a' : '#ffffff',
      text: isDark ? '#ffffff' : '#000000',
      textSecondary: isDark ? '#a0a0a0' : '#666666',
      border: isDark ? '#333333' : '#e0e0e0',
      primary: isDark ? '#4a9eff' : '#007aff',
      accent: isDark ? '#ff6b6b' : '#ff3b30',
      success: isDark ? '#4ecdc4' : '#34c759',
      warning: isDark ? '#ffe66d' : '#ff9500',
      error: isDark ? '#ff6b6b' : '#ff3b30',
    },
    // Simplified glassmorphism styles for better performance
    glassmorphism: {
      // Backgrounds with reduced transparency for better performance
      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      backgroundColorLight: isDark ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backgroundColorHeavy: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',

      // Simplified borders
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderColorAccent: isDark ? 'rgba(74, 158, 255, 0.2)' : 'rgba(0, 122, 255, 0.2)',

      // Simplified shadows for better performance
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: isDark ? 8 : 6,

      // Simplified gradient effects
      gradientStart: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      gradientEnd: isDark ? 'rgba(20, 20, 20, 0.8)' : 'rgba(248, 248, 248, 0.8)',

      // Reduced blur intensities for better performance
      blurIntensity: 15,
      blurIntensityLight: 10,
      blurIntensityHeavy: 20,
    }
  };

  // Show nothing while theme is loading to prevent flash
  if (isLoading) {
    return null;
  }

  // Provide theme context to child components
  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
