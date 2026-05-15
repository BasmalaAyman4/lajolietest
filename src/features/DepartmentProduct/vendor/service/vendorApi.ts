// ─── Vendor API ───────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Vendor, CreateVendorRequest, UpdateVendorRequest } from '../types'

export const vendorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<Vendor[], void>({
      query: () => '/api/admin/Vendor',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Vendor' as const, id })), { type: 'Vendor', id: 'LIST' }]
          : [{ type: 'Vendor', id: 'LIST' }],
    }),
    createVendor: builder.mutation<number, CreateVendorRequest>({
      query: (body) => ({ url: '/api/admin/Vendor', method: 'POST', body }),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),
    updateVendor: builder.mutation<void, UpdateVendorRequest>({
      query: (body) => ({ url: '/api/admin/Vendor', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Vendor', id }],
    }),
    deleteVendor: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Vendor/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Vendor', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApi