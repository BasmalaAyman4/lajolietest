// ─── ReelCategory Types ───────────────────────────────────────────────────────────────

export interface ReelCategory {
  id: number
  nameAr: string
  nameEn: string
  isActive: boolean
  imageUrl?: string
}

export interface CreateReelCategoryRequest {
  nameAr: string
  nameEn: string
  isActive: boolean
}

export interface UpdateReelCategoryRequest extends CreateReelCategoryRequest {
  id: number
}