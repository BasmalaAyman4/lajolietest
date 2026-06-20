import { api } from '@/services/api'
import type { SalonDropdownItem, SendSmsRequest } from '../types'

export const sendSmsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSalonDropdown: builder.query<SalonDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSalonDropdown',
    }),

    sendSmsToSalons: builder.mutation<void, SendSmsRequest>({
      query: (body) => ({
        url: '/api/admin/Salon/sendSmsToSalons',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSalonDropdownQuery,
  useSendSmsToSalonsMutation,
} = sendSmsApi