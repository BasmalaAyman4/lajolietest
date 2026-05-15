import Modal from './index'
import { useTranslation } from 'react-i18next'
import { HiCheckCircle, HiExclamation, HiPlay, HiStop, HiTrash } from 'react-icons/hi'

type ConfirmVariant = 'delete' | 'stop' | 'active'|'approve'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  loading?: boolean
  variant?: ConfirmVariant
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    icon: React.ReactNode
    iconBg: string
    btnClass: string
    defaultTitle: string
    confirmKey: string
  }
> = {
  delete: {
    icon: <HiTrash size={24} className="text-[var(--danger)]" />,
    iconBg: 'bg-red-500/10',
    btnClass: 'bg-[var(--danger)]',
    defaultTitle: 'Delete',
    confirmKey: 'common.delete',
  },
  stop: {
    icon: <HiStop size={24} className="text-orange-500" />,
    iconBg: 'bg-orange-500/10',
    btnClass: 'bg-orange-500',
    defaultTitle: 'Stop',
    confirmKey: 'common.stop',
  },
  active: {
    icon: <HiPlay size={24} className="text-[var(--success)]" />,
    iconBg: 'bg-green-500/10',
    btnClass: 'bg-[var(--success)]',
    defaultTitle: 'Activate',
    confirmKey: 'common.activate',
  },
  approve: {
    icon: <HiCheckCircle size={24} className="text-[var(--success)]" />,
    iconBg: 'bg-green-500/10',
    btnClass: 'bg-[var(--success)]',
    defaultTitle: 'Approve',
    confirmKey: 'common.approve',
  },
}

/**
 * ConfirmModal – standardised confirm dialog.
 *
 * variant="delete"  → red,    trash icon,  "Delete" button   (default)
 * variant="stop"    → orange, stop icon,   "Stop" button
 * variant="active"  → green,  play icon,   "Activate" button
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
  variant = 'delete',
}: ConfirmModalProps) {
  const { t } = useTranslation()
  const config = VARIANT_CONFIG[variant]

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-[var(--radius)] border border-[var(--border)]
              text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]
              transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-[var(--radius)] text-white
              text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50
              ${config.btnClass}`}
          >
            {loading ? t('common.loading') : t(config.confirmKey, config.defaultTitle)}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.iconBg}`}>
          {config.icon}
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)]">
            {title ?? config.defaultTitle}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {message ?? t('common.confirm')}
          </p>
        </div>
      </div>
    </Modal>
  )
}