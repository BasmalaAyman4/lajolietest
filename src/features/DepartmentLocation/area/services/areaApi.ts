import { api } from '@/services/api'
import type {
  Area,
  CreateAreaRequest,
  UpdateAreaRequest,
  CityOption,
} from '../types'

export const areaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all specialists ─────────────────────────────────────────────────
    getArea: builder.query<Area[], void>({
      query: () => '/api/admin/Area',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Area' as const, id })),
              { type: 'Area', id: 'LIST' },
            ]
          : [{ type: 'Area', id: 'LIST' }],
    }),

    // ── POST create specialist → returns new specialist id ──────────────────
    createArea: builder.mutation<number, CreateAreaRequest>({
      query: (body) => ({
        url: '/api/admin/Area',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Area', id: 'LIST' }],
    }),

    // ── PUT update specialist ───────────────────────────────────────────────
    updateArea: builder.mutation<void, UpdateAreaRequest>({
      query: (body) => ({
        url: '/api/admin/Area',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Area', id }],
    }),

    // ── DELETE specialist by id ─────────────────────────────────────────────
    deleteArea: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Area?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Area', id }],
    }),



    // ── GET jobs dropdown ───────────────────────────────────────────────────
    getCityDropdown: builder.query<CityOption[], void>({
      query: () => '/api/admin/BasicData/getCityDropdown',
      providesTags: [{ type: 'Dropdown', id: 'Cities' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAreaQuery,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
  useGetCityDropdownQuery,
} = areaApi