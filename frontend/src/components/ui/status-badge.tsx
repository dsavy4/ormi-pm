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
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        occupied:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-400",
        vacant:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400",
        maintenance:
          "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/30 dark:bg-orange-900/20 dark:text-orange-400",
        reserved:
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/30 dark:bg-purple-900/20 dark:text-purple-400",
        default:
          "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800/30 dark:bg-gray-900/20 dark:text-gray-400",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
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
        <IconComponent className="h-3 w-3 flex-shrink-0" />
      )}
      <span className="font-medium">{config.label}</span>
    </div>
  )
}

export { StatusBadge, statusBadgeVariants, getStatusConfig } 