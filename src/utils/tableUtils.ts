// utils/tableUtils.ts
const LIMIT_OPTIONS = [10, 20, 50, 100, 200]

export function readPersistedLimit(tableKey: string, defaultLimit = 20): number {
  try {
    const raw = localStorage.getItem(`table-limit:${tableKey}`)
    const parsed = Number(raw)
    return LIMIT_OPTIONS.includes(parsed) ? parsed : defaultLimit
  } catch {
    return defaultLimit
  }
}