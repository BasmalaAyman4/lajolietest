// ─── ServiceType Types ────────────────────────────────────────────────────────────

export interface ServiceType {
  id: number
  imageUrl?: string
  codeKey: string
  serviceCategoryId: number
  nameAr: string
  nameEn: string
  isActive: boolean
  sortOrder: number
}

export interface CreateServiceTypeRequest {
  codeKey: string
  serviceCategoryId: number
  nameAr: string
  nameEn: string
  isActive: number
  sortOrder: number
}

export interface UpdateServiceTypeRequest extends CreateServiceTypeRequest {
  id: number
}