// ─── BeautyCategory Types ─────────────────────────────────────────────────────

export interface BeautyCategory {
  id: number
  imageUrl?: string
  nameAr: string
  nameEn: string
  codeKey: string
  isActive: boolean
  sortOrder: number
}

export interface CreateBeautyCategoryRequest {
  codeKey: string
  nameAr: string
  nameEn: string
  isActive: number
  sortOrder: number
}

export interface UpdateBeautyCategoryRequest extends CreateBeautyCategoryRequest {
  id: number
}
