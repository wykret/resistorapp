// Import React for component creation
import React from 'react';
// Import React Native components for UI elements
import { View, Text } from 'react-native';
// Import authentication hook from utils
import { useAuth } from '@/utils/auth/useAuth';
// Import Stack navigator from Expo Router
import { Stack } from 'expo-router';

// Configure router for subdirectory deployment on GitHub Pages
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/resistorapp/')) {
  // Ensure router uses correct base path for GitHub Pages subdirectory
  const basePath = '/resistorapp';
  if (!document.querySelector('base')) {
    const base = document.createElement('base');
    base.href = basePath + '/';
    document.head.appendChild(base);
  }
}
// Import SplashScreen to control app loading screen
import * as SplashScreen from 'expo-splash-screen';
// Import useEffect hook for side effects
import { useEffect } from 'react';
// Import GestureHandlerRootView for gesture handling
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Import React Query for data fetching and caching
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Import theme and language providers
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Error Boundary component for web compatibility to catch and display errors
class ErrorBoundary extends React.Component {
  // Initialize component state
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Static method to update state when error occurs
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Method to log error details when error is caught
  componentDidCatch(error, errorInfo) {
    console.warn('App Error:', error, errorInfo);
  }

  // Render method to show error UI or children
  render() {
    if (this.state.hasError) {
      // Show error message if error occurred
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginHorizontal: 20 }}>
            The app encountered an error. Please refresh the page.
          </Text>
        </View>
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

// Prevent the splash screen from auto-hiding until app is ready
SplashScreen.preventAutoHideAsync();

// Create QueryClient instance for React Query with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      cacheTime: 1000 * 60 * 30, // 30 minutes - data kept in cache
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
    },
  },
});

// Main root layout component that sets up the app structure
export default function RootLayout() {
  // Get authentication initialization function and ready state
  const { initiate, isReady } = useAuth();

  // Effect to initialize authentication when component mounts
  useEffect(() => {
    initiate();
  }, [initiate]);

  // Effect to hide splash screen when authentication is ready
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Show nothing while authentication is not ready
  if (!isReady) {
    return null;
  }

  // Render app with all providers and navigation
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="support" />
                <Stack.Screen name="language" />
              </Stack>
            </GestureHandlerRootView>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
