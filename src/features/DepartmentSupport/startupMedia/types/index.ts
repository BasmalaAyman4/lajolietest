
export interface StartupMedia {
  id: number
  startupMediaTypeId: number
  startupMediaTypeName: string
  fileLocalPath: string | null
  filePath: string | null        // main media URL (image or video)
  thumbnailLocalPath: string | null
  thumbnailPath: string | null   // video thumbnail URL
  fromDate: string               // ISO date-time from API
  toDate: string                 // ISO date-time from API
  webFlag: boolean
  appFlag: boolean
  isActive: boolean
  isDeleted: boolean
  createdDate: string
}

// ── Create uses FormData (multipart) ─────────────────────────────────────────
export interface CreateStartupMediaPayload {
  startupMediaTypeId: number
  fromDate: string        // "YYYY-MM-DD" → sent as date-time
  toDate: string          // "YYYY-MM-DD" → sent as date-time
  webFlag: boolean
  appFlag: boolean
  isActive: boolean
  image?: File | null
  video?: File | null
}

// ── Update — Id required; files optional (omit = keep existing) ──────────────
export interface UpdateStartupMediaPayload {
  id: number
  startupMediaTypeId?: number
  fromDate?: string
  toDate?: string
  webFlag?: boolean
  appFlag?: boolean
  isActive?: boolean
  image?: File | null
  video?: File | null
}

export interface DropdownItem {
  id: number
  name: string
}

// Media type IDs from the API
export const MEDIA_TYPE = {
  IMAGE: 1,
  VIDEO: 2,
} as const
