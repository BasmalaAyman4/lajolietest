import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiEye } from 'react-icons/hi'
import { DataTable, type Column, StatusBadge } from '@/components/shared'
import type { AffiliateRequestItem } from '../types'
import { useGetAdminAffiliateRequestsQuery } from '../services/affiliateRequestApi'
import AffiliateRequestDetailModal from '../components/AffiliateRequestDetailModal'

export default function AffiliateRequestPage() {
  const { t } = useTranslation()

  const { data: requests = [], isLoading, isError } = useGetAdminAffiliateRequestsQuery()

  const [detailModal, setDetailModal] = useState<{ open: boolean; request?: AffiliateRequestItem }>({ open: false })

  const openDetails = (request: AffiliateRequestItem) => setDetailModal({ open: true, request })
  const closeDetails = () => setDetailModal({ open: false })

  const columns: Column<AffiliateRequestItem>[] = [
    {
      key: 'fullName',
      label: t('affiliateRequest.fullName', 'Full Name'),
      render: (row) => (
        <span className="font-medium text-sm text-[var(--text-primary)]">{row.fullName}</span>
      ),
    },
    {
      key: 'userMobile',
      label: t('affiliateRequest.mobile', 'Mobile'),
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.userMobile}</span>
      ),
    },
    {
      key: 'areaName',
      label: t('affiliateRequest.location', 'Location'),
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.areaName}, {row.cityName}, {row.countryName}
        </span>
      ),
    },
    {
      key: 'numberOfFollowers',
      label: t('affiliateRequest.followers', 'Followers'),
      render: (row) => (
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[var(--bg-hover)] border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)]">
          {row.numberOfFollowers ?? '—'}
        </span>
      ),
    },
    {
      key: 'haveAudienceOnInstagram',
      label: t('affiliateRequest.audience', 'Audience'),
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.haveAudienceOnWhatsApp && (
            <StatusBadge variant="success" label={t('affiliateRequest.whatsappShort', 'WhatsApp')} />
          )}
          {row.haveAudienceOnInstagram && (
            <StatusBadge variant="success" label={t('affiliateRequest.instagramShort', 'Instagram')} />
          )}
          {!row.haveAudienceOnWhatsApp && !row.haveAudienceOnInstagram && (
            <StatusBadge variant="success" label={t('common.none', 'None')} />
          )}
        </div>
      ),
    },
    {
      key: 'createdDate',
      label: t('affiliateRequest.submittedOn', 'Submitted On'),
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">{row.createdDate.split('T')[0]}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '60px',
      render: (row) => (
        <button
          type="button"
          title={t('affiliateRequest.viewDetails', 'View Details')}
          onClick={() => openDetails(row)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
        >
          <HiEye size={16} />
        </button>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--danger)]">{t('affiliateRequest.loadError', 'Failed to load affiliate requests.')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {t('affiliateRequest.pageTitle', 'Affiliate Requests')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {t('affiliateRequest.pageSubtitle', 'Review users who applied to become affiliates')}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable<AffiliateRequestItem>
        columns={columns}
        data={requests}
        rowKey="id"
        tableKey="adminAffiliateRequests"
        loading={isLoading}
        searchKeys={['fullName', 'userMobile']}
        searchPlaceholder={t('affiliateRequest.searchPlaceholder', 'Search by name or mobile...')}
        emptyMessage={t('affiliateRequest.empty', 'No affiliate requests found.')}
      />

      {/* Detail modal */}
      <AffiliateRequestDetailModal
        open={detailModal.open}
        onClose={closeDetails}
        request={detailModal.request}
      />
    </div>
  )
}