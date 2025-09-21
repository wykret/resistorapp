import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Auto-detect system theme
        const colorScheme = Appearance.getColorScheme();
        setIsDark(colorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDark,
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
    glassmorphism: {
      backgroundColor: isDark ? 'rgba(42, 42, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};