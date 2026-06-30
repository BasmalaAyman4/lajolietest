
export interface ChairType {
  id: number
  nameAr: string
  nameEn: string
  isActive: boolean
  sortOrder: number
}

export interface CreateChairTypeRequest {
  nameAr: string
  nameEn: string
  isActive: boolean
  sortOrder: number
}

export interface UpdateChairTypeRequest extends CreateChairTypeRequest {
  id: number
}
