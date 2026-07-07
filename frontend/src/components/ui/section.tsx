import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  description?: React.ReactNode
  centered?: boolean
  className?: string
  variant?: "default" | "primary" | "secondary" | "gradient"
}

export function Section({
  title,
  description,
  centered = false,
  className,
  variant = "default",
  children,
  ...props
}: SectionProps) {
  const variants = {
    default: "bg-white py-12 sm:py-16",
    primary: "bg-primary text-primary-foreground py-12 sm:py-16",
    secondary: "bg-secondary py-12 sm:py-16",
    gradient: "bg-gradient-to-r from-blue-50 to-purple-50 py-12 sm:py-16"
  }

  return (
    <section className={cn(variants[variant], className)} {...props}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || description) && (
          <div className={cn(
            "mx-auto max-w-2xl mb-12",
            centered && "text-center"
          )}>
            {title && typeof title === 'string' ? (
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {title}
              </h2>
            ) : title}
            
            {description && typeof description === 'string' ? (
              <p className="mt-4 text-lg text-gray-600">
                {description}
              </p>
            ) : description}
          </div>
        )}
        
        {children}
      </div>
    </section>
  )
}

export function SectionTitle({ 
  className, 
  children, 
  gradient = true,
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }) {
  return (
    <h2 
      className={cn(
        "text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl", 
        gradient && "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
        className
      )} 
      {...props}
    >
      {children}
    </h2>
  )
}

export function SectionDescription({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn("mt-4 text-lg text-gray-600", className)} 
      {...props}
    >
      {children}
    </p>
  )
} 