// ─── HeadColor API ────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { HeadColor, CreateHeadColorRequest, UpdateHeadColorRequest } from '../types'

export const headColorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHeadColors: builder.query<HeadColor[], void>({
      query: () => '/api/admin/HeadColor',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'HeadColor' as const, id })), { type: 'HeadColor', id: 'LIST' }]
          : [{ type: 'HeadColor', id: 'LIST' }],
    }),
    createHeadColor: builder.mutation<number, CreateHeadColorRequest>({
      query: (body) => ({ url: '/api/admin/HeadColor', method: 'POST', body }),
      invalidatesTags: [{ type: 'HeadColor', id: 'LIST' }],
    }),
    updateHeadColor: builder.mutation<void, UpdateHeadColorRequest>({
      query: (body) => ({ url: '/api/admin/HeadColor', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'HeadColor', id }],
    }),
    deleteHeadColor: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/HeadColor/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'HeadColor', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetHeadColorsQuery,
  useCreateHeadColorMutation,
  useUpdateHeadColorMutation,
  useDeleteHeadColorMutation,
} = headColorApi