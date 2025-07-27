import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface SimpleErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const SimpleErrorFallback: React.FC<SimpleErrorFallbackProps> = ({ error, resetError }) => {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Something Went Wrong
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
              We encountered an unexpected error. Please try again.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Details */}
            {error && (
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-mono rounded-md">
                  {error.message || 'Unknown Error'}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleGoHome}
                className="w-full bg-ormi-primary hover:bg-ormi-primary-dark text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
              <p>If this problem persists, please contact our support team.</p>
              <p className="mt-1">support@ormi.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleErrorFallback; 