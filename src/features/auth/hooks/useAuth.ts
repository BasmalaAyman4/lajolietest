// ─── useAuth ──────────────────────────────────────────────────────────────────
//
//  Central hook for all auth actions across the app.
//  Wraps RTK Query mutations + Redux dispatch so pages stay thin.

import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import {
  setCredentials,
  logout as logoutAction,
} from '../services/authSlice'
import {
  useLoginMutation
} from '../services/authApi'
import type { LoginRequest } from '../types'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const auth = useAppSelector((s) => s.auth)

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation()

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap()


      dispatch(setCredentials(result))
      navigate('/')
    } catch {
      toast.error('Invalid username or password')
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    dispatch(logoutAction())
    navigate('/login')
  }

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    pendingUserId: auth.pendingUserId,

    // Loading states
    isLoginLoading,

    // Actions
    login,
    logout
  }
}