// ─── Size Types ───────────────────────────────────────────────────────────────

export interface SpecialistJob {
  id: number
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateSpecialistJobRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateSpecialistJobRequest extends CreateSpecialistJobRequest {
  id: number
}