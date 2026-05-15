// ─── Concern API ──────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Concern, CreateConcernRequest, UpdateConcernRequest } from '../types'

export interface BeautyCategoryDropdownItem {
  id: number
  name: string
}

export const concernApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConcerns: builder.query<Concern[], void>({
      query: () => '/api/admin/Concern',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Concern' as const, id })), { type: 'Concern', id: 'LIST' }]
          : [{ type: 'Concern', id: 'LIST' }],
    }),
    createConcern: builder.mutation<number, CreateConcernRequest>({
      query: (body) => ({ url: '/api/admin/Concern', method: 'POST', body }),
      invalidatesTags: [{ type: 'Concern', id: 'LIST' }],
    }),
    updateConcern: builder.mutation<void, UpdateConcernRequest>({
      query: (body) => ({ url: '/api/admin/Concern', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Concern', id }],
    }),
    deleteConcern: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Concern/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Concern', id }],
    }),
    // ── POST upload concern image ───────────────────────────────────────────
    uploadConcernImage: builder.mutation<void, { concernId: number; file: File }>({
      query: ({ concernId, file }) => {
        const body = new FormData()
        body.append('ConcernId', String(concernId))
        body.append('Picture', file)
        return { url: '/api/admin/Concern/addConcernImages', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { concernId }) => [{ type: 'Concern', id: concernId }],
    }),
    // ── GET beauty category dropdown ────────────────────────────────────────
    getBeautyCategoryDropdown: builder.query<BeautyCategoryDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBeautyCategoryDropdown',
      providesTags: [{ type: 'BeautyCategory', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetConcernsQuery,
  useCreateConcernMutation,
  useUpdateConcernMutation,
  useDeleteConcernMutation,
  useUploadConcernImageMutation,
  useGetBeautyCategoryDropdownQuery,
} = concernApi