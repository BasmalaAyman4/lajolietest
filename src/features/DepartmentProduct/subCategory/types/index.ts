// ─── SubCategory Types ───────────────────────────────────────────────────

export interface CategoryOption {
  id: number
  name: string
}

export interface SubCategory {
  id: number
  categoryId: number
  categoryName: string       // returned directly by the API — no client-side lookup needed
  imageUrl?: string
  nameAr: string
  nameEn: string

}

export interface CreateSubCategoryRequest {
  categoryId: number
  nameAr: string
  nameEn: string
}

export interface UpdateSubCategoryRequest extends CreateSubCategoryRequest {
  id: number
}