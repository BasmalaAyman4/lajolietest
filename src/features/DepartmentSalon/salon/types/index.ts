// ─── Salon Types ───────────────────────────────────────────────────────────────

export interface SalonListItem {
  id: number
  nameAr: string
  nameEn: string
  telephone: string
  ownerName: string
  ownerNationalId: string
  taxCardNo: string
  commertialRecordNo: string
  mainOfficeAddress: string
  hijabSection: boolean
  childrenNotAllowed: boolean
  menWorker: boolean
  isTrusted: boolean
  isVerify: boolean
  startingDate: string,
  long:string,
  lat:string,
  isPhoneVerified:boolean
}

export interface SalonUser {
  name: string
  username: string
  mobile: string
  userType: number
  userTypeName: string
  nationalId: string
}

export interface SalonImage {
  id: number
  imageUrl: string
  isApproved: boolean
}

export interface SalonBranch {
  nameAr: string
  nameEn: string
  lat: string
  long: string
  telephone: string
  mobile: string
  managerName: string
  openTime: string
  closeTime: string
  isMainBranch: boolean
}

// types.ts
export interface SalonService {
  salonServiceId: number
  serviceId: number
  serviceCategoriesId: number | null
  serviceCategoryNameEn: string | null
  serviceCategoryNameAr: string | null
  serviceNameAr: string
  serviceNameEn: string
  description: string | null
  imageUrl: string | null
  isPriceRange: boolean
  price: number | null
  minPrice: number | null
  maxPrice: number | null
  priceNoteEn: string | null
  priceNoteAr: string | null
  avverageDurationMinutes: number
  isHomeService: boolean
  isInSalonService: boolean
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
}
export interface SalonSpecialist {
  id: number
  jobId: number
  jobNameAr: string
  jobNameEn: string
  imageUrl: string
  isImageApproved: boolean
  nameAr: string
  nameEn: string
  brief: string
}

export interface SalonDetail extends SalonListItem {
  ownerId: number
  lat: string
  long: string
  logoUrl: string
  salonUsers: SalonUser[]
  salonImages: SalonImage[]
  salonBranches: SalonBranch[]
  salonServices: SalonService[]
  salonSpecialists: SalonSpecialist[]
}

export interface CreateSalonRequest {
  nameAr: string
  nameEn: string
  telephone: string
  ownerMobile: string
  ownerPassword: string
  ownerName: string
  ownerNationalId: string
  taxCardNo: string
  commertialRecordNo: string
  mainOfficeAddress: string
  lat: string
  long: string
  isTrusted: boolean
  isVerify: boolean
  startingDate: string
}

export interface UpdateSalonRequest {
  id: number
  nameAr: string
  nameEn: string
  telephone: string
  ownerName: string
  ownerNationalId: string
  taxCardNo: string
  commertialRecordNo: string
  mainOfficeAddress: string
  lat: string
  long: string
  hijabSection: boolean
  childrenNotAllowed: boolean
  menWorker: boolean
  isTrusted: boolean
  isVerify: boolean
}

export interface PendingPhotoItem {
  entityId: number
  salonId: number
  salonNameAr: string
  salonNameEn: string
  section: 'Gallery' | 'Logo' | 'Banner' | 'Specialist'
  sectionItemId: number | null
  sectionItemNameAr: string | null
  sectionItemNameEn: string | null
  imageUrl: string
  isApproved: boolean | null
}

export interface PendingPhotoApprovalsResponse {
  data: PendingPhotoItem[]
  lastPageNo: number
  totalCount: number
  defaultImages: unknown[]
}