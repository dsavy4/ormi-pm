import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

const ResizableSheet = SheetPrimitive.Root
const ResizableSheetTrigger = SheetPrimitive.Trigger
const ResizableSheetClose = SheetPrimitive.Close
const ResizableSheetPortal = SheetPrimitive.Portal

const ResizableSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
ResizableSheetOverlay.displayName = SheetPrimitive.Overlay.displayName

interface ResizableSheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: "left" | "right"
  defaultSize?: number
  minSize?: number
  maxSize?: number
}

const ResizableSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  ResizableSheetContentProps
>(({ side = "right", defaultSize = 40, minSize = 20, maxSize = 80, className, children, ...props }, ref) => (
  <ResizableSheetPortal>
    <ResizableSheetOverlay />
    <div className="fixed inset-0 z-50 pointer-events-none">
      <ResizablePanelGroup direction="horizontal" className="pointer-events-auto">
        {side === "left" ? (
          <>
            <ResizablePanel defaultSize={defaultSize} minSize={minSize} maxSize={maxSize}>
              <SheetPrimitive.Content
                ref={ref}
                className={cn(
                  "h-full bg-background border-r shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                  className
                )}
                {...props}
              >
                {children}
              </SheetPrimitive.Content>
            </ResizablePanel>
            <ResizableHandle className="w-2 bg-border hover:bg-primary/20 transition-colors">
              <div className="flex h-full items-center justify-center">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </ResizableHandle>
            <ResizablePanel defaultSize={100 - defaultSize} minSize={100 - maxSize} maxSize={100 - minSize}>
              <div className="h-full pointer-events-none" />
            </ResizablePanel>
          </>
        ) : (
          <>
            <ResizablePanel defaultSize={100 - defaultSize} minSize={100 - maxSize} maxSize={100 - minSize}>
              <div className="h-full pointer-events-none" />
            </ResizablePanel>
            <ResizableHandle className="w-2 bg-border hover:bg-primary/20 transition-colors">
              <div className="flex h-full items-center justify-center">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </ResizableHandle>
            <ResizablePanel defaultSize={defaultSize} minSize={minSize} maxSize={maxSize}>
              <SheetPrimitive.Content
                ref={ref}
                className={cn(
                  "h-full bg-background border-l shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                  className
                )}
                {...props}
              >
                {children}
              </SheetPrimitive.Content>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  </ResizableSheetPortal>
))
ResizableSheetContent.displayName = SheetPrimitive.Content.displayName

const ResizableSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left px-6 py-4 border-b bg-muted/50",
      className
    )}
    {...props}
  />
)
ResizableSheetHeader.displayName = "ResizableSheetHeader"

const ResizableSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4 border-t bg-muted/50 mt-auto",
      className
    )}
    {...props}
  />
)
ResizableSheetFooter.displayName = "ResizableSheetFooter"

const ResizableSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
ResizableSheetTitle.displayName = SheetPrimitive.Title.displayName

const ResizableSheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ResizableSheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  ResizableSheet,
  ResizableSheetPortal,
  ResizableSheetOverlay,
  ResizableSheetTrigger,
  ResizableSheetClose,
  ResizableSheetContent,
  ResizableSheetHeader,
  ResizableSheetFooter,
  ResizableSheetTitle,
  ResizableSheetDescription,
} 