

export interface FqaType {
  id: number    
  nameAr: string
  nameEn: string
  imageUrl?:string
}

export interface CreateFqaTypeRequest {
  nameAr: string
  nameEn: string
  imageUrl?:File
}

export interface UpdateFqaTypeRequest extends CreateFqaTypeRequest {
  id: number
}