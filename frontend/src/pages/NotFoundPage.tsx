import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Home, ArrowLeft, MapPin, Building2, Users, Wrench, BarChart3 } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, description: 'View your property overview' },
    { name: 'Properties', path: '/properties', icon: Building2, description: 'Manage your properties' },
    { name: 'Tenants', path: '/tenants', icon: Users, description: 'Manage tenant information' },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, description: 'Track maintenance requests' },
    { name: 'Reports', path: '/reports', icon: BarChart3, description: 'View analytics and reports' },
  ];

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleQuickLink = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
            <div className="mt-4">
              <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-mono rounded-lg">
                404 - Page Not Found
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Current URL Display */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">You tried to access:</p>
              <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-mono rounded-lg break-all">
                {window.location.pathname}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleGoHome}
                className="bg-ormi-primary hover:bg-ormi-primary-dark text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleGoBack}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Quick Links */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-4">
                Quick Navigation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Button
                      key={link.path}
                      onClick={() => handleQuickLink(link.path)}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center text-center hover:bg-ormi-primary hover:text-white transition-colors"
                    >
                      <IconComponent className="w-6 h-6 mb-2" />
                      <span className="font-medium">{link.name}</span>
                      <span className="text-xs opacity-75 mt-1">{link.description}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Help Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Can't find what you're looking for?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Contact support:</span>
                  <a 
                    href="mailto:support@ormi.com" 
                    className="text-ormi-primary hover:text-ormi-primary-dark font-medium"
                  >
                    support@ormi.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundPage; 