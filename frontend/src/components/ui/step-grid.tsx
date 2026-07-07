import * as React from "react"
import { cn } from "@/lib/utils"

interface StepGridProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  itemsPerRow?: number
  gap?: "default" | "sm" | "lg" | "xl"
  children: React.ReactNode
}

export function StepGrid({
  rows = 2,
  itemsPerRow = 3,
  gap = "default",
  children,
  className,
  ...props
}: StepGridProps) {
  // Split children into rows
  const childrenArray = React.Children.toArray(children);
  const rowsArray = Array(rows).fill(null).map((_, i) => 
    childrenArray.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  const gapStyles = {
    sm: { x: "gap-x-4", y: "space-y-10" },
    default: { x: "gap-x-6 md:gap-x-12", y: "space-y-16 md:space-y-20" },
    lg: { x: "gap-x-8 md:gap-x-16", y: "space-y-20 md:space-y-24" },
    xl: { x: "gap-x-10 md:gap-x-20", y: "space-y-24 md:space-y-32" }
  };

  return (
    <div className={cn("space-y-10 md:space-y-20", gapStyles[gap].y, className)} {...props}>
      {rowsArray.map((rowItems, rowIndex) => (
        <div 
          key={rowIndex} 
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
            gapStyles[gap].x,
            "gap-y-8 sm:gap-y-16"
          )}
        >
          {rowItems}
        </div>
      ))}
    </div>
  )
} 