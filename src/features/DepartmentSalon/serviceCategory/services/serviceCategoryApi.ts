// ─── ServiceCategory API ───────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  ServiceCategory,
  CreateServiceCategoryRequest,
  UpdateServiceCategoryRequest,
} from '../types'

export const serviceCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all beauty categories ───────────────────────────────────────────
    getServiceCategories: builder.query<ServiceCategory[], void>({
      query: () => '/api/admin/ServiceCategory',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ServiceCategory' as const, id })),
              { type: 'ServiceCategory', id: 'LIST' },
            ]
          : [{ type: 'ServiceCategory', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createServiceCategory: builder.mutation<number, CreateServiceCategoryRequest>({
      query: (body) => ({ url: '/api/admin/ServiceCategory', method: 'POST', body }),
      invalidatesTags: [{ type: 'ServiceCategory', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateServiceCategory: builder.mutation<void, UpdateServiceCategoryRequest>({
      query: (body) => ({ url: '/api/admin/ServiceCategory', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServiceCategory', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteServiceCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/ServiceCategory/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'ServiceCategory', id }],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
} = serviceCategoryApi
