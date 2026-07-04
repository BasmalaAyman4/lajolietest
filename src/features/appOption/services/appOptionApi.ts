import { api } from '@/services/api'
import type { AppOption } from '../types'

// NOTE: make sure 'AppOption' is added to the shared `api`'s tagTypes
// (services/api.ts) alongside the existing 'AdminDiscount', 'SuggestionRoutine', etc.

export const appOptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppOption: builder.query<AppOption, void>({
      query: () => '/api/admin/AppOption',
      providesTags: [{ type: 'AppOption', id: 'SETTINGS' }],
    }),

    updateAppOption: builder.mutation<void, AppOption>({
      query: (body) => ({
        url: '/api/admin/AppOption',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AppOption', id: 'SETTINGS' }],
    }),
  }),
  overrideExisting: false,
})

export const { useGetAppOptionQuery, useUpdateAppOptionMutation } = appOptionApi