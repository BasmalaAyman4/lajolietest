import { useMemo, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  MdInventory2,
  MdShoppingCart,
  MdSpa,
  MdLocalShipping,
  MdPeople,
  MdPhotoLibrary,
} from 'react-icons/md'
import { HiPhotograph, HiArrowRight, HiOfficeBuilding } from 'react-icons/hi'
import { FaHandshake } from 'react-icons/fa'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import StatCard from '@/components/dashboard/StatCard'
import QuickLinkCard from '@/components/dashboard/QuickLinkCard'

const DashboardCharts = lazy(() => import('@/components/dashboard/DashboardCharts'))
import { StatusBadge } from '@/components/shared'

function getGreeting(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function formatDate(locale: string) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const {
    isLoading,
    productCount,
    orderCount,
    allOrders,
    recentOrders,
    salons,
    salonCount,
    verifiedSalons,
    pendingCount,
    pendingItems,
    purchaseCount,
  } = useDashboardStats()

  const greetingKey = useMemo(() => getGreeting(new Date().getHours()), [])
  const formattedDate = useMemo(() => formatDate(i18n.language), [i18n.language])

  const displayName = user?.name ?? user?.userName ?? t('dashboard.admin')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]
          bg-gradient-to-br from-[var(--accent-soft)] via-[var(--bg-card)] to-[var(--bg-card)] p-6 md:p-8"
      >
        <div
          className="pointer-events-none absolute -top-16 -end-16 h-48 w-48 rounded-full
            bg-[var(--accent)]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -start-10 h-36 w-36 rounded-full
            bg-[var(--accent)]/5 blur-2xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--accent)]">
              {t(`dashboard.greeting.${greetingKey}`)}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              {displayName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="shrink-0 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]/80 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {t('dashboard.today')}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
              {formattedDate}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.stats.products')}
          value={productCount ?? '—'}
          icon={<MdInventory2 size={22} />}
          accent="accent"
          href="/products"
          loading={isLoading}
        />
        <StatCard
          label={t('dashboard.stats.orders')}
          value={orderCount}
          icon={<MdShoppingCart size={22} />}
          accent="info"
          href="/orders"
          loading={isLoading}
        />
        <StatCard
          label={t('dashboard.stats.salons')}
          value={salonCount}
          icon={<MdSpa size={22} />}
          accent="success"
          href="/salons"
          loading={isLoading}
        />
        <StatCard
          label={t('dashboard.stats.pendingPhotos')}
          value={pendingCount}
          icon={<HiPhotograph size={22} />}
          accent={pendingCount > 0 ? 'warning' : 'success'}
          href="/pending-phaoto"
          loading={isLoading}
        />
      </section>

      {/* Charts + quick links */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-4 flex flex-col gap-4">
          

           <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-[280px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--bg-hover)] ${i === 0 ? 'md:col-span-2' : ''}`}
                  />
                ))}
              </div>
            }
          >
            <DashboardCharts
              orders={allOrders}
              salons={salons}
              pendingItems={pendingItems}
              productCount={productCount}
              orderCount={orderCount}
              salonCount={salonCount}
              purchaseCount={purchaseCount}
              pendingCount={pendingCount}
              loading={isLoading}
            />
          </Suspense> 



        </div>



      </section>

      {/* Recent orders + pending */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent orders */}
        <div
          className="xl:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border)]
            bg-[var(--bg-card)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('dashboard.recentOrders.title')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('dashboard.recentOrders.subtitle')}
              </p>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              {t('dashboard.viewAll')}
              <HiArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="bg-[var(--table-bg)]/50">
                  {['id', 'customer', 'amount', 'status'].map((key) => (
                    <th
                      key={key}
                      className="px-5 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                    >
                      {t(`dashboard.recentOrders.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-[var(--border)]">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 animate-pulse rounded bg-[var(--bg-hover)]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                      {t('dashboard.recentOrders.empty')}
                    </td>
                  </tr>
                ) : (
                  recentOrders.slice(0, 5).map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-[var(--border)] transition-colors hover:bg-[var(--bg-hover)]/50"
                    >
                      <td className="px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">
                        #{order.id}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{order.userName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{order.userMobile}</p>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium tabular-nums text-[var(--text-primary)]">
                        {formatCurrency(order.netOrderPaid)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant="neutral" label={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending approvals */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]
            shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('dashboard.pending.title')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('dashboard.pending.subtitle')}
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--warning)]">
                {pendingCount}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 p-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-[var(--radius)] bg-[var(--bg-hover)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--bg-hover)]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--bg-hover)]" />
                  </div>
                </div>
              ))
            ) : pendingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)]">
                  <MdPhotoLibrary size={22} />
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
                  {t('dashboard.pending.emptyTitle')}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {t('dashboard.pending.emptyDesc')}
                </p>
              </div>
            ) : (
              pendingItems.slice(0, 5).map((item) => (
                <div
                  key={`${item.entityId}-${item.section}-${item.sectionItemId}`}
                  className="flex gap-3 rounded-[var(--radius)] border border-[var(--border)] p-2.5
                    transition-colors hover:bg-[var(--bg-hover)]/50"
                >
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-[var(--radius)] object-cover bg-[var(--bg-hover)]"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {item.salonNameEn}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{item.section}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {pendingCount > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-3">
              <Link
                to="/pending-phaoto"
                className="flex w-full items-center justify-center gap-1 rounded-[var(--radius)]
                  bg-[var(--accent-soft)] py-2 text-xs font-semibold text-[var(--accent)]
                  transition-colors hover:bg-[var(--accent)] hover:text-white"
              >
                {t('dashboard.pending.reviewAll')}
                <HiArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* More quick access */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          {t('dashboard.moreAccess')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLinkCard
            title={t('dashboard.quickLinks.pendingPhotos')}
            description={t('dashboard.quickLinks.pendingPhotosDesc')}
            icon={<HiPhotograph size={18} />}
            href="/pending-phaoto"
          />
          <QuickLinkCard
            title={t('dashboard.quickLinks.purchases')}
            description={t('dashboard.quickLinks.purchasesDesc')}
            icon={<MdLocalShipping size={18} />}
            href="/purchases"
          />
          <QuickLinkCard
            title={t('dashboard.quickLinks.users')}
            description={t('dashboard.quickLinks.usersDesc')}
            icon={<MdPeople size={18} />}
            href="/manage-user"
          />
          <QuickLinkCard
            title={t('dashboard.quickLinks.collaboration')}
            description={t('dashboard.quickLinks.collaborationDesc')}
            icon={<FaHandshake size={18} />}
            href="/collaborator"
          />
        </div>
      </section>
    </div>
  )
}
