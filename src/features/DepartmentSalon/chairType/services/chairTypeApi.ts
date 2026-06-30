import { api } from '@/services/api'
import type {
  ChairType,
  CreateChairTypeRequest,
  UpdateChairTypeRequest,
} from '../types'

export const chairTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all chair types ───────────────────────────────────────────
    getChairTypes: builder.query<ChairType[], void>({
      query: () => '/api/admin/ChairType',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ChairType' as const, id })),
              { type: 'ChairType', id: 'LIST' },
            ]
          : [{ type: 'ChairType', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createChairType: builder.mutation<number, CreateChairTypeRequest>({
      query: (body) => ({ url: '/api/admin/ChairType', method: 'POST', body }),
      invalidatesTags: [{ type: 'ChairType', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateChairType: builder.mutation<void, UpdateChairTypeRequest>({
      query: (body) => ({ url: '/api/admin/ChairType', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ChairType', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteChairType: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/ChairType?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'ChairType', id }],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetChairTypesQuery,
  useCreateChairTypeMutation,
  useUpdateChairTypeMutation,
  useDeleteChairTypeMutation,
} = chairTypeApi
