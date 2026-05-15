import { api } from '@/services/api'
import type {
  City,
  CreateCityRequest,
  UpdateCityRequest,
  CountryOption,
} from '../types'

export const cityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all specialists ─────────────────────────────────────────────────
    getCity: builder.query<City[], void>({
      query: () => '/api/admin/City',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'City' as const, id })),
              { type: 'City', id: 'LIST' },
            ]
          : [{ type: 'City', id: 'LIST' }],
    }),

    // ── POST create specialist → returns new specialist id ──────────────────
    createCity: builder.mutation<number, CreateCityRequest>({
      query: (body) => ({
        url: '/api/admin/City',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'City', id: 'LIST' }],
    }),

    // ── PUT update specialist ───────────────────────────────────────────────
    updateCity: builder.mutation<void, UpdateCityRequest>({
      query: (body) => ({
        url: '/api/admin/City',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'City', id }],
    }),

    // ── DELETE specialist by id ─────────────────────────────────────────────
    deleteCity: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/City?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'City', id }],
    }),



    // ── GET jobs dropdown ───────────────────────────────────────────────────
    getCountryDropdown: builder.query<CountryOption[], void>({
      query: () => '/api/admin/BasicData/getCountryDropdown',
      providesTags: [{ type: 'Dropdown', id: 'Countries' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCityQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetCountryDropdownQuery,
} = cityApi