import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "./card"
import { NumberBadge } from "./number-badge"
import { IconWithGradient } from "./icon-with-gradient"

interface StepProps {
  name: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color?: string
  index: number
  variant?: "blue" | "emerald" | "default"
  className?: string
}

export function StepCard({ 
  name, 
  description, 
  icon, 
  color, 
  index, 
  variant = "default",
  className 
}: StepProps) {
  const variantStyles = {
    default: {
      iconColor: "text-blue-600",
      badgeVariant: "default" as const,
    },
    blue: {
      iconColor: "text-blue-600",
      badgeVariant: "blue" as const,
    },
    emerald: {
      iconColor: "text-emerald-600",
      badgeVariant: "emerald" as const,
    }
  }

  const styles = variantStyles[variant]
  
  return (
    <motion.div
      className={cn("relative flex flex-col items-center pt-6 sm:pt-8 mt-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <NumberBadge 
        number={index + 1} 
        position="top-large" 
        size="lg" 
        variant={styles.badgeVariant}
      />

      <Card 
        className="flex h-[130px] sm:h-[150px] w-full flex-col p-4 sm:p-6" 
        hover="lift"
      >
        <div className="flex items-center gap-x-3 sm:gap-x-4">
          <IconWithGradient 
            icon={icon} 
            color={color} 
            iconClassName={cn(styles.iconColor, "h-5 w-5 sm:h-6 sm:w-6")}
          />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{name}</h3>
        </div>
        <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600 line-clamp-3">{description}</p>
      </Card>
    </motion.div>
  )
} 