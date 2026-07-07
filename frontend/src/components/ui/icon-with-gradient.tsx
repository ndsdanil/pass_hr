import * as React from "react"
import { cn } from "@/lib/utils"
import { GradientBackground } from "./gradient-background"

interface IconWithGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color?: string
  iconClassName?: string
}

export function IconWithGradient({ 
  icon: Icon, 
  color = "from-blue-400 to-blue-600", 
  className, 
  iconClassName,
  ...props 
}: IconWithGradientProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div className={`absolute -inset-1 rounded-lg bg-gradient-to-r ${color} opacity-20 blur`}></div>
      <div className="relative bg-white rounded-lg p-2">
        <Icon className={cn("h-6 w-6 text-blue-600", iconClassName)} aria-hidden="true" />
      </div>
    </div>
  )
}

// More flexible version using GradientBackground component
export function IconWithGradientAdv({ 
  icon: Icon, 
  color = "blue", 
  className, 
  iconClassName,
  ...props 
}: IconWithGradientProps & React.ComponentProps<typeof GradientBackground>) {
  return (
    <div className={cn("relative", className)} {...props}>
      <GradientBackground color={color as any} />
      <div className="relative bg-white rounded-lg p-2">
        <Icon className={cn("h-6 w-6 text-blue-600", iconClassName)} aria-hidden="true" />
      </div>
    </div>
  )
} 