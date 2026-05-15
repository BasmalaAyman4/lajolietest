// ─── Goal Types ───────────────────────────────────────────────────────────────

export interface Goal {
  id: number
  imageUrl?: string
  codeKey: string
  beautyCategoriesId: number
  nameAr: string
  nameEn: string
  isActive: boolean
  sortOrder: number
}

export interface CreateGoalRequest {
  codeKey: string
  beautyCategoriesId: number
  nameAr: string
  nameEn: string
  isActive: number
  sortOrder: number
}

export interface UpdateGoalRequest extends CreateGoalRequest {
  id: number
}