// Import the Zustand library to create state stores
import { create } from 'zustand';
// Import Expo's SecureStore for secure storage on native platforms
import * as SecureStore from 'expo-secure-store';

// Define the key for storing authentication data, using environment variable or default
export const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID || 'resistor'}-jwt`;

// Web-compatible storage object that works on both web and native platforms
const storage = {
  // Function to get an item from storage
  getItem: async (key) => {
    // Check if we're in a web environment
    if (typeof window !== 'undefined') {
      // Web environment - use localStorage
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage not available:', error);
        return null;
      }
    } else {
      // Native environment - use SecureStore
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.warn('SecureStore not available:', error);
        return null;
      }
    }
  },
  // Function to set an item in storage
  setItem: async (key, value) => {
    // Check if we're in a web environment
    if (typeof window !== 'undefined') {
      // Web environment - use localStorage
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('localStorage not available:', error);
      }
    } else {
      // Native environment - use SecureStore
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.warn('SecureStore not available:', error);
      }
    }
  },
  // Function to delete an item from storage
  deleteItem: async (key) => {
    // Check if we're in a web environment
    if (typeof window !== 'undefined') {
      // Web environment - use localStorage
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage not available:', error);
      }
    } else {
      // Native environment - use SecureStore
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn('SecureStore not available:', error);
      }
    }
  },
};

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set) => ({
  // Initial state: not ready and no authentication
  isReady: false,
  auth: null,
  // Function to set authentication data
  setAuth: async (auth) => {
    try {
      // If auth data exists, store it; otherwise, delete it
      if (auth) {
        await storage.setItem(authKey, JSON.stringify(auth));
      } else {
        await storage.deleteItem(authKey);
      }
      // Update the state with the new auth data
      set({ auth });
    } catch (error) {
      console.warn('Failed to set auth:', error);
      // Update state even if storage fails
      set({ auth });
    }
  },
}));

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  // Initial state: modal closed, default mode is signup
  isOpen: false,
  mode: 'signup',
  // Function to open the modal with optional mode
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signup' }),
  // Function to close the modal
  close: () => set({ isOpen: false }),
}));
