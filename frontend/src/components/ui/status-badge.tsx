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
  "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        occupied:
          "border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/25 dark:border-emerald-400 dark:bg-emerald-400 dark:text-emerald-950 dark:shadow-emerald-400/25",
        vacant:
          "border-slate-500 bg-slate-500 text-white shadow-slate-500/25 dark:border-slate-400 dark:bg-slate-400 dark:text-slate-950 dark:shadow-slate-400/25",
        maintenance:
          "border-amber-500 bg-amber-500 text-white shadow-amber-500/25 dark:border-amber-400 dark:bg-amber-400 dark:text-amber-950 dark:shadow-amber-400/25",
        reserved:
          "border-indigo-500 bg-indigo-500 text-white shadow-indigo-500/25 dark:border-indigo-400 dark:bg-indigo-400 dark:text-indigo-950 dark:shadow-indigo-400/25",
        default:
          "border-gray-500 bg-gray-500 text-white shadow-gray-500/25 dark:border-gray-400 dark:bg-gray-400 dark:text-gray-950 dark:shadow-gray-400/25",
      },
      size: {
        sm: "px-2 py-1 text-xs border",
        md: "px-3 py-1.5 text-xs border-2",
        lg: "px-4 py-2 text-sm border-2",
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