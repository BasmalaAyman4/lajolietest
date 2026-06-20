
export interface TermsType {
  id: number
  nameAr: string
  nameEn: string
}

export interface CreateTermsTypeRequest {
  nameAr: string
  nameEn: string
}

export interface UpdateTermsTypeRequest extends CreateTermsTypeRequest {
  id: number
}