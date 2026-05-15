// ─── Report API ───────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { Report, CreateReportRequest, UpdateReportRequest } from '../types'

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all reports ────────────────────────────────────────────────────
    getReports: builder.query<Report[], void>({
      query: () => '/api/admin/ReportIssueType',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Report' as const, id })),
              { type: 'Report', id: 'LIST' },
            ]
          : [{ type: 'Report', id: 'LIST' }],
    }),

    // ── POST create → returns new id ────────────────────────────────────────
    createReport: builder.mutation<number, CreateReportRequest>({
      query: (body) => ({ url: '/api/admin/ReportIssueType', method: 'POST', body }),
      invalidatesTags: [{ type: 'Report', id: 'LIST' }],
    }),

    // ── PUT update ──────────────────────────────────────────────────────────
    updateReport: builder.mutation<void, UpdateReportRequest>({
      query: (body) => ({ url: '/api/admin/ReportIssueType', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Report', id }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteReport: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/ReportIssueType?id=${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Report', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
} = reportApi
