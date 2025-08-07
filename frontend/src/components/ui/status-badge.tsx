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
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        occupied:
          "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-700/50 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm",
        vacant:
          "border-green-200 bg-green-100 text-green-800 dark:border-green-700/50 dark:bg-green-900/30 dark:text-green-300 shadow-sm",
        maintenance:
          "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-700/50 dark:bg-orange-900/30 dark:text-orange-300 shadow-sm",
        reserved:
          "border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-700/50 dark:bg-purple-900/30 dark:text-purple-300 shadow-sm",
        default:
          "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700/50 dark:bg-gray-800/30 dark:text-gray-300 shadow-sm",
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
      <span className="font-semibold">{config.label}</span>
    </div>
  )
}

export { StatusBadge, statusBadgeVariants, getStatusConfig } 