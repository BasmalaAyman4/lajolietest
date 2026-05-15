
export interface CountryOption {
  id: number
  name: string
}

export interface City {
  id: number
  countryId: number
  countryName: string       
  nameAr: string
  nameEn: string
  shippingCost: number

}

export interface CreateCityRequest {
  countryId: number
  nameAr: string
  nameEn: string
  shippingCost: number
}

export interface UpdateCityRequest extends CreateCityRequest {
  id: number
}