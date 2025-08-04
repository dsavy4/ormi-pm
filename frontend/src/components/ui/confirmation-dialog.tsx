import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  icon?: React.ReactNode;
}

const variantConfig = {
  default: {
    icon: AlertCircle,
    titleClass: 'text-gray-900 dark:text-white',
    descriptionClass: 'text-gray-600 dark:text-gray-300',
    iconClass: 'text-gray-600 dark:text-gray-400',
    confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  destructive: {
    icon: AlertTriangle,
    titleClass: 'text-red-900 dark:text-red-100',
    descriptionClass: 'text-red-700 dark:text-red-300',
    iconClass: 'text-red-600 dark:text-red-400',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    titleClass: 'text-amber-900 dark:text-amber-100',
    descriptionClass: 'text-amber-700 dark:text-amber-300',
    iconClass: 'text-amber-600 dark:text-amber-400',
    confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  success: {
    icon: CheckCircle,
    titleClass: 'text-green-900 dark:text-green-100',
    descriptionClass: 'text-green-700 dark:text-green-300',
    iconClass: 'text-green-600 dark:text-green-400',
    confirmButtonClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
  info: {
    icon: Info,
    titleClass: 'text-blue-900 dark:text-blue-100',
    descriptionClass: 'text-blue-700 dark:text-blue-300',
    iconClass: 'text-blue-600 dark:text-blue-400',
    confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
              {icon || <IconComponent className={`h-6 w-6 ${config.iconClass}`} />}
            </div>
            <div className="flex-1">
              <DialogTitle className={config.titleClass}>
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className={config.descriptionClass}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${config.confirmButtonClass}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 