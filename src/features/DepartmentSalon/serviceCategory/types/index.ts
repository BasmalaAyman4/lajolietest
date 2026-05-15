
export interface ServiceCategory {
  id: number
  nameAr: string
  nameEn: string
  codeKey: string
  isActive: boolean
  sortOrder: number
}

export interface CreateServiceCategoryRequest {
  codeKey: string
  nameAr: string
  nameEn: string
  isActive: number
  sortOrder: number
}

export interface UpdateServiceCategoryRequest extends CreateServiceCategoryRequest {
  id: number
}
