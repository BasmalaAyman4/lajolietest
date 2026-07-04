// ── App Option (singleton settings object — GET and POST use the same shape) ──
export interface AppOption {
  wallet: boolean
  addPoint: boolean
  deductPoint: boolean
  chat: boolean
  tryItem: boolean
  visa: boolean
  follow: boolean
  reels: boolean
  affiliateProgram: boolean
  startUpMedia: boolean
  qrCodeExpirationMinutes: number
}