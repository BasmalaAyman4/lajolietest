import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  loading?: boolean
}

export default function ChartCard({
  title,
  subtitle,
  children,
  className,
  loading,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className,
      )}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>

      {loading ? (
        <div className="flex h-[220px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded-[var(--radius)] bg-[var(--bg-hover)]" />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
