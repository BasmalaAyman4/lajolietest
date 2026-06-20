// ─── SalonDetailPage ──────────────────────────────────────────────────────────
//
//  Route: /admin/salons/:id
//  Shows full salon info: overview, images, specialists, branches, services, users.
//  Services and Users tabs now use the shared DataTable component.

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  HiArrowLeft,
  HiPencil,
  HiCheck,
  HiX,
  HiLocationMarker,
  HiPhone,
  HiUser,
  HiOfficeBuilding,
  HiShieldCheck,
  HiBadgeCheck,
  HiPhotograph,
} from 'react-icons/hi'
import { Button, ConfirmModal, DataTable, type Column, type FilterConfig } from '@/components/shared'
import {
  useGetSalonQuery,
  useApproveLogoMutation,
  useApproveBannerMutation,
} from '../services/salonApi'
import type { SalonService, SalonUser, SalonBranch } from '../types'
import SalonFormModal from '../components/SalonFormModal'
import SalonImagesPanel from '../components/SalonImagesPanel'
import SalonSpecialistsPanel from '../components/SalonSpecialistsPanel'
import { getApiError } from '@/services/apiHelpers'
import { useTranslation } from 'react-i18next'

// ── Tab config ────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'images' | 'specialists' | 'branches' | 'services' | 'users'

const TABS: { key: Tab; label: string }[] = [
  { key: 'images',      label: 'Images'       },
  { key: 'specialists', label: 'Specialists'  },
  { key: 'branches',    label: 'Branches'     },
  { key: 'services',    label: 'Services'     },
  { key: 'users',       label: 'Users'        },
]

// ── Shared sub-components ─────────────────────────────────────────────────────
function StatusBadge({ active, labelOn, labelOff }: { active: boolean; labelOn: string; labelOff: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        active
          ? 'bg-[var(--success)]/10 text-[var(--success)]'
          : 'bg-[var(--border)] text-[var(--text-muted)]'
      }`}
    >
      {active ? <HiCheck size={11} /> : <HiX size={11} />}
      {active ? labelOn : labelOff}
    </span>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[var(--text-muted)] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-sm text-[var(--text-primary)] break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

// ── Services columns ──────────────────────────────────────────────────────────
const SERVICE_COLUMNS: Column<SalonService>[] = [
  {
    key: 'imageUrl',
    label: '',
    render: (row) =>
      row.imageUrl && row.imageUrl !== 'NULL' ? (
        <img
          src={row.imageUrl}
          alt=""
          className="w-10 h-10 rounded-[var(--radius)] object-cover border border-[var(--border)] shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-10 h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)]">
          <HiPhotograph size={16} />
        </div>
      ),
  },
  {
    key: 'serviceNameEn',
    label: 'Service',
    sortable: true,
    render: (row) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{row.serviceNameEn}</span>
        <span className="text-xs text-[var(--text-muted)] truncate" dir="rtl">{row.serviceNameAr}</span>
        {row.serviceCategoryNameEn && (
          <span className="text-[10px] text-[var(--accent)] font-medium">{row.serviceCategoryNameEn}</span>
        )}
      </div>
    ),
  },
  {
    key: 'description',
    label: 'Description',
    render: (row) => (
      <span className="text-xs text-[var(--text-muted)] max-w-[180px] truncate block">
        {row.description || '—'}
      </span>
    ),
  },
  {
    key: 'avverageDurationMinutes',
    label: 'Duration',
    render: (row) =>
      row.avverageDurationMinutes > 0 ? (
        <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
          {row.avverageDurationMinutes} min
        </span>
      ) : (
        <span className="text-xs text-[var(--text-muted)]">—</span>
      ),
  },
  {
    key: 'isHomeService',
    label: 'Where',
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        {row.isHomeService && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
            🏠 Home
          </span>
        )}
        {row.isInSalonService && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--border)] text-[var(--text-secondary)] w-fit">
            🏢 Salon
          </span>
        )}
        {!row.isHomeService && !row.isInSalonService && (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        )}
      </div>
    ),
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    render: (row) => {
      if (row.isPriceRange && row.minPrice != null && row.maxPrice != null) {
        return (
          <div className="text-end">
            <p className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
              EGP {row.minPrice.toLocaleString()} – {row.maxPrice.toLocaleString()}
            </p>
            {row.priceNoteEn && (
              <p className="text-[10px] text-[var(--text-muted)]">{row.priceNoteEn}</p>
            )}
          </div>
        )
      }
      if (row.price != null) {
        return (
          <p className="text-sm font-medium text-[var(--text-primary)] text-end whitespace-nowrap">
            EGP {row.price.toLocaleString()}
          </p>
        )
      }
      return <span className="text-xs text-[var(--text-muted)] block text-end">—</span>
    },
  },
  {
    key: 'isFeatured',
    label: 'Flags',
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        {row.isFeatured && (
          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded w-fit">
            ⭐ Featured
          </span>
        )}
        {!row.isActive && (
          <span className="text-[10px] font-medium text-[var(--danger)] bg-[var(--danger)]/10 px-1.5 py-0.5 rounded w-fit">
            Inactive
          </span>
        )}
        {row.isFeatured === false && row.isActive && (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        )}
      </div>
    ),
  },
]

// ── Users columns ─────────────────────────────────────────────────────────────
const USER_COLUMNS: Column<SalonUser & { _key: string }>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (row) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">{row.name}</span>
    ),
  },
  {
    key: 'mobile',
    label: 'Mobile',
    render: (row) => (
      <span className="text-sm font-mono text-[var(--text-secondary)]">{row.mobile}</span>
    ),
  },
  {
    key: 'username',
    label: 'Username',
    render: (row) => (
      <span className="text-xs font-mono text-[var(--text-muted)]">{row.username}</span>
    ),
  },
  {
    key: 'userTypeName',
    label: 'Role',
    filterOptions: [
      { label: 'Admin',    value: 'Admin'    },
      { label: 'Employee', value: 'Employee' },
    ],
    render: (row) => (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          row.userType === 1
            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'bg-[var(--border)] text-[var(--text-muted)]'
        }`}
      >
        {row.userTypeName}
      </span>
    ),
  },
  {
    key: 'nationalId',
    label: 'National ID',
    render: (row) => (
      <span className="text-xs font-mono text-[var(--text-muted)]">{row.nationalId}</span>
    ),
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SalonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const salonId = Number(id)
const {t} = useTranslation()
  const { data: salon, isLoading, isError, refetch } = useGetSalonQuery(salonId)
  const [approveLogo]   = useApproveLogoMutation()
  const [approveBanner] = useApproveBannerMutation()
console.log(salon)
  const [activeTab, setActiveTab] = useState<Tab>('images')
  const [editModal, setEditModal] = useState(false)

  const handleApproveLogo = async () => {
    try {
      await approveLogo(salonId).unwrap()
      toast.success('Logo approved')
      refetch()
    } catch (error: any) {
                  toast.error(getApiError(error, t('common.error')))
                }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !salon) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-[var(--danger)]">Failed to load salon details.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    )
  }

  const pendingImages = salon.salonImages.filter((i) => !i.isApproved).length

  // Add a stable key for users (no id field on SalonUser)
  const usersWithKey = salon.salonUsers.map((u, i) => ({ ...u, _key: `${u.mobile}-${i}` }))

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)]
            hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <HiArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] truncate">
            {salon.nameEn}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button leftIcon={<HiPencil size={14} />} onClick={() => setEditModal(true)}>
            Edit
          </Button>
        </div>
      </div>

      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5 flex flex-wrap gap-5 items-start">
        {/* Logo */}
        <div className="relative group shrink-0">
          {salon.logoUrl ? (
            <img
              src={salon.logoUrl}
              alt="Salon logo"
              className="w-20 h-20 rounded-[var(--radius-lg)] object-cover border border-[var(--border)]"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Logo'
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)]">
              <HiPhotograph size={28} />
            </div>
          )}
          <button
            type="button"
            onClick={handleApproveLogo}
            className="absolute inset-0 rounded-[var(--radius-lg)] bg-black/50 opacity-0 group-hover:opacity-100
              transition-opacity flex items-center justify-center"
            title="Approve logo"
          >
            <HiCheck size={20} className="text-white" />
          </button>
        </div>

        {/* Info grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 min-w-0">
          <InfoRow icon={<HiPhone         size={15} />} label="Telephone"         value={salon.telephone}          />
          <InfoRow icon={<HiUser          size={15} />} label="Owner"             value={salon.ownerName}          />
          <InfoRow icon={<HiLocationMarker size={15} />} label="Address"          value={salon.mainOfficeAddress}  />
          <InfoRow icon={<HiOfficeBuilding size={15} />} label="Commercial Record" value={salon.commertialRecordNo} />
          <InfoRow icon={<HiShieldCheck   size={15} />} label="Tax Card"          value={salon.taxCardNo}          />
          <InfoRow icon={<HiBadgeCheck    size={15} />} label="National ID"       value={salon.ownerNationalId}    />
        </div>

        {/* Feature flags */}
        <div className="flex flex-wrap gap-2 w-full pt-2 border-t border-[var(--border)]">
          <StatusBadge active={salon.hijabSection}        labelOn="Hijab Section"    labelOff="No Hijab Section" />
          <StatusBadge active={salon.menWorker}           labelOn="Men Worker"       labelOff="No Men Worker"    />
          <StatusBadge active={!salon.childrenNotAllowed} labelOn="Children Allowed" labelOff="No Children"      />
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
            {tab.key === 'images' && pendingImages > 0 && (
              <span className="ms-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--danger)] text-white text-[10px]">
                {pendingImages}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--accent)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab panels ───────────────────────────────────────────────────────── */}
      <div className="pb-8">

      

        {/* Images */}
        {activeTab === 'images' && (
          <SalonImagesPanel
            salonId={salonId}
            images={salon.salonImages}
            onMutated={refetch}
          />
        )}

        {/* Specialists */}
        {activeTab === 'specialists' && (
          <SalonSpecialistsPanel
            specialists={salon.salonSpecialists}
            onMutated={refetch}
          />
        )}

        {/* Branches */}
        {activeTab === 'branches' && (
          <div className="flex flex-col gap-3">
            {salon.salonBranches.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-8 text-center">No branches added yet.</p>
            ) : (
              salon.salonBranches.map((b: SalonBranch, i: number) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{b.nameEn}</p>
                    <p className="text-xs text-[var(--text-muted)]" dir="rtl">{b.nameAr}</p>
                    {b.isMainBranch && (
                      <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
                        Main Branch
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <HiPhone size={13} />
                      <span>{b.telephone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <HiUser size={13} />
                      <span>{b.managerName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="text-xs text-[var(--text-muted)]">Working Hours</p>
                    <p className="text-[var(--text-primary)]">{b.openTime} – {b.closeTime}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Coordinates</p>
                    <p className="text-[var(--text-muted)] text-xs font-mono">{b.lat}, {b.long}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Services — now uses shared DataTable */}
        {activeTab === 'services' && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
            <DataTable<SalonService>
              columns={SERVICE_COLUMNS}
              data={salon.salonServices}
              rowKey="salonServiceId"
              searchKeys={['serviceNameEn', 'serviceNameAr', 'description']}
              searchPlaceholder="Search services…"
              emptyMessage="No services added yet."
            />
          </div>
        )}

        {/* Users — now uses shared DataTable */}
        {activeTab === 'users' && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
            <DataTable<SalonUser & { _key: string }>
              columns={USER_COLUMNS}
              data={usersWithKey}
              rowKey="_key"
              searchKeys={['name', 'mobile', 'username', 'nationalId']}
              searchPlaceholder="Search users…"
              emptyMessage="No users assigned yet."
            />
          </div>
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <SalonFormModal
        open={editModal}
        onClose={() => setEditModal(false)}
        salon={salon}
      />
    </div>
  )
}