import React from 'react';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertTriangle, Home, RefreshCw, ArrowLeft, Shield, Bug } from 'lucide-react';

export const RouteErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const routeError = useRouteError();

  // Determine the error type and message
  const getErrorDetails = () => {
    if (routeError && isRouteErrorResponse(routeError)) {
      return {
        title: 'Page Not Found',
        message: 'The page you\'re looking for doesn\'t exist or has been moved.',
        icon: Shield,
        code: routeError.status,
        type: 'not-found'
      };
    }

    return {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again.',
      icon: AlertTriangle,
      code: 'UNKNOWN',
      type: 'unknown'
    };
  };

  const errorDetails = getErrorDetails();
  const IconComponent = errorDetails.icon;

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReportIssue = () => {
    const errorReport = {
      title: errorDetails.title,
      message: errorDetails.message,
      error: (routeError as any)?.message || 'Unknown error',
      stack: (routeError as any)?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    console.error('Route Error Report:', errorReport);
    alert('Error report logged. Our team will investigate this issue.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <IconComponent className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {errorDetails.title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
              {errorDetails.message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Code */}
            {errorDetails.code && (
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-mono rounded-md">
                  Error Code: {errorDetails.code}
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
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
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

            {/* Report Issue */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={handleReportIssue}
                variant="ghost"
                size="sm"
                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Report This Issue
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

export default RouteErrorPage; 