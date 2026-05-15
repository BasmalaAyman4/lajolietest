import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  LoginRequest,
  AuthResponse,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/api/admin/AdminAuth/login',
        method: 'POST',
        body,
      }),
    }),

   
    
  }),
})

export const {
  useLoginMutation,
} = authApi