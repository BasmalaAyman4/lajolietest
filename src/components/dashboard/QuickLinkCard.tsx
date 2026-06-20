import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import type { ReactNode } from 'react'

interface QuickLinkCardProps {
  title: string
  description: string
  icon: ReactNode
  href: string
}

export default function QuickLinkCard({
  title,
  description,
  icon,
  href,
}: QuickLinkCardProps) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)]
        bg-[var(--bg-card)] p-4 no-underline transition-all duration-200
        hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]/40 hover:shadow-sm"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)]
          bg-[var(--accent-soft)] text-[var(--accent)] transition-colors
          group-hover:bg-[var(--accent)] group-hover:text-white"
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="text-xs text-[var(--text-muted)] line-clamp-1">{description}</p>
      </div>

      <HiArrowRight
        size={16}
        className="shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
      />
    </Link>
  )
}
