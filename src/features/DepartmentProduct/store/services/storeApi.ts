// ─── Store API ────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Store, CreateStoreRequest, UpdateStoreRequest } from '../types'

export const storeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<Store[], void>({
      query: () => '/api/admin/Store',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Store' as const, id })), { type: 'Store', id: 'LIST' }]
          : [{ type: 'Store', id: 'LIST' }],
    }),
    createStore: builder.mutation<number, CreateStoreRequest>({
      query: (body) => ({ url: '/api/admin/Store', method: 'POST', body }),
      invalidatesTags: [{ type: 'Store', id: 'LIST' }],
    }),
    updateStore: builder.mutation<void, UpdateStoreRequest>({
      query: (body) => ({ url: '/api/admin/Store', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Store', id }],
    }),
    deleteStore: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Store/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Store', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} = storeApi