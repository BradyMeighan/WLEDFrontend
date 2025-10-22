import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Filter out Google Maps warnings that are not relevant to our app
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  if (args[0]?.includes?.('google.maps.places.AutocompleteService') ||
      args[0]?.includes?.('google.maps.places.PlacesService')) {
    return; // Suppress Google Maps warnings
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  if (args[0]?.includes?.('MetaMask no longer injects web3') ||
      (args[0]?.includes?.('401') && (
        args[0]?.includes?.('/api/auth/me') || 
        args[0]?.includes?.('/api/auth/refresh')
      ))) {
    return; // Suppress MetaMask warnings and expected auth 401 errors
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
