export interface TermsAndConditions {
  id: number
  descriptionAr: string
  descriptionEn: string
  termsTypeId: number
}

export interface CreateTermsAndConditionsRequest {
  descriptionAr: string
  descriptionEn: string
  termsTypeId: number
}

export interface TermsTypeDropdown {
  id: number
  name: string
}