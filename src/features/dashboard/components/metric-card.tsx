import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  loading?: boolean
  error?: boolean
  className?: string
  valueClassName?: string
  children?: ReactNode
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  loading = false,
  error = false,
  className,
  valueClassName,
  children
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            {description && <Skeleton className="h-4 w-32" />}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('overflow-hidden border-destructive/20', className)}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-sm">Ошибка загрузки данных</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden group hover:shadow-md transition-all duration-200', className)}>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">{title}</CardTitle>
        {icon && <div className="text-muted-foreground group-hover:text-primary/80 transition-colors">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
          {description && <p className="text-muted-foreground text-xs">{description}</p>}
          {trend && (
            <div className={cn(
              "text-xs font-medium flex items-center gap-1 mt-1",
              trend.positive !== false ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend.positive !== false ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
              )}
              <span>{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
      {children}
    </Card>
  )
}
