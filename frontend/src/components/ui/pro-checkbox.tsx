import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const ProCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    size?: "sm" | "md" | "lg"
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }
  
  const checkClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-4 w-4",
    lg: "h-4 w-4"
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded-md border-2 border-muted-foreground/20 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-primary/30 hover:shadow-md",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
        "data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/25",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current opacity-0 data-[state=checked]:opacity-100 transition-opacity duration-200")}
      >
        <Check className={cn("stroke-[3]", checkClasses[size])} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
ProCheckbox.displayName = CheckboxPrimitive.Root.displayName

export { ProCheckbox } 