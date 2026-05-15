// ─── SalonSpecialistsPanel ────────────────────────────────────────────────────
//
//  Displays salon specialists with their photo-approval action.

import { toast } from 'sonner'
import { HiCheck, HiBadgeCheck } from 'react-icons/hi'
import type { SalonSpecialist } from '../types'
import { useApproveSpecialistImageMutation } from '../services/salonApi'

interface SalonSpecialistsPanelProps {
  specialists: SalonSpecialist[]
  onMutated: () => void
}

export default function SalonSpecialistsPanel({
  specialists,
  onMutated,
}: SalonSpecialistsPanelProps) {
  const [approveSpecialistImage, { isLoading }] = useApproveSpecialistImageMutation()

  const handleApprove = async (id: number) => {
    try {
      await approveSpecialistImage(id).unwrap()
      toast.success('Specialist image approved')
      onMutated()
    } catch {
      toast.error('Failed to approve specialist image')
    }
  }

  if (!specialists.length) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-8 text-center">
        No specialists added yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {specialists.map((sp) => (
        <div
          key={sp.id}
          className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] p-3 bg-[var(--bg-card)]"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={sp.imageUrl}
              alt={sp.nameEn}
              className="w-14 h-14 rounded-full object-cover border-2 border-[var(--border)]"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/56x56?text=?'
              }}
            />
            {sp.isImageApproved && (
              <HiBadgeCheck
                size={18}
                className="absolute -bottom-0.5 -end-0.5 text-[var(--success)] bg-[var(--bg-card)] rounded-full"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {sp.nameEn}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate" dir="rtl">
              {sp.nameAr}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
              {sp.jobNameEn}
            </span>
            {sp.brief && (
              <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                {sp.brief}
              </p>
            )}
          </div>

          {/* Approve btn */}
          {!sp.isImageApproved && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleApprove(sp.id)}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                text-[var(--text-muted)] hover:text-[var(--success)] bg-[var(--success)]/10
                transition-colors disabled:opacity-50"
              title="Approve image"
            >
              <HiCheck size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}