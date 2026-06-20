import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

type Accent = 'accent' | 'success' | 'warning' | 'info' | 'danger'

const ACCENT_STYLES: Record<Accent, { icon: string; ring: string }> = {
  accent: {
    icon: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    ring: 'group-hover:ring-[var(--accent)]/20',
  },
  success: {
    icon: 'bg-[var(--success)]/10 text-[var(--success)]',
    ring: 'group-hover:ring-[var(--success)]/20',
  },
  warning: {
    icon: 'bg-[var(--warning)]/10 text-[var(--warning)]',
    ring: 'group-hover:ring-[var(--warning)]/20',
  },
  info: {
    icon: 'bg-[var(--info)]/10 text-[var(--info)]',
    ring: 'group-hover:ring-[var(--info)]/20',
  },
  danger: {
    icon: 'bg-[var(--danger)]/10 text-[var(--danger)]',
    ring: 'group-hover:ring-[var(--danger)]/20',
  },
}

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  accent?: Accent
  href?: string
  hint?: string
  loading?: boolean
}

export default function StatCard({
  label,
  value,
  icon,
  accent = 'accent',
  href,
  hint,
  loading,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent]

  const content = (
    <div
      className={cn(
        'group relative flex items-start gap-4 rounded-[var(--radius-lg)]',
        'border border-[var(--border)] bg-[var(--bg-card)] p-5',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)]',
        'transition-all duration-200 ring-1 ring-transparent',
        href && 'hover:border-[var(--accent)]/30 hover:shadow-md cursor-pointer',
        href && styles.ring,
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)]',
          styles.icon,
        )}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          {label}
        </p>
        {loading ? (
          <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-[var(--bg-hover)]" />
        ) : (
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {value}
          </p>
        )}
        {hint && !loading && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}
