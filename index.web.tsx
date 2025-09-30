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

// Removed Skia Web loading as dependency was removed for optimization

// Render the app immediately using the root component renderer
renderRootComponent(CreateApp);
