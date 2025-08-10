import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandling } from './utils/errorHandler';
import { OverlayProvider } from './components/ui/enhanced-sheet';

// Setup global error handling
setupGlobalErrorHandling();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </OverlayProvider>
    </QueryClientProvider>
  </React.StrictMode>,
); 