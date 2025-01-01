import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add performance monitoring
const reportWebVitals = (metric: any) => {
  console.log('Performance metric:', metric);
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

// Wrap in error boundary
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Monitor performance
reportWebVitals(window.performance);

// Add global error handling
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};