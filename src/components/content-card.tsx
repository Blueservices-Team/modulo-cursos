import { cn } from "@/lib/utils"

interface ContentCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function ContentCard({ title, description, children, className, actions }: ContentCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border shadow-sm overflow-hidden", className)}>
      {/* Blue top line */}
      <div className="h-1 bg-primary" />

      {(title || actions) && (
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            {title && <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="px-6 pb-6 pt-2">
        {children}
      </div>
    </div>
  )
}
