
export interface CityOption {
  id: number
  name: string
}

export interface Area {
  id: number
  cityId: number
  cityName: string       
  nameAr: string
  nameEn: string


}

export interface CreateAreaRequest {
  cityId: number
  nameAr: string
  nameEn: string
}

export interface UpdateAreaRequest extends CreateAreaRequest {
  id: number
}