// ─── Auth Feature Types ───────────────────────────────────────────────────────

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  userId: number
  userName: string
  name: string
  role: number
  createdDate: string
  token: string
}

export interface AuthState {
  user: Omit<AuthResponse, 'token'> | null
  token: string | null
  isAuthenticated: boolean
  pendingUserId: number | null
}