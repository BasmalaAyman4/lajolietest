// ─── ContactUsPage ────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
  FaLinkedinIn,
} from 'react-icons/fa6'
import { HiPencil, HiCheck, HiX, HiInformationCircle } from 'react-icons/hi'

import { Button, Input } from '@/components/shared'
import { useGetContactUsQuery, useUpdateContactUsMutation } from '../services/contactUsApi'
import type { ContactUs } from '../types'
import { getApiError } from '@/services/apiHelpers'

// ─── Validation Schema ───────────────────────────────────────────────────────
const schema = z.object({
  callTelNo: z.string().trim().min(1, 'Phone number is required'),
  email: z.string().trim().email('Invalid email address').min(1, 'Email is required'),
  facebook: z.string().trim().url('Invalid URL format (e.g. https://...)').or(z.literal('')),
  instagram: z.string().trim().url('Invalid URL format (e.g. https://...)').or(z.literal('')),
  telegram: z.string().trim().url('Invalid URL format (e.g. https://...)').or(z.literal('')),
  whatsApp: z.string().trim().url('Invalid URL format (e.g. https://...)').or(z.literal('')),
  twitterX: z.string().trim().url('Invalid URL format (e.g. https://...)').or(z.literal('')),
  linkedId: z.string().trim().url('Invalid URL format (e.g. https://...)').or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function ContactUsPage() {
  const { t } = useTranslation()
  const [isEditMode, setIsEditMode] = useState(false)

  // ─── Queries & Mutations ───────────────────────────────────────────────────
  const { data: contactData, isLoading, isError, refetch } = useGetContactUsQuery()
  const [updateContactUs, { isLoading: isSaving }] = useUpdateContactUsMutation()

  // ─── Form Setup ────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      callTelNo: '',
      email: '',
      facebook: '',
      instagram: '',
      telegram: '',
      whatsApp: '',
      twitterX: '',
      linkedId: '',
    },
  })

  // Synchronize form values when API data loads
  useEffect(() => {
    if (contactData) {
      reset({
        callTelNo: contactData.callTelNo || '',
        email: contactData.email || '',
        facebook: contactData.facebook || '',
        instagram: contactData.instagram || '',
        telegram: contactData.telegram || '',
        whatsApp: contactData.whatsApp || '',
        twitterX: contactData.twitterX || '',
        linkedId: contactData.linkedId || '',
      })
    }
  }, [contactData, reset])

  // ─── Form Submission ───────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    try {
      await updateContactUs(values).unwrap()
      toast.success(t('contactUs.saveSuccess', 'Contact details updated successfully'))
      setIsEditMode(false)
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  // Cancel form edits and restore previous values
  const handleCancel = () => {
    if (contactData) {
      reset({
        callTelNo: contactData.callTelNo || '',
        email: contactData.email || '',
        facebook: contactData.facebook || '',
        instagram: contactData.instagram || '',
        telegram: contactData.telegram || '',
        whatsApp: contactData.whatsApp || '',
        twitterX: contactData.twitterX || '',
        linkedId: contactData.linkedId || '',
      })
    }
    setIsEditMode(false)
  }

  // ─── Cards Styling Metadata ────────────────────────────────────────────────
  const channels = [
    {
      key: 'callTelNo',
      label: t('contactUs.phone', 'Phone Number'),
      value: contactData?.callTelNo,
      icon: <FaPhone className="w-5 h-5" />,
      colorClass: 'bg-red-500/10 text-red-500 border-red-500/20',
      description: 'Primary customer support phone line',
    },
    {
      key: 'email',
      label: t('contactUs.email', 'Email Address'),
      value: contactData?.email,
      icon: <FaEnvelope className="w-5 h-5" />,
      colorClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      description: 'Support inbox and business inquiries',
    },
    {
      key: 'whatsApp',
      label: t('contactUs.whatsApp', 'WhatsApp'),
      value: contactData?.whatsApp,
      icon: <FaWhatsapp className="w-5.5 h-5.5" />,
      colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      description: 'Instant chat support link or number',
    },
    {
      key: 'facebook',
      label: t('contactUs.facebook', 'Facebook'),
      value: contactData?.facebook,
      icon: <FaFacebookF className="w-5 h-5" />,
      colorClass: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      description: 'Official Facebook profile or page',
    },
    {
      key: 'instagram',
      label: t('contactUs.instagram', 'Instagram'),
      value: contactData?.instagram,
      icon: <FaInstagram className="w-5 h-5" />,
      colorClass: 'bg-pink-600/10 text-pink-600 border-pink-600/20',
      description: 'Official Instagram brand handle link',
    },
    {
      key: 'telegram',
      label: t('contactUs.telegram', 'Telegram'),
      value: contactData?.telegram,
      icon: <FaTelegram className="w-5 h-5" />,
      colorClass: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      description: 'Community channel or support username',
    },
    {
      key: 'twitterX',
      label: t('contactUs.twitter', 'Twitter (X)'),
      value: contactData?.twitterX,
      icon: <FaXTwitter className="w-5 h-5" />,
      colorClass: 'bg-neutral-900/10 text-neutral-900 border-neutral-900/20 dark:text-neutral-200 dark:bg-neutral-800/20',
      description: 'Social updates and direct messages feed',
    },
    {
      key: 'linkedId',
      label: t('contactUs.linkedin', 'LinkedIn'),
      value: contactData?.linkedId,
      icon: <FaLinkedinIn className="w-5 h-5" />,
      colorClass: 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20',
      description: 'Professional networking brand page',
    },
  ]

  // ─── Loading Skeletons ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-[var(--bg-hover)] rounded animate-pulse" />
            <div className="h-4 w-72 bg-[var(--bg-hover)] rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-[var(--bg-hover)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] flex flex-col gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)]" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-4 w-20 bg-[var(--bg-hover)] rounded" />
                  <div className="h-3 w-12 bg-[var(--bg-hover)] rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-[var(--bg-hover)] rounded" />
              <div className="h-3 w-5/6 bg-[var(--bg-hover)] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Error Layout ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 animate-fade-in bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
          <HiInformationCircle className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {t('common.error', 'Something went wrong')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Failed to retrieve Contact Us configuration. Please try again.
          </p>
        </div>
        <Button onClick={refetch} variant="secondary">
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {t('contactUs.title', 'Contact Us Details')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {t('contactUs.description', 'Configure the contact channels shown in the user mobile app.')}
          </p>
        </div>

        {!isEditMode && (
          <Button
            onClick={() => setIsEditMode(true)}
            leftIcon={<HiPencil className="w-4 h-4" />}
            className="shadow-sm transition-transform active:scale-[0.98]"
          >
            {t('contactUs.editDetails', 'Edit Contact Details')}
          </Button>
        )}
      </div>

      {/* ─── View Mode: Interactive Brand Grid ──────────────────────────────── */}
      {!isEditMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {channels.map((channel) => {
            const hasValue = Boolean(channel.value)
            return (
              <div
                key={channel.key}
                className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-md transition-all duration-200 flex flex-col gap-3 group relative overflow-hidden"
              >
                {/* Visual side-indicator element */}
                <div className="absolute top-0 bottom-0 left-0 w-1 transition-transform origin-left scale-y-0 group-hover:scale-y-100 bg-[var(--accent)]" />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${channel.colorClass}`}
                    >
                      {channel.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                        {channel.label}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border mt-0.5 ${
                          hasValue
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700'
                        }`}
                      >
                        {hasValue ? t('contactUs.active', 'Active') : t('contactUs.notConfigured', 'Not Configured')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex-1">
                  <p
                    className={`text-sm select-all break-all ${
                      hasValue
                        ? 'text-[var(--text-secondary)] font-medium font-mono'
                        : 'text-[var(--text-muted)] italic'
                    }`}
                  >
                    {channel.value || '—'}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    {channel.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ─── Edit Mode: High-Fidelity Form Layout ─────────────────────────── */
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 md:p-8 flex flex-col gap-6 shadow-sm animate-slide-in"
        >
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t('contactUs.editDetails', 'Edit Contact Details')}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Updates will instantly synchronize to the mobile applications. Please verify all profile URLs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Contacts */}
            <div className="flex flex-col gap-5 bg-neutral-50 dark:bg-neutral-900/30 p-5 rounded-xl border border-[var(--border)]/50">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                Primary Support Lines
              </h3>

              <Input
                {...register('callTelNo')}
                label={t('contactUs.phone', 'Phone Number')}
                placeholder="e.g. +966 500 000 000"
                error={errors.callTelNo?.message}
                leftIcon={<FaPhone className="w-4 h-4 text-red-500" />}
                required
              />

              <Input
                {...register('email')}
                label={t('contactUs.email', 'Email Address')}
                placeholder="e.g. support@lajolie.com"
                error={errors.email?.message}
                leftIcon={<FaEnvelope className="w-4 h-4 text-orange-500" />}
                required
              />

              <Input
                {...register('whatsApp')}
                label={t('contactUs.whatsApp', 'WhatsApp')}
                placeholder="e.g. +966500000000 or chat link"
                error={errors.whatsApp?.message}
                leftIcon={<FaWhatsapp className="w-4.5 h-4.5 text-emerald-500" />}
                required
              />
            </div>

            {/* Social Media Profile URLs */}
            <div className="flex flex-col gap-5 bg-neutral-50 dark:bg-neutral-900/30 p-5 rounded-xl border border-[var(--border)]/50">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Social Presence & Feeds
              </h3>

              <Input
                {...register('facebook')}
                label={t('contactUs.facebook', 'Facebook Link')}
                placeholder="https://facebook.com/yourpage"
                error={errors.facebook?.message}
                leftIcon={<FaFacebookF className="w-4 h-4 text-blue-600" />}
              />

              <Input
                {...register('instagram')}
                label={t('contactUs.instagram', 'Instagram Link')}
                placeholder="https://instagram.com/yourbrand"
                error={errors.instagram?.message}
                leftIcon={<FaInstagram className="w-4 h-4 text-pink-600" />}
              />

              <Input
                {...register('telegram')}
                label={t('contactUs.telegram', 'Telegram Link')}
                placeholder="https://t.me/yourchannel"
                error={errors.telegram?.message}
                leftIcon={<FaTelegram className="w-4 h-4 text-sky-500" />}
              />

              <Input
                {...register('twitterX')}
                label={t('contactUs.twitter', 'Twitter (X) Link')}
                placeholder="https://x.com/yourhandle"
                error={errors.twitterX?.message}
                leftIcon={<FaXTwitter className="w-4 h-4 text-neutral-900 dark:text-neutral-200" />}
              />

              <Input
                {...register('linkedId')}
                label={t('contactUs.linkedin', 'LinkedIn Link')}
                placeholder="https://linkedin.com/company/yourbrand"
                error={errors.linkedId?.message}
                leftIcon={<FaLinkedinIn className="w-4 h-4 text-indigo-600" />}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-5 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSaving}
              leftIcon={<HiX className="w-4 h-4" />}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSaving}
              leftIcon={<HiCheck className="w-4 h-4" />}
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
