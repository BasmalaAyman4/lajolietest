import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { HiCalendar, HiOfficeBuilding } from 'react-icons/hi'
import { DataTable, type Column } from '@/components/shared'
import type { SalonScheduleSalon } from '../types'
import { useGetSalonSchedulesSalonsQuery } from '../services/salonScheduleApi'

export default function SalonSchedulePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: salons = [], isLoading, isError } = useGetSalonSchedulesSalonsQuery()

  const columns: Column<SalonScheduleSalon>[] = [
    {
      key: 'salonName',
      label: t('salon.name', 'Salon Name'),
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.logoUrl ? (
            <img 
              src={row.logoUrl} 
              alt={row.salonName} 
              className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border)]">
              <HiOfficeBuilding size={20} />
            </div>
          )}
          <div>
            <div className="font-medium text-[var(--text-primary)]">{row.salonName}</div>
            <div className="text-xs text-[var(--text-muted)]">{row.telephone}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'branchCountWithSchedules',
      label: t('schedule.branches', 'Branches'),
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--surface-raised)] text-[var(--text-secondary)]">
          <HiOfficeBuilding size={14} />
          {row.branchCountWithSchedules}
        </span>
      ),
    },
    {
      key: 'scheduleCount',
      label: t('schedule.schedules', 'Schedules'),
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
          <HiCalendar size={14} />
          {row.scheduleCount}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '100px',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/salon-schedule/${row.salonId}`)}
          className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--accent-soft)]"
        >
          {t('common.viewDetails', 'View Details')}
        </button>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('common.errorLoading', 'Failed to load data.')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('schedule.title', 'Salon Schedules')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('schedule.salonsDescription', 'Select a salon to manage its schedules')}
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <DataTable<SalonScheduleSalon>
          columns={columns}
          data={salons}
          rowKey="salonId"
          tableKey='salonschedule_admin'
          loading={isLoading}
          searchKeys={['salonName', 'telephone']}
          searchPlaceholder={t('schedule.searchSalonPlaceholder', 'Search by salon name or phone...')}
          emptyMessage={t('schedule.noSalons', 'No salons found.')}
        />
      </div>
    </div>
  )
}