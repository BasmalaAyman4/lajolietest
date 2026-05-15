// ─── Brand Types ──────────────────────────────────────────────────────────────

export interface Brand {
  id: number
  imageUrl?: string
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateBrandRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateBrandRequest extends CreateBrandRequest {
  id: number
}
