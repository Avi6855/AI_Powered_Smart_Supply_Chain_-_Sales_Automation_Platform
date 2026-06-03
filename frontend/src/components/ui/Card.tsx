import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
  delay?: number
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animate: _animate, delay: _delay, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow-sm glass-panel", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {title || subtitle || action ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <h3 className="font-semibold leading-none tracking-tight">{title}</h3> : null}
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
