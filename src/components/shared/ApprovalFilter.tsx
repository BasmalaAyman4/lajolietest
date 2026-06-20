import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { HiCheckCircle, HiClock, HiX } from 'react-icons/hi'
import type { FilterValue } from '@/hooks/useStatusFilter'

interface Props {
  value: FilterValue
  onChange: (v: FilterValue) => void
  /** Override labels if you use this for a non-approval boolean */
  labels?: { all?: string; approved?: string; pending?: string }
}

const FILTERS: { value: FilterValue; icon: React.ReactNode; color: string }[] = [
  {
    value: '',
    icon: null,
    color:
      'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
  },
  {
    value: 'true',
    icon: <HiCheckCircle size={13} />,
    color:
      'border-green-200 text-green-700 bg-green-50 hover:bg-green-100',
  },
  {
    value: 'false',
    icon: <HiClock size={13} />,
    color:
      'border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100',
  },
]

export default function ApprovalFilter({ value, onChange, labels }: Props) {
  const { t } = useTranslation()

  const labelMap = {
    '': labels?.all ?? t('common.all', 'All'),
    true: labels?.approved ?? t('common.approved', 'Approved'),
    false: labels?.pending ?? t('common.pending', 'Pending'),
  }

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
      {FILTERS.map((f) => {
        const isActive = value === f.value
        return (
          <button
            key={String(f.value)}
            onClick={() => onChange(f.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[calc(var(--radius)-2px)]',
              'text-xs font-medium border transition-all duration-150',
              isActive
                ? cn(f.color, 'shadow-sm')
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
            )}
          >
            {f.icon}
            {labelMap[String(f.value) as 'true' | 'false' | '']}
          </button>
        )
      })}
    </div>
  )
}