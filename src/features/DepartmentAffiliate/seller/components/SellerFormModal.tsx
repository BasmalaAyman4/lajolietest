import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HiSearch, HiCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi'
import { Modal, Input, Button, StatusBadge } from '@/components/shared'
import { useLazyGetUserByMobileQuery, useSetSellerMutation } from '../services/sellerApi'
import { getApiError } from '@/services/apiHelpers'

interface SellerFormModalProps {
  open: boolean
  onClose: () => void
}

export default function SellerFormModal({ open, onClose }: SellerFormModalProps) {
  const { t } = useTranslation()

  const [mobile, setMobile] = useState('')
  const [searchAttempted, setSearchAttempted] = useState(false)

  const [triggerSearch, { data: user, isFetching: isSearching, isError: searchFailed }] = useLazyGetUserByMobileQuery()
  const [setSeller, { isLoading: isPromoting }] = useSetSellerMutation()

  useEffect(() => {
    if (!open) {
      setMobile('')
      setSearchAttempted(false)
    }
  }, [open])

  const handleSearch = () => {
    if (!mobile.trim()) {
      toast.error(t('seller.mobileRequired', 'Please enter a mobile number'))
      return
    }
    setSearchAttempted(true)
    triggerSearch(mobile.trim())
  }

  const handlePromote = async () => {
    if (!user) return
    try {
      await setSeller(user.id).unwrap()
      toast.success(t('common.success'))
      onClose()
    } catch (error: any) {
      toast.error(getApiError(error, t('common.error')))
    }
  }

  const alreadySeller = user?.isSeller === true

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('seller.add', 'Add Seller')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPromoting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handlePromote}
            loading={isPromoting}
            disabled={!user || alreadySeller}
          >
            {t('seller.makeSeller', 'Make Seller')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          {t('seller.searchHint', 'Search for an existing user by mobile number, then promote them to a seller.')}
        </p>

        {/* Search row */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label={t('seller.mobile', 'Mobile Number')}
              placeholder="e.g. 01097507292"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button type="button" onClick={handleSearch} loading={isSearching} leftIcon={<HiSearch size={14} />}>
            {t('common.search', 'Search')}
          </Button>
        </div>

        {/* Result */}
        {searchAttempted && !isSearching && searchFailed && (
          <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-red-50 text-sm text-[var(--danger)]">
            <HiOutlineExclamationCircle size={18} className="shrink-0" />
            {t('seller.userNotFound', 'No user account found with this mobile number.')}
          </div>
        )}

        {user && (
          <div className="flex flex-col gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-hover)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiCheckCircle size={18} className="text-[var(--success)]" />
                <span className="font-semibold text-[var(--text-primary)]">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              {alreadySeller && (
                <StatusBadge variant="success" label={t('seller.alreadySeller', 'Already a Seller')} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-[var(--text-muted)] block">{t('seller.mobile', 'Mobile')}</span>
                {user.mobile}
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] block">{t('seller.gender', 'Gender')}</span>
                {user.gender ?? '—'}
              </div>
              {user.email && (
                <div>
                  <span className="text-xs text-[var(--text-muted)] block">{t('seller.email', 'Email')}</span>
                  {user.email}
                </div>
              )}
              <div>
                <span className="text-xs text-[var(--text-muted)] block">{t('seller.registeredOn', 'Registered On')}</span>
                {user.registrationDate}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}