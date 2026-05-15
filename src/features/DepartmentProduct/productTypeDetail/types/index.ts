// ─── ProductTypeDetail Types ────────────────────────────────────────────────────────────

export interface ProductTypeDetail {
  id: number
  imageUrl?: string
  codeKey: string
  productTypeId: number
  nameAr: string
  nameEn: string
  isActive: boolean
  sortOrder: number
}

export interface CreateProductTypeDetailRequest {
  codeKey: string
  productTypeId: number
  nameAr: string
  nameEn: string
  isActive: number
  sortOrder: number
}

export interface UpdateProductTypeDetailRequest extends CreateProductTypeDetailRequest {
  id: number
}