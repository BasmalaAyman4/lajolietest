
import { api } from '@/services/api'
import type { TermsType, CreateTermsTypeRequest, UpdateTermsTypeRequest } from '../types'

export const termsTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTermsTypes: builder.query<TermsType[], void>({
      query: () => '/api/admin/TermsAndConditionType',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'TermsType' as const, id })), { type: 'TermsType', id: 'LIST' }]
          : [{ type: 'TermsType', id: 'LIST' }],
    }),
    createTermsType: builder.mutation<number, CreateTermsTypeRequest>({
      query: (body) => ({ url: '/api/admin/TermsAndConditionType', method: 'POST', body }),
      invalidatesTags: [{ type: 'TermsType', id: 'LIST' }],
    }),
    updateTermsType: builder.mutation<void, UpdateTermsTypeRequest>({
      query: (body) => ({ url: '/api/admin/TermsAndConditionType', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'TermsType', id }],
    }),
    deleteTermsType: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/TermsAndConditionType/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'TermsType', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTermsTypesQuery,
  useCreateTermsTypeMutation,
  useUpdateTermsTypeMutation,
  useDeleteTermsTypeMutation,
} = termsTypeApi