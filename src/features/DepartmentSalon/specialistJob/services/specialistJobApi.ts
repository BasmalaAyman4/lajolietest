// ─── Size API ─────────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { SpecialistJob, CreateSpecialistJobRequest, UpdateSpecialistJobRequest } from '../types'

export const specialistJobApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSpecialistJobs: builder.query<SpecialistJob[], void>({
      query: () => '/api/admin/SpecialistJob',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'SpecialistJob' as const, id })), { type: 'SpecialistJob', id: 'LIST' }]
          : [{ type: 'SpecialistJob', id: 'LIST' }],
    }),
    createSpecialistJob: builder.mutation<number, CreateSpecialistJobRequest>({
      query: (body) => ({ url: '/api/admin/SpecialistJob', method: 'POST', body }),
      invalidatesTags: [{ type: 'SpecialistJob', id: 'LIST' }],
    }),
    updateSpecialistJob: builder.mutation<void, UpdateSpecialistJobRequest>({
      query: (body) => ({ url: '/api/admin/SpecialistJob', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'SpecialistJob', id }],
    }),
    deleteSpecialistJob: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/SpecialistJob?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'SpecialistJob', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSpecialistJobsQuery,
  useCreateSpecialistJobMutation,
  useUpdateSpecialistJobMutation,
  useDeleteSpecialistJobMutation,
} = specialistJobApi