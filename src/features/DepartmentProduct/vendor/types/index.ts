// ─── Vendor Types ─────────────────────────────────────────────────────────────

export interface Vendor {
  id: number
  name: string
  address: string
  mobile: string
  telephone: string
  email: string
}

export interface CreateVendorRequest {
  name: string
  address: string
  mobile: string
  telephone: string
  email: string
}

export interface UpdateVendorRequest extends CreateVendorRequest {
  id: number
}