// ─── Contact Us API Service ──────────────────────────────────────────────────

import { api } from '@/services/api'
import type { ContactUs } from '../types'

export const contactUsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET Contact Us details ───────────────────────────────────────────────
    getContactUs: builder.query<ContactUs, void>({
      query: () => '/api/admin/ContactUs',
      providesTags: ['ContactUs'],
    }),

    // ── POST update/save Contact Us details ──────────────────────────────────
    updateContactUs: builder.mutation<void, ContactUs>({
      query: (body) => ({
        url: '/api/admin/ContactUs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ContactUs'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetContactUsQuery,
  useUpdateContactUsMutation,
} = contactUsApi
