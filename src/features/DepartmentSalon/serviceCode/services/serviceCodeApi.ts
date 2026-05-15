// ─── Service Code API ──────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { ServiceCode, CreateServiceCodeRequest, UpdateServiceCodeRequest } from '../types'

export const serviceCodeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all Service Codes ──────────────────────────────────────────────────────
    getServiceCodes: builder.query<ServiceCode[], void>({
      query: () => '/api/admin/SalonServiceCode',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ServiceCode' as const, id })),
              { type: 'ServiceCode', id: 'LIST' },
            ]
          : [{ type: 'ServiceCode', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createServiceCode: builder.mutation<number, CreateServiceCodeRequest>({
      query: (body) => ({ url: '/api/admin/SalonServiceCode', method: 'POST', body }),
      invalidatesTags: [{ type: 'ServiceCode', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateServiceCode: builder.mutation<void, UpdateServiceCodeRequest>({
      query: (body) => ({ url: '/api/admin/SalonServiceCode', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServiceCode', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteServiceCode: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/SalonServiceCode?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'ServiceCode', id }],
    }),

    // ── POST upload service code image ─────────────────────────────────────────────
    uploadServiceCodeImage: builder.mutation<void, { serviceCodeId: number; file: File }>({
      query: ({ serviceCodeId, file }) => {
        const body = new FormData()
        body.append('ServiceId', String(serviceCodeId))
        body.append('ServicePicture', file)
        return { url: '/api/admin/SalonServiceCode/addServiceImage', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { serviceCodeId }) => [{ type: 'ServiceCode', id: serviceCodeId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetServiceCodesQuery,
  useCreateServiceCodeMutation,
  useUpdateServiceCodeMutation,
  useDeleteServiceCodeMutation,
  useUploadServiceCodeImageMutation,
} = serviceCodeApi
