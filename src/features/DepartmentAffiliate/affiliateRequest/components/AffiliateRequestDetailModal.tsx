import { useTranslation } from 'react-i18next'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { Modal, Button, StatusBadge } from '@/components/shared'
import type { AffiliateRequestItem } from '../types'

interface AffiliateRequestDetailModalProps {
  open: boolean
  onClose: () => void
  request?: AffiliateRequestItem
}

/** Small labeled field for the read-only detail grid */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
    <span className="text-sm text-[var(--text-primary)]">{children}</span>
  </div>
)

const SocialLink = ({ label, url }: { label: string; url: string }) => {
  if (!url) return <Field label={label}>—</Field>
  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
  return (
    <Field label={label}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
      >
        {url}
        <HiOutlineExternalLink size={13} />
      </a>
    </Field>
  )
}

export default function AffiliateRequestDetailModal({ open, onClose, request }: AffiliateRequestDetailModalProps) {
  const { t } = useTranslation()

  if (!request) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('affiliateRequest.details', 'Affiliate Request Details')}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {t('common.close', 'Close')}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Applicant */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={t('affiliateRequest.fullName', 'Full Name')}>{request.fullName}</Field>
          <Field label={t('affiliateRequest.mobile', 'Account Mobile')}>{request.userMobile}</Field>
          <Field label={t('affiliateRequest.additionalMobile', 'Additional Mobile')}>
            {request.additionalMobileNumber || '—'}
          </Field>
        </div>

        {/* Location */}
        <div className="border-t border-[var(--border)] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={t('affiliateRequest.country', 'Country')}>{request.countryName}</Field>
          <Field label={t('affiliateRequest.city', 'City')}>{request.cityName}</Field>
          <Field label={t('affiliateRequest.area', 'Area')}>{request.areaName}</Field>
        </div>

        {/* Audience */}
        <div className="border-t border-[var(--border)] pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Field label={t('affiliateRequest.whatsapp', 'Audience on WhatsApp')}>
            <StatusBadge
              variant={request.haveAudienceOnWhatsApp ? 'success' : 'success'}
              label={request.haveAudienceOnWhatsApp ? t('common.yes', 'Yes') : t('common.no', 'No')}
            />
          </Field>
          <Field label={t('affiliateRequest.instagramAudience', 'Audience on Instagram')}>
            <StatusBadge
              variant={request.haveAudienceOnInstagram ? 'success' : 'success'}
              label={request.haveAudienceOnInstagram ? t('common.yes', 'Yes') : t('common.no', 'No')}
            />
          </Field>
          <Field label={t('affiliateRequest.soldBefore', 'Sold Online Before')}>
            <StatusBadge
              variant={request.haveYouSoldOnlineBefore ? 'success' : 'success'}
              label={request.haveYouSoldOnlineBefore ? t('common.yes', 'Yes') : t('common.no', 'No')}
            />
          </Field>
          <Field label={t('affiliateRequest.followers', 'No. of Followers')}>
            {request.numberOfFollowers ?? '—'}
          </Field>
        </div>

        {/* Social links */}
        <div className="border-t border-[var(--border)] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SocialLink label={t('affiliateRequest.instagram', 'Instagram')} url={request.instagramLink} />
          <SocialLink label={t('affiliateRequest.facebook', 'Facebook')} url={request.facebookLink} />
          <SocialLink label={t('affiliateRequest.tiktok', 'TikTok')} url={request.tikTokLink} />
        </div>

        {/* Motivation */}
        <div className="border-t border-[var(--border)] pt-4">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {t('affiliateRequest.whyJoin', 'Why do you want to join?')}
          </span>
          <p className="text-sm text-[var(--text-primary)] mt-1 whitespace-pre-wrap bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius)] p-3">
            {request.whyDoYouWantToJoin || '—'}
          </p>
        </div>

        {/* Meta */}
        <div className="border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">
          {t('affiliateRequest.submittedOn', 'Submitted on')}: {request.createdDate.split('T')[0]}
        </div>
      </div>
    </Modal>
  )
}