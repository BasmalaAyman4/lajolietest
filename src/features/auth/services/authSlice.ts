

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, AuthResponse } from '../types'

// ── localStorage keys ─────────────────────────────────────────────────────────
const TOKEN_KEY = 'token'
const USER_KEY = 'auth_user'

function persistTokens(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function persistUser(user: AuthState['user']) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}


function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function loadUser(): AuthState['user'] {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Initial state — rehydrate from localStorage on page refresh ───────────────
const initial: AuthState = {
  user: loadUser(),
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  pendingUserId: null,
  // ← removed refreshToken: null
}
// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    /**
     * Called after successful login (isPhoneVerified=true)
     * OR after successful verifyPhone
     */
setCredentials(state, action: PayloadAction<AuthResponse>) {
  const { token, ...user } = action.payload  // no refreshToken to destructure
  state.user = user
  state.token = token
  state.isAuthenticated = true
  state.pendingUserId = null
  persistTokens(token)
  persistUser(user)
},

    /** Logout — clear everything */
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.pendingUserId = null
      clearTokens()                              // ← also removes USER_KEY
    },
  },
})

export const { setCredentials, logout } =
  authSlice.actions
export default authSlice.reducer