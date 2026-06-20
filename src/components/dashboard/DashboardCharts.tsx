import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useTranslation } from 'react-i18next'
import type { Order } from '@/features/orders/types'
import type { SalonListItem } from '@/features/DepartmentSalon/salon/types'
import type { PendingPhotoItem } from '@/features/DepartmentSalon/salon/types'
import ChartCard from './ChartCard'
import { BASE_CHART_OPTIONS, CHART_COLORS, getLastMonths } from './chartTheme'

interface DashboardChartsProps {
  orders: Order[]
  salons: SalonListItem[]
  pendingItems: PendingPhotoItem[]
  productCount: number | null
  orderCount: number
  salonCount: number
  purchaseCount: number
  pendingCount: number
  loading?: boolean
}

function groupOrdersByMonth(orders: Order[], locale: string) {
  const months = getLastMonths(6, locale)
  const revenueMap = new Map(months.map((m) => [m.key, 0]))

  orders.forEach((order) => {
    const date = new Date(order.createdDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (revenueMap.has(key)) {
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + order.netOrderPaid)
    }
  })

  return {
    categories: months.map((m) => m.label),
    revenue: months.map((m) => revenueMap.get(m.key) ?? 0),
  }
}

function groupOrderStatuses(orders: Order[]) {
  const map = new Map<string, number>()
  orders.forEach((order) => {
    map.set(order.status, (map.get(order.status) ?? 0) + 1)
  })
  return {
    labels: [...map.keys()],
    series: [...map.values()],
  }
}

function groupPendingBySection(items: PendingPhotoItem[]) {
  const sections = ['Gallery', 'Logo', 'Banner', 'Specialist'] as const
  const map = new Map<string, number>(sections.map((s) => [s, 0]))
  items.forEach((item) => {
    map.set(item.section, (map.get(item.section) ?? 0) + 1)
  })
  return {
    labels: sections.filter((s) => (map.get(s) ?? 0) > 0),
    series: sections.filter((s) => (map.get(s) ?? 0) > 0).map((s) => map.get(s) ?? 0),
  }
}

export default function DashboardCharts({
  orders,
  salons,
  pendingItems,
  productCount,
  orderCount,
  salonCount,
  purchaseCount,
  pendingCount,
  loading,
}: DashboardChartsProps) {
  const { t, i18n } = useTranslation()

  const monthlyData = useMemo(
    () => groupOrdersByMonth(orders, i18n.language),
    [orders, i18n.language],
  )

  const orderStatusData = useMemo(() => groupOrderStatuses(orders), [orders])

  const salonData = useMemo(() => {
    const verified = salons.filter((s) => s.isVerify).length
    return {
      labels: [t('dashboard.charts.verified'), t('dashboard.charts.unverified')],
      series: [verified, Math.max(salonCount - verified, 0)],
    }
  }, [salons, salonCount, t])

  const pendingSectionData = useMemo(
    () => groupPendingBySection(pendingItems),
    [pendingItems],
  )

  const platformData = useMemo(
    () => ({
      categories: [
        t('dashboard.stats.products'),
        t('dashboard.stats.orders'),
        t('dashboard.stats.salons'),
        t('dashboard.stats.purchases'),
        t('dashboard.stats.pendingPhotos'),
      ],
      series: [
        {
          name: t('dashboard.charts.total'),
          data: [
            productCount ?? 0,
            orderCount,
            salonCount,
            purchaseCount,
            pendingCount,
          ],
        },
      ],
    }),
    [productCount, orderCount, salonCount, purchaseCount, pendingCount, t],
  )

  const revenueOptions: ApexOptions = {
    ...BASE_CHART_OPTIONS,
    chart: { ...BASE_CHART_OPTIONS.chart, type: 'area', height: 240 },
    xaxis: {
      categories: monthlyData.categories,
      labels: { style: { colors: '#8e8e8e', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#8e8e8e', fontSize: '11px' },
        formatter: (val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(Math.round(val))),
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    colors: [CHART_COLORS[0]],
    tooltip: {
      ...BASE_CHART_OPTIONS.tooltip,
      y: { formatter: (val) => `${val.toLocaleString()}` },
    },
  }

  const revenueSeries = [{ name: t('dashboard.charts.revenue'), data: monthlyData.revenue }]

  const donutBase: ApexOptions = {
    ...BASE_CHART_OPTIONS,
    chart: { ...BASE_CHART_OPTIONS.chart, type: 'donut', height: 220 },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              label: t('dashboard.charts.total'),
              fontSize: '11px',
              color: '#8e8e8e',
            },
            
          },
        },
      },
    },
    stroke: { width: 0 },
    labels: [],
    legend: {
      position: 'bottom',
      fontSize: '12px',
      itemMargin: { horizontal: 8, vertical: 4 },
    },
  }

  const orderStatusOptions: ApexOptions = {
    ...donutBase,
    labels: orderStatusData.labels.length > 0 ? orderStatusData.labels : [t('dashboard.charts.noData')],
    colors: CHART_COLORS,
  }

  const salonOptions: ApexOptions = {
    ...donutBase,
    labels: salonData.labels,
    colors: [CHART_COLORS[2], '#e3e6ec'],
  }

  const pendingOptions: ApexOptions = {
    ...donutBase,
    labels:
      pendingSectionData.labels.length > 0
        ? pendingSectionData.labels
        : [t('dashboard.charts.noData')],
    colors: [CHART_COLORS[3], CHART_COLORS[1], CHART_COLORS[4], CHART_COLORS[0]],
  }

  const platformOptions: ApexOptions = {
    ...BASE_CHART_OPTIONS,
    chart: { ...BASE_CHART_OPTIONS.chart, type: 'bar', height: 220 },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '55%',
        distributed: true,
      },
    },
    xaxis: {
      categories: platformData.categories,
      labels: {
        style: { colors: '#8e8e8e', fontSize: '10px' },
        rotate: -25,
        rotateAlways: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#8e8e8e', fontSize: '11px' } },
    },
    colors: CHART_COLORS,
    legend: { show: false },
  }

  return (
 
  <>
    <div className="flex flex-col gap-4">
      {/* Revenue chart - full width */}
      <ChartCard
        title={t('dashboard.charts.revenueTitle')}
        subtitle={t('dashboard.charts.revenueSubtitle')}
        loading={loading}
      >
        <Chart
          options={revenueOptions}
          series={revenueSeries}
          type="area"
          height={240}
        />
      </ChartCard>

      {/* 4 cards side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ChartCard
          title={t('dashboard.charts.platformTitle')}
          subtitle={t('dashboard.charts.platformSubtitle')}
          loading={loading}
        >
          <Chart
            options={platformOptions}
            series={platformData.series}
            type="bar"
            height={220}
          />
        </ChartCard>

        <ChartCard
          title={t('dashboard.charts.orderStatusTitle')}
          subtitle={t('dashboard.charts.orderStatusSubtitle')}
          loading={loading}
        >
          <Chart
            options={orderStatusOptions}
            series={orderStatusData.series.length > 0 ? orderStatusData.series : [0]}
            type="donut"
            height={220}
          />
        </ChartCard>

        <ChartCard
          title={t('dashboard.charts.salonTitle')}
          subtitle={t('dashboard.charts.salonSubtitle')}
          loading={loading}
        >
          <Chart
            options={salonOptions}
            series={salonData.series}
            type="donut"
            height={220}
          />
        </ChartCard>

        <ChartCard
          title={t('dashboard.charts.pendingTitle')}
          subtitle={t('dashboard.charts.pendingSubtitle')}
          loading={loading}
        >
          <Chart
            options={pendingOptions}
            series={pendingSectionData.series.length > 0 ? pendingSectionData.series : [0]}
            type="donut"
            height={220}
          />
        </ChartCard>
      </div>
    </div>
  </>
)

   
}
