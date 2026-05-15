// ─── ProductType Types ────────────────────────────────────────────────────────

export interface ProductType {
  id: number
  imageUrl?: string
  nameAr: string
  nameEn: string
  codeKey: string
  isActive: boolean
  sortOrder: number
}

export interface CreateProductTypeRequest {
  nameAr: string
  nameEn: string
  codeKey: string
  isActive: number
  sortOrder: number
}

export interface UpdateProductTypeRequest extends CreateProductTypeRequest {
  id: number
}
