import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'full';
  showTagline?: boolean;
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4',
    sparkle: 'w-3 h-3 -top-0.5 -right-0.5',
    text: 'text-lg',
    tagline: 'text-xs'
  },
  md: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    sparkle: 'w-4 h-4 -top-1 -right-1',
    text: 'text-xl',
    tagline: 'text-sm'
  },
  lg: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    sparkle: 'w-6 h-6 -top-1 -right-1',
    text: 'text-3xl',
    tagline: 'text-base'
  },
  xl: {
    container: 'w-20 h-20',
    icon: 'w-10 h-10',
    sparkle: 'w-7 h-7 -top-1.5 -right-1.5',
    text: 'text-4xl',
    tagline: 'text-lg'
  }
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  showTagline = false,
  className,
  animated = true
}) => {
  const sizes = sizeClasses[size];

  const LogoIcon = ({ className: iconClassName }: { className?: string }) => (
    <div className={cn("relative", iconClassName)}>
      <div className={cn(
        "bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg",
        sizes.container
      )}>
        <Building2 className={cn("text-white", sizes.icon)} />
      </div>
      
      {animated && (
        <motion.div
          className={cn(
            "absolute w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center",
            sizes.sparkle
          )}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className={cn("text-white", sizes.sparkle.includes('w-3') ? 'w-2 h-2' : 'w-3 h-3')} />
        </motion.div>
      )}
      
      {!animated && (
        <div className={cn(
          "absolute w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center",
          sizes.sparkle
        )}>
          <Sparkles className={cn("text-white", sizes.sparkle.includes('w-3') ? 'w-2 h-2' : 'w-3 h-3')} />
        </div>
      )}
    </div>
  );

  const LogoText = ({ className: textClassName }: { className?: string }) => (
    <div className={cn("flex flex-col", textClassName)}>
      <h1 className={cn(
        "font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
        sizes.text
      )}>
        ORMI
      </h1>
      
      {showTagline && (
        <div className="space-y-1">
          <p className={cn(
            "font-semibold text-gray-700 dark:text-gray-300",
            sizes.tagline
          )}>
            Optimal Rental Management Intelligence
          </p>
          <p className={cn(
            "text-gray-500 dark:text-gray-400",
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}>
            Next-generation property management
          </p>
        </div>
      )}
    </div>
  );

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center", className)}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <LogoIcon />
        <LogoText />
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <LogoIcon className="mb-3" />
      <LogoText />
    </div>
  );
};

export default Logo; 