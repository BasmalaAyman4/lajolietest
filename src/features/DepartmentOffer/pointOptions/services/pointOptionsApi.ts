import { api } from '@/services/api'
import type { PointOption } from '../types'

export const pointOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPointOption: builder.query<PointOption, void>({
      query: () => '/api/admin/PointOption',
      providesTags: ['PointOption'],
    }),

    savePointOption: builder.mutation<void, PointOption>({
      query: (body) => ({
        url: '/api/admin/PointOption',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PointOption'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPointOptionQuery,
  useSavePointOptionMutation,
} = pointOptionsApi
