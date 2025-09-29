// Import the Expo Metro runtime to enable Metro bundler functionality for web
import '@expo/metro-runtime';
// Import a utility to handle console logging and parent communication
import './__create/consoleToParent';
// Import the function to render the root component of the Expo Router
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

// Import the global CSS reset styles
import './__create/reset.css';
// Import the main App component
import CreateApp from './App';

// Load Skia Web asynchronously without blocking app initialization
// Check if we're in a browser environment (window object exists)
if (typeof window !== 'undefined') {
  // Dynamically import the Skia Web module
  import('@shopify/react-native-skia/lib/module/web').then(({ LoadSkiaWeb }) => {
    // Load Skia Web and handle any loading errors with a warning
    LoadSkiaWeb().catch((error) => {
      console.warn('Failed to load Skia Web:', error);
    });
  }).catch((error) => {
    // Handle any errors during the import process with a warning
    console.warn('Failed to import Skia Web:', error);
  });
}

// Render the app immediately using the root component renderer
renderRootComponent(CreateApp);
