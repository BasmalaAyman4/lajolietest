export interface OrderDetail {
  productDetailId: number
  productName: string
  color: string
  size: string
  productImage: string | null
  productBundleId: number | null
  bundleName: string | null
  bundleImage: string | null
  mainPrice: number
  discountPercentage: number | null
  discountValue: number | null
  netPrice: number
  qty: number
  productPackaging: string | null
}

export interface Order {
  id: number
  createdDate: string
  userName: string
  userMobile: string
  mainPrice: number
  totalProductDiscount: number | null
  netOrderPaid: number
  status: string
  paymentStatus: number
  paymentMethod: number
  orderAddMethodType: number | null
  orderAddMethodName: string
  orderDetails: OrderDetail[]
}

export interface OrderListResponse {
  data: Order[]
  lastPageNo: number
  totalCount: number
  defaultImages: string[]
}

export interface AllowedTransition {
  id: number
  name: string
}

export interface UpdateStatusRequest {
  id: number
  status: number
}
