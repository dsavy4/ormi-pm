import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from '../pages/ErrorPage';
import SimpleErrorFallback from './SimpleErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console (in production, you'd send this to an error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this is a React Router error - if so, let React Router handle it
    if (error.message && error.message.includes('router')) {
      console.log('Detected React Router error, letting React Router handle it');
      return;
    }
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleResetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      try {
        return (
          <ErrorPage
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.handleResetError}
          />
        );
      } catch (error) {
        // If ErrorPage fails, fall back to SimpleErrorFallback
        console.error('ErrorPage failed, using SimpleErrorFallback:', error);
        return (
          <SimpleErrorFallback
            error={this.state.error}
            resetError={this.handleResetError}
          />
        );
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 