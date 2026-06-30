export interface VoucherTarget {
  targetType: number
  targetId: number
}

export interface VoucherTargetDetail {
  detailId: number
  targetType: number
  targetTypeName: string
  targetId: number
  name: string
  isStopped: boolean
}

export interface VoucherListItem {
  id: number
  vcode: string
  forVisa: boolean
  forCash: boolean
  isPercentage: boolean
  vvalue: number
  maxDiscountAmount: number | null
  minimumEligibleAmount: number
  maxUsesPerUser: number
  maxTotalUses: number
  totalUses: number
  fromDate: string
  toDate: string
  description: string
  isStoped: boolean
  targetCount: number
  userTargetCount: number
}

export interface Voucher {
  id: number
  vcode: string
  forVisa: boolean
  forCash: boolean
  isPercentage: boolean
  vvalue: number
  maxDiscountAmount: number | null
  minimumEligibleAmount: number
  maxUsesPerUser: number
  maxTotalUses: number
  totalUses: number
  fromDate: string
  toDate: string
  description: string
  isStoped: boolean
  userIds: number[]
  targets: VoucherTargetDetail[]
}

export interface CreateVoucherRequest {
  vcode: string
  forVisa: boolean
  forCash: boolean
  isPercentage: boolean
  vvalue: number
  maxDiscountAmount: number
  minimumEligibleAmount: number
  maxUsesPerUser: number
  maxTotalUses: number
  fromDate: string
  toDate: string
  description: string
  userIds: number[]
  targets: VoucherTarget[]
}

export interface UpdateVoucherRequest extends CreateVoucherRequest {
  id: number
}

export interface DropdownItem {
  id: number
  name: string
}

export interface ProductDetailOption {
  detailId: number
  sizeId: number
  sizeName: string
  colorId: number
  colorName: string
  purchasePrice: number
}
