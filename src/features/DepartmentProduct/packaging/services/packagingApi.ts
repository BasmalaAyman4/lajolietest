// ─── Packaging API ────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  Packaging,
  CreatePackagingRequest,
  UpdatePackagingRequest,
} from '../types'

export const packagingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all packagings ──────────────────────────────────────────────────
    getPackagings: builder.query<Packaging[], void>({
      query: () => '/api/admin/Packaging',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Packaging' as const, id })),
              { type: 'Packaging', id: 'LIST' },
            ]
          : [{ type: 'Packaging', id: 'LIST' }],
    }),

    // ── POST create packaging → returns new id ──────────────────────────────
    createPackaging: builder.mutation<number, CreatePackagingRequest>({
      query: (body) => ({
        url: '/api/admin/Packaging',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Packaging', id: 'LIST' }],
    }),

    // ── PUT update packaging ────────────────────────────────────────────────
    updatePackaging: builder.mutation<void, UpdatePackagingRequest>({
      query: (body) => ({
        url: '/api/admin/Packaging',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Packaging', id }],
    }),

    // ── DELETE packaging by id ──────────────────────────────────────────────
    deletePackaging: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/Packaging/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Packaging', id }],
    }),

    // ── POST upload packaging image ─────────────────────────────────────────
    uploadPackagingImage: builder.mutation<void, { packagingId: number; file: File }>({
      query: ({ packagingId, file }) => {
        const body = new FormData()
        body.append('PackagingId', String(packagingId))
        body.append('PackagingPicture', file)
        return {
          url: '/api/admin/Packaging/addPackagingImages',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_result, _error, { packagingId }) => [
        { type: 'Packaging', id: packagingId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPackagingsQuery,
  useCreatePackagingMutation,
  useUpdatePackagingMutation,
  useDeletePackagingMutation,
  useUploadPackagingImageMutation,
} = packagingApi
