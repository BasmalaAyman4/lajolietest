export interface SalonDropdownItem {
  id: number
  name: string
}

export interface SendSmsRequest {
  message: string
  salonIds: number[]
}