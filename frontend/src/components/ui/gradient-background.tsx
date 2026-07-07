import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientBackgroundVariants = cva(
  "absolute rounded-lg opacity-20 blur",
  {
    variants: {
      colorVariant: {
        blue: "bg-gradient-to-r from-blue-400 to-blue-600",
        purple: "bg-gradient-to-r from-purple-400 to-purple-600",
        emerald: "bg-gradient-to-r from-emerald-400 to-emerald-600",
        pink: "bg-gradient-to-r from-pink-400 to-pink-600",
        amber: "bg-gradient-to-r from-amber-400 to-amber-600",
        mixed: "bg-gradient-to-r from-blue-400 to-purple-600",
      },
      size: {
        default: "-inset-1",
        sm: "-inset-0.5",
        lg: "-inset-2",
        xl: "-inset-4",
      },
      intensity: {
        default: "opacity-20",
        low: "opacity-10",
        high: "opacity-30",
      },
      blur: {
        default: "blur",
        sm: "blur-sm",
        lg: "blur-lg",
        xl: "blur-xl",
      }
    },
    defaultVariants: {
      colorVariant: "blue",
      size: "default",
      intensity: "default",
      blur: "default",
    },
  }
)

export interface GradientBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gradientBackgroundVariants> {}

function GradientBackground({ 
  className, 
  colorVariant,
  size,
  intensity,
  blur,
  ...props 
}: GradientBackgroundProps) {
  return (
    <div 
      className={cn(gradientBackgroundVariants({ colorVariant, size, intensity, blur, className }))} 
      {...props} 
    />
  )
}

export { GradientBackground, gradientBackgroundVariants } 