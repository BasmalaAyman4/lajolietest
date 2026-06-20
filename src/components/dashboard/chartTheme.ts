import type { ApexOptions } from 'apexcharts'

export const CHART_COLORS = ['#FE8787', '#38bdf8', '#22c55e', '#f59e0b', '#a78bfa', '#ef4444']

export const BASE_CHART_OPTIONS: ApexOptions = {
  chart: {
    fontFamily: 'Sora, sans-serif',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: CHART_COLORS,
  grid: {
    borderColor: '#e3e6ec',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  dataLabels: { enabled: false },
  legend: {
    fontSize: '12px',
    fontWeight: 500,
    labels: { colors: '#5c5c5c' },
    markers: { size: 6, offsetX: -2 },
  },
  tooltip: {
    theme: 'light',
    style: { fontSize: '12px' },
  },
  stroke: { curve: 'smooth', width: 2.5 },
}

export function getLastMonths(count: number, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
  })

  return Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (count - 1 - i))
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return { key, label: formatter.format(date) }
  })
}
