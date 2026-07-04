import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { IconType } from 'react-icons'
import {
  HiCreditCard,
  HiPlusCircle,
  HiMinusCircle,
  HiChatAlt,
  HiCube,
  HiCash,
  HiUserAdd,
  HiFilm,
  HiGift,
  HiPhotograph,
  HiClock,
  HiRefresh,
} from 'react-icons/hi'
import { Input, Button, Toggle } from '@/components/shared'
import { useGetAppOptionQuery, useUpdateAppOptionMutation } from '../services/appOptionApi'
import { getApiError } from '@/services/apiHelpers'
import type { AppOption } from '../types'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  wallet: z.boolean(),
  addPoint: z.boolean(),
  deductPoint: z.boolean(),
  chat: z.boolean(),
  tryItem: z.boolean(),
  visa: z.boolean(),
  follow: z.boolean(),
  reels: z.boolean(),
  affiliateProgram: z.boolean(),
  startUpMedia: z.boolean(),
  qrCodeExpirationMinutes: z.coerce.number().min(0, 'Must be 0 or greater'),
})

type FormValues = z.infer<typeof schema>

const DEFAULTS: FormValues = {
  wallet: false,
  addPoint: false,
  deductPoint: false,
  chat: false,
  tryItem: false,
  visa: false,
  follow: false,
  reels: false,
  affiliateProgram: false,
  startUpMedia: false,
  qrCodeExpirationMinutes: 0,
}

// ── Row primitive ──────────────────────────────────────────────────────────────
interface ToggleRowProps {
  icon: IconType
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
  lang?: string
}

function ToggleRow({ icon: Icon, label, description, checked, onChange, lang }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 hover:bg-[var(--bg-hover)] transition-colors rounded-[var(--radius)]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          <p className="text-xs text-[var(--text-muted)] truncate">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} lang={lang} />
    </div>
  )
}

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
    <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-hover)]">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
    </div>
    <div className="divide-y divide-[var(--border)] p-1">{children}</div>
  </div>
)

export default function AppOptionPage() {
  const { t, i18n } = useTranslation()

  const { data, isLoading, isError } = useGetAppOptionQuery()
  const [updateAppOption, { isLoading: isSaving }] = useUpdateAppOptionMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: DEFAULTS,
  })

  // Prefill once the current settings load
  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await updateAppOption(values as AppOption).unwrap()
      toast.success(t('common.success'))
      reset(values) // clears isDirty against the newly saved values
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  const handleDiscard = () => {
    if (data) reset(data)
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('appOption.loadError', 'Failed to load app settings.')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('appOption.pageTitle', 'App Options')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('appOption.pageSubtitle', 'Control which features are enabled in the customer app')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="secondary" onClick={handleDiscard} disabled={isSaving} leftIcon={<HiRefresh size={14} />}>
              {t('common.discard', 'Discard')}
            </Button>
          )}
          <Button onClick={handleSubmit(onSubmit)} loading={isSaving} disabled={!isDirty}>
            {t('common.saveChanges', 'Save Changes')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--text-muted)]">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{t('common.loading', 'Loading...')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 ">
          {/* ── Payments & Loyalty ─────────────────────────────────────────── */}
          <SectionCard title={t('appOption.paymentsLoyalty', 'Payments & Loyalty')}>
            <Controller
              control={control}
              name="wallet"
              render={({ field }) => (
                <ToggleRow
                  icon={HiCreditCard}
                  label={t('appOption.wallet', 'Wallet')}
                  description={t('appOption.walletDesc', 'Allow customers to use the in-app wallet')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <Controller
              control={control}
              name="visa"
              render={({ field }) => (
                <ToggleRow
                  icon={HiCash}
                  label={t('appOption.visa', 'Card Payments')}
                  description={t('appOption.visaDesc', 'Allow paying by Visa / credit card')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <Controller
              control={control}
              name="addPoint"
              render={({ field }) => (
                <ToggleRow
                  icon={HiPlusCircle}
                  label={t('appOption.addPoint', 'Add Points')}
                  description={t('appOption.addPointDesc', 'Allow earning loyalty points')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <Controller
              control={control}
              name="deductPoint"
              render={({ field }) => (
                <ToggleRow
                  icon={HiMinusCircle}
                  label={t('appOption.deductPoint', 'Deduct Points')}
                  description={t('appOption.deductPointDesc', 'Allow redeeming/deducting loyalty points')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
          </SectionCard>

          {/* ── Social & Engagement ────────────────────────────────────────── */}
          <SectionCard title={t('appOption.socialEngagement', 'Social & Engagement')}>
            <Controller
              control={control}
              name="chat"
              render={({ field }) => (
                <ToggleRow
                  icon={HiChatAlt}
                  label={t('appOption.chat', 'Chat')}
                  description={t('appOption.chatDesc', 'Enable in-app chat between customers and salons')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <Controller
              control={control}
              name="follow"
              render={({ field }) => (
                <ToggleRow
                  icon={HiUserAdd}
                  label={t('appOption.follow', 'Follow')}
                  description={t('appOption.followDesc', 'Allow customers to follow salons')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <Controller
              control={control}
              name="reels"
              render={({ field }) => (
                <ToggleRow
                  icon={HiFilm}
                  label={t('appOption.reels', 'Reels')}
                  description={t('appOption.reelsDesc', 'Enable the reels/video feed feature')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <Controller
              control={control}
              name="tryItem"
              render={({ field }) => (
                <ToggleRow
                  icon={HiCube}
                  label={t('appOption.tryItem', 'Try Item')}
                  description={t('appOption.tryItemDesc', 'Enable the virtual try-on feature')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <Controller
              control={control}
              name="affiliateProgram"
              render={({ field }) => (
                <ToggleRow
                  icon={HiGift}
                  label={t('appOption.affiliateProgram', 'Affiliate Program')}
                  description={t('appOption.affiliateProgramDesc', 'Enable the affiliate/referral program')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
          </SectionCard>

          {/* ── App Experience & Security ──────────────────────────────────── */}
          <SectionCard title={t('appOption.experienceSecurity', 'App Experience & Security')}>
            <Controller
              control={control}
              name="startUpMedia"
              render={({ field }) => (
                <ToggleRow
                  icon={HiPhotograph}
                  label={t('appOption.startUpMedia', 'Startup Media')}
                  description={t('appOption.startUpMediaDesc', 'Show a splash image/video when the app launches')}
                  checked={field.value}
                  onChange={field.onChange}
                  lang={i18n.language}
                />
              )}
            />
            <div className="flex items-center justify-between gap-4 py-3 px-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                  <HiClock size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t('appOption.qrExpiration', 'QR Code Expiration')}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('appOption.qrExpirationDesc', 'How long a generated QR code stays valid, in minutes')}
                  </p>
                </div>
              </div>
              <Controller
                control={control}
                name="qrCodeExpirationMinutes"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    className="w-24 text-center"
                    error={errors.qrCodeExpirationMinutes?.message}
                  />
                )}
              />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}