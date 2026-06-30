export interface ShippingOffer {
  id: number
  fromDate: string
  toDate: string
  orderValue: number
  offerValue: number
  isStoped: boolean
}

export interface ShippingOfferListResponse {
  shippingOffers: ShippingOffer[]
  lastPageNo: number
}

export interface CreateShippingOfferRequest {
  fromDate: string
  toDate: string
  orderValue: number
  offerValue: number
}

export interface UpdateShippingOfferRequest {
  id: number
  fromDate: string
  toDate: string
  orderValue: number
  offerValue: number
}
