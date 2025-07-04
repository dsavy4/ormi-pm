import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md', showText = true }) => {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-12 w-auto',
  };

  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Fallback logo component
  const FallbackLogo = () => (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2 shadow-lg">
        <Building2 className={cn('text-white', iconSizeClasses[size])} />
      </div>
      {showText && (
        <span className={cn('font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent', textSizeClasses[size])}>
          ORMI
        </span>
      )}
    </div>
  );

  // If image failed to load, show fallback
  if (imageError) {
    return <FallbackLogo />;
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        <img
          src={theme === 'dark' ? '/ormi_logo_dark.png' : '/ormi-logo.png'}
          alt="ORMI Property Management"
          className={cn(sizeClasses[size], 'object-contain transition-opacity duration-200', {
            'opacity-0': !imageLoaded,
            'opacity-100': imageLoaded,
          })}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg animate-pulse" />
        )}
      </div>
      {showText && (
        <span className={cn('font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent', textSizeClasses[size])}>
          ORMI
        </span>
      )}
    </div>
  );
};

export default Logo; 