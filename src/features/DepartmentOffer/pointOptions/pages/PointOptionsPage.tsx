import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiCog, HiCash, HiCalendar, HiUser, HiShoppingCart, HiShieldCheck } from 'react-icons/hi'
import { Button } from '@/components/shared'
import { useGetPointOptionQuery } from '../services/pointOptionsApi'
import PointOptionsFormModal from '../components/PointOptionsFormModal'

export default function PointOptionsPage() {
  const { t } = useTranslation()
  const { data: pointOption, isLoading, isError } = useGetPointOptionQuery()
  const [modalOpen, setModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--text-muted)]">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">{t('common.loading', 'Loading configuration...')}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('pointOption.loadError', 'Failed to load point option settings.')}</p>
      </div>
    )
  }

  const defaultOption = pointOption ?? {
    rate: 0,
    expireIn: 0,
    maxDeduct: 0,
    completeDataPoint: 0,
    rateOrderPoint: 0,
    rateAppointmentPoint: 0,
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('pointOption.pageTitle', 'Points & Rewards Configuration')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {t('pointOption.pageSubtitle', 'Manage points conversion rates, lifespans, and reward thresholds')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} leftIcon={<HiCog size={16} />}>
          {t('pointOption.editConfig', 'Edit Configuration')}
        </Button>
      </div>

      {/* Grid of settings cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Point Conversion Rules */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
              <HiCash size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-base text-[var(--text-primary)]">
                {t('pointOption.conversionRules', 'Exchange & Deduction')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('pointOption.conversionRulesDesc', 'Configure points monetary value and checkout settings')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {t('pointOption.rateLabel', 'Point Value Rate')}
              </span>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {defaultOption.rate}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">
                {t('pointOption.rateHelp', 'Cash equivalent per point')}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {t('pointOption.maxDeductLabel', 'Max Deduction Cap')}
              </span>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {defaultOption.maxDeduct}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">
                {t('pointOption.maxDeductHelp', 'Max points redeemable per order')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Validity & Lifespan */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-500">
              <HiCalendar size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-base text-[var(--text-primary)]">
                {t('pointOption.validityRules', 'Validity & Expiry')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('pointOption.validityRulesDesc', 'Manage point lifespans and deletion cycles')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)]">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {t('pointOption.expireLabel', 'Points Lifespan')}
                </span>
                <span className="text-xl font-bold text-[var(--text-primary)]">
                  {defaultOption.expireIn} {t('common.days', 'Days')}
                </span>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  {t('pointOption.expireHelp', 'Points expire automatically if unused for this duration')}
                </p>
              </div>
            
            </div>
          </div>
        </div>
      </div>

      {/* Reward rules card list */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
            <HiShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-base text-[var(--text-primary)]">
              {t('pointOption.earningRates', 'Earning Thresholds')}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {t('pointOption.earningRatesDesc', 'Establish points rewarded for user interactions and loyalty events')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rule 1: Profile Completeness */}
          <div className="flex gap-4 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
              <HiUser size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {t('pointOption.completeProfile', 'Profile Completion')}
              </span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {defaultOption.completeDataPoint}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">
                {t('pointOption.completeProfileHelp', 'Points rewarded for completing registration data')}
              </span>
            </div>
          </div>

          {/* Rule 2: Order spent multiplier */}
          <div className="flex gap-4 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-500 shrink-0">
              <HiShoppingCart size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {t('pointOption.spentOrder', 'E-commerce Purchase')}
              </span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {defaultOption.rateOrderPoint} {t('pointOption.points', 'Points')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">
                {t('pointOption.spentOrderHelp', 'Accrued points per spent currency on product orders')}
              </span>
            </div>
          </div>

          {/* Rule 3: Salon appointment multiplier */}
          <div className="flex gap-4 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 shrink-0">
              <HiShieldCheck size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {t('pointOption.spentAppointment', 'Salon Appointment')}
              </span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {defaultOption.rateAppointmentPoint} {t('pointOption.points', 'Points')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">
                {t('pointOption.spentAppointmentHelp', 'Accrued points per spent currency on salon bookings')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form modal */}
      <PointOptionsFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={defaultOption}
      />
    </div>
  )
}
