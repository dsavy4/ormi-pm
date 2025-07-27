// Global error handler for unhandled errors
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior
    event.preventDefault();
    
    // You can send this to an error reporting service
    // Example: Sentry.captureException(event.reason);
    
    // Show a user-friendly error message
    const errorMessage = event.reason?.message || 'An unexpected error occurred';
    console.error('Error details:', {
      message: errorMessage,
      stack: event.reason?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  });

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    
    // You can send this to an error reporting service
    // Example: Sentry.captureException(event.error);
    
    // Show a user-friendly error message
    const errorMessage = event.error?.message || 'An unexpected error occurred';
    console.error('Error details:', {
      message: errorMessage,
      stack: event.error?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  });

  // Handle console errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Call the original console.error
    originalConsoleError.apply(console, args);
    
    // You can add additional error reporting logic here
    // Example: Sentry.captureMessage(args.join(' '), 'error');
  };
};

// Utility function to report errors to external services
export const reportError = (error: Error, context?: Record<string, any>) => {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    context
  };

  // Log to console for development
  console.error('Error Report:', errorReport);

  // In production, you would send this to an error reporting service
  // Example: Sentry.captureException(error, { extra: context });
  
  return errorReport;
};

// Utility function to create user-friendly error messages
export const getUserFriendlyErrorMessage = (error: Error): string => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return 'You don\'t have permission to access this resource.';
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'The request timed out. Please try again.';
  }
  
  if (errorMessage.includes('server') || errorMessage.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Utility function to check if an error is recoverable
export const isRecoverableError = (error: Error): boolean => {
  const errorMessage = error.message.toLowerCase();
  
  // Network errors are usually recoverable
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return true;
  }
  
  // Timeout errors are usually recoverable
  if (errorMessage.includes('timeout')) {
    return true;
  }
  
  // Server errors might be recoverable
  if (errorMessage.includes('server') || errorMessage.includes('500')) {
    return true;
  }
  
  // Authentication errors are usually recoverable
  if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return true;
  }
  
  return false;
}; 