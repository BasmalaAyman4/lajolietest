import { api } from '@/services/api'
import type {
  TermsAndConditions,
  CreateTermsAndConditionsRequest,
  TermsTypeDropdown,
} from '../types'

export const termsAndConditionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query<TermsAndConditions[], void>({
      query: () => '/api/admin/TermsAndConditions',
      providesTags: [{ type: 'TermsAndConditions', id: 'LIST' }],
    }),

    getTermsTypeDropdown: builder.query<TermsTypeDropdown[], void>({
      query: () => '/api/admin/BasicData/getTermsAndConditionTypeDropdown',
    }),

    createTermsAndConditions: builder.mutation<number, CreateTermsAndConditionsRequest>({
      query: (body) => ({ url: '/api/admin/TermsAndConditions', method: 'POST', body }),
      invalidatesTags: [{ type: 'TermsAndConditions', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTermsAndConditionsQuery,
  useGetTermsTypeDropdownQuery,
  useCreateTermsAndConditionsMutation,
} = termsAndConditionsApi