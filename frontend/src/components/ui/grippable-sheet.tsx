import * as React from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface GrippableSheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetContent> {
  showGrip?: boolean
  side?: "left" | "right" | "top" | "bottom"
}

const GrippableSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  GrippableSheetContentProps
>(({ className, children, showGrip = true, side = "right", ...props }, ref) => (
  <SheetContent
    ref={ref}
    side={side}
    className={cn(
      "relative",
      // Enhanced drawer sizes - wider and more responsive
      side === "right" && "w-3/4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl",
      side === "left" && "w-3/4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl",
      className
    )}
    {...props}
  >
    {/* Grip Handle */}
    {showGrip && (
      <div 
        className={cn(
          "absolute top-0 w-2 h-full flex items-center justify-center bg-border/50 hover:bg-primary/20 transition-colors cursor-col-resize group",
          side === "right" && "-left-2",
          side === "left" && "-right-2"
        )}
      >
        <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    )}
    
    {/* Content without extra wrapper to prevent layout issues */}
    {children}
  </SheetContent>
))
GrippableSheetContent.displayName = "GrippableSheetContent"

// Enhanced Sheet Header with better styling
const GrippableSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <SheetHeader
    className={cn(
      "px-6 py-4 border-b bg-muted/30 backdrop-blur-sm",
      className
    )}
    {...props}
  />
)
GrippableSheetHeader.displayName = "GrippableSheetHeader"

// Enhanced Sheet Footer
const GrippableSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4 border-t bg-muted/30 backdrop-blur-sm mt-auto",
      className
    )}
    {...props}
  />
)
GrippableSheetFooter.displayName = "GrippableSheetFooter"

export {
  Sheet as GrippableSheet,
  GrippableSheetContent,
  GrippableSheetHeader,
  GrippableSheetFooter,
  SheetTrigger as GrippableSheetTrigger,
  SheetTitle as GrippableSheetTitle,
  SheetDescription as GrippableSheetDescription,
} 