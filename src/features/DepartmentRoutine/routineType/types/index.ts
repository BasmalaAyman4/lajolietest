// ─── RoutineType Types ───────────────────────────────────────────────────────────────
export interface TimeValue {
  hour: number
  minute: number
}
export interface RoutineType {
  id: number
  nameAr: string
  nameEn: string
  description: string
  fromTime: string
  toTime: string
}

export interface CreateRoutineTypeRequest {
  nameAr: string
  nameEn: string
  description: string
  fromTime: string
  toTime: string
}

export interface UpdateRoutineTypeRequest extends CreateRoutineTypeRequest {
  id: number
}