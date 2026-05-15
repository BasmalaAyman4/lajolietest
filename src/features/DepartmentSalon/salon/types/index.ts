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

export interface SalonService {
  salonServiceId: number
  serviceId: number
  serviceNameAr: string
  serviceNameEn: string
  description: string | null
  imageUrl: string | null
  price: number | null
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