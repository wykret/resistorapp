// Import the Expo Router for navigation functionality
import { router } from 'expo-router';
// Import Expo's SecureStore for secure storage on native platforms
import * as SecureStore from 'expo-secure-store';
// Import React hooks: useCallback for memoized functions, useMemo for memoized values, useEffect for side effects
import { useCallback, useMemo, useEffect } from 'react';
// Import Zustand to create state stores
import { create } from 'zustand';
// Import React Native components: Modal for popups, View for layout
import { Modal, View } from 'react-native';
// Import authentication-related stores and utilities from the local store file
import { useAuthModal, useAuthStore, authKey, storage } from './store';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  // Get authentication state and setters from the auth store
  const { isReady, auth, setAuth } = useAuthStore();
  // Get modal state and functions from the auth modal store
  const { isOpen, close, open } = useAuthModal();

  // Memoized function to initialize authentication by loading stored auth data
  const initiate = useCallback(async () => {
    try {
      // Retrieve stored authentication data
      const auth = await storage.getItem(authKey);
      // Update the store with parsed auth data or null if no data
      useAuthStore.setState({
        auth: auth ? JSON.parse(auth) : null,
        isReady: true,
      });
    } catch (error) {
      console.warn('Failed to initialize auth:', error);
      // Set store to ready state with no auth data on error
      useAuthStore.setState({
        auth: null,
        isReady: true,
      });
    }
  }, []);

  // Empty useEffect - placeholder for future side effects
  useEffect(() => {}, []);

  // Memoized function to open sign-in modal
  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  // Memoized function to open sign-up modal
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  // Memoized function to sign out user and close modal
  const signOut = useCallback(() => {
    setAuth(null);
    close();
  }, [close]);

  // Return authentication-related functions and state
  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  // Get authentication status from useAuth hook
  const { isAuthenticated, isReady } = useAuth();
  // Get the open function from the auth modal store
  const { open } = useAuthModal();

  // Effect to open modal if user is not authenticated and app is ready
  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

// Export the useAuth hook as the default export
export default useAuth;
