// ─── Country API ───────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Country, CreateCountryRequest, UpdateCountryRequest } from '../types'

export const countryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all countries ────────────────────────────────────────────────────
    getCountries: builder.query<Country[], void>({
      query: () => '/api/admin/Country',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Country' as const, id })),
              { type: 'Country', id: 'LIST' },
            ]
          : [{ type: 'Country', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createCountry: builder.mutation<number, CreateCountryRequest>({
      query: (body) => ({ url: '/api/admin/Country', method: 'POST', body }),
      invalidatesTags: [{ type: 'Country', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateCountry: builder.mutation<void, UpdateCountryRequest>({
      query: (body) => ({ url: '/api/admin/Country', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Country', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteCountry: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Country?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Country', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCountriesQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
} = countryApi
