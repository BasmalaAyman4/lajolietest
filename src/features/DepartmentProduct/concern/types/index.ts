// ─── Concern Types ────────────────────────────────────────────────────────────

export interface Concern {
  id: number
  imageUrl?: string
  codeKey: string
  beautyCategoriesId: number
  nameAr: string
  nameEn: string
  isActive: boolean
  sortOrder: number
}

export interface CreateConcernRequest {
  codeKey: string
  beautyCategoriesId: number
  nameAr: string
  nameEn: string
  isActive: number
  sortOrder: number
}

export interface UpdateConcernRequest extends CreateConcernRequest {
  id: number
}