

export interface CategoryProduct {
  id: number    
  imageUrl?: string
  nameAr: string
  nameEn: string
  description: string
}

export interface CreateCategoryProductRequest {
  nameAr: string
  nameEn: string
  description: string
}

export interface UpdateCategoryProductRequest extends CreateCategoryProductRequest {
  id: number
}