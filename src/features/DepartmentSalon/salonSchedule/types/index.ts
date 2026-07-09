// ─── Salon Schedule Types ─────────────────────────────────────────────────────

export interface SalonScheduleSalon {
  salonId: number
  salonName: string
  logoUrl: string
  imageUrl: string
  description: string
  telephone: string
  mainOfficeAddress: string
  scheduleCount: number
  branchCountWithSchedules: number
}

export interface TimeValue {
  hour: number
  minute: number
}

export interface FreeScheduleTime {
  id?: number
  timeFrom: string | TimeValue
  timeTo?: string | TimeValue
  toTime?: string | TimeValue // Fallback for old API
}

export interface SalonSchedule {
  id: number
  salonId?: number
  salonName?: string
  salonPackageName?: string
  salonServiceId: number
  salonServiceName: string
  salonBranchName: string
  salonPackageId?: number | null
  applyAllThisMonth?: boolean
  fromDate?: string
  toDate?: string
  branchId: number
  branchName?: string
  isStoped: boolean
  month: number
  day: number
  year: number
  timeFrom: string | TimeValue
  timeTo: string | TimeValue
  requiredDesposit: boolean
  depositMinimumValue: number
  depositDuration: number
  serviceDuration: number
  howManyInDay: number
  howManyInPeriod: number
  canCancelBefore: number
  requiredSalonApproved: boolean
  freeScheduleTimes: FreeScheduleTime[]
}

export interface DropdownItem {
  id: number
  name: string
}

// ─── API Request Types ────────────────────────────────────────────────────────

export interface CreateScheduleRequest {
  salonId?: number
  salonServiceId: number
  branchId: number

  applyAllThisMonth: boolean
  month?: number
  day?: number
  year?: number

  // Used when applyAllThisMonth = false
  fromDate?: string   // "YYYY-MM-DD"
  toDate?: string     // "YYYY-MM-DD"

  timeFrom: string    // "HH:mm:ss"
  timeTo: string      // "HH:mm:ss"
  requiredDesposit: boolean
  depositMinimumValue: number
  depositDuration: number
  serviceDuration: number
  howManyInDay: number | null   // null = no limit
  howManyInPeriod: number
  canCancelBefore: number
  requiredSalonApproved: boolean
  freeScheduleTimes: { timeFrom: string; toTime: string }[]
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {
  id: number
}