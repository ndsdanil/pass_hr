import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const numberBadgeVariants = cva(
  "absolute flex items-center justify-center rounded-full border font-semibold shadow-sm z-10",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-300 text-gray-700",
        primary: "bg-primary text-primary-foreground",
        blue: "bg-blue-50 border-blue-200 text-blue-600",
        green: "bg-green-50 border-green-200 text-green-600",
        emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
      },
      size: {
        default: "w-10 h-10 text-sm",
        sm: "w-8 h-8 text-xs",
        lg: "w-12 h-12 text-base",
      },
      position: {
        top: "-top-6",
        "top-large": "-top-10", 
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "top",
    },
  }
)

export interface NumberBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof numberBadgeVariants> {
  number: number
}

function NumberBadge({ 
  className, 
  variant, 
  size, 
  position,
  number,
  ...props 
}: NumberBadgeProps) {
  return (
    <div 
      className={cn(numberBadgeVariants({ variant, size, position, className }))} 
      {...props}
    >
      {number}
    </div>
  )
}

export { NumberBadge, numberBadgeVariants } 