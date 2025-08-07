import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  User, 
  Home, 
  Wrench, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-extrabold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm text-shadow-sm",
  {
    variants: {
      variant: {
        occupied:
          "border-blue-700 bg-blue-700 text-white dark:border-blue-600 dark:bg-blue-600 dark:text-white shadow-blue-700/30 dark:shadow-blue-600/30",
        vacant:
          "border-green-700 bg-green-700 text-white dark:border-green-600 dark:bg-green-600 dark:text-white shadow-green-700/30 dark:shadow-green-600/30",
        maintenance:
          "border-amber-700 bg-amber-700 text-white dark:border-amber-600 dark:bg-amber-600 dark:text-white shadow-amber-700/30 dark:shadow-amber-600/30",
        reserved:
          "border-purple-700 bg-purple-700 text-white dark:border-purple-600 dark:bg-purple-600 dark:text-white shadow-purple-700/30 dark:shadow-purple-600/30",
        default:
          "border-gray-700 bg-gray-700 text-white dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-gray-700/30 dark:shadow-gray-600/30",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: string
  showIcon?: boolean
}

const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase()
  
  switch (normalizedStatus) {
    case 'occupied':
      return {
        label: 'Occupied',
        icon: User,
        variant: 'occupied' as const,
        description: 'Unit is currently rented'
      }
    case 'vacant':
      return {
        label: 'Vacant',
        icon: Home,
        variant: 'vacant' as const,
        description: 'Unit is available for rent'
      }
    case 'maintenance':
      return {
        label: 'Maintenance',
        icon: Wrench,
        variant: 'maintenance' as const,
        description: 'Unit is under maintenance'
      }
    case 'reserved':
      return {
        label: 'Reserved',
        icon: Clock,
        variant: 'reserved' as const,
        description: 'Unit is reserved for future tenant'
      }
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        icon: AlertCircle,
        variant: 'default' as const,
        description: 'Unit status'
      }
  }
}

function StatusBadge({ 
  className, 
  variant, 
  size, 
  status, 
  showIcon = true,
  ...props 
}: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const IconComponent = config.icon

  return (
    <div 
      className={cn(
        statusBadgeVariants({ 
          variant: variant || config.variant, 
          size 
        }), 
        className
      )}
      title={config.description}
      {...props}
    >
      {showIcon && (
        <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      <span className="font-extrabold">{config.label}</span>
    </div>
  )
}

export { StatusBadge, statusBadgeVariants, getStatusConfig } 