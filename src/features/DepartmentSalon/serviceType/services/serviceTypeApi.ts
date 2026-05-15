// ─── ServiceType API ──────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { ServiceType, CreateServiceTypeRequest, UpdateServiceTypeRequest } from '../types'

export interface ServiceCategoryDropdownItem {
  id: number
  name: string
}

export const serviceTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServiceTypes: builder.query<ServiceType[], void>({
      query: () => '/api/admin/ServiceType',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'ServiceType' as const, id })), { type: 'ServiceType', id: 'LIST' }]
          : [{ type: 'ServiceType', id: 'LIST' }],
    }),
    createServiceType: builder.mutation<number, CreateServiceTypeRequest>({
      query: (body) => ({ url: '/api/admin/ServiceType', method: 'POST', body }),
      invalidatesTags: [{ type: 'ServiceType', id: 'LIST' }],
    }),
    updateServiceType: builder.mutation<void, UpdateServiceTypeRequest>({
      query: (body) => ({ url: '/api/admin/ServiceType', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServiceType', id }],
    }),
    deleteServiceType: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/ServiceType?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'ServiceType', id }],
    }),
    // ── POST upload service type image ───────────────────────────────────────────
    uploadServiceTypeImage: builder.mutation<void, { serviceTypeId: number; file: File }>({
      query: ({ serviceTypeId, file }) => {
        const body = new FormData()
        body.append('ServiceTypeId', String(serviceTypeId))
        body.append('ServicePicture', file)
        return { url: '/api/admin/ServiceType/addServiceImage', method: 'POST', body }
      },
      invalidatesTags: (_r, _e, { serviceTypeId }) => [{ type: 'ServiceType', id: serviceTypeId }],
    }),
    // ── GET service category dropdown ────────────────────────────────────────
    getServiceCategoryDropdown: builder.query<ServiceCategoryDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getServiceCategoryDropdown',
      providesTags: [{ type: 'ServiceCategory', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetServiceTypesQuery,
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
  useDeleteServiceTypeMutation,
  useUploadServiceTypeImageMutation,
  useGetServiceCategoryDropdownQuery,
} = serviceTypeApi