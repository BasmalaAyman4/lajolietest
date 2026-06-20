// ─── StartupMedia API ─────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type {
  StartupMedia,
  DropdownItem,
  CreateStartupMediaPayload,
  UpdateStartupMediaPayload,
} from '../types'

/** "YYYY-MM-DD" → "YYYY-MM-DDT00:00:00" for $date-time fields */
const toDateTime = (d: string) => (d ? `${d}T00:00:00` : '')

function buildCreateFormData(payload: CreateStartupMediaPayload): FormData {
  const fd = new FormData()
  fd.append('StartupMediaTypeId', String(payload.startupMediaTypeId))
  fd.append('FromDate', toDateTime(payload.fromDate))
  fd.append('ToDate',   toDateTime(payload.toDate))
  fd.append('WebFlag',  String(payload.webFlag))
  fd.append('AppFlag',  String(payload.appFlag))
  fd.append('IsActive', String(payload.isActive))
  if (payload.image) fd.append('Image', payload.image)
  if (payload.video) fd.append('Video', payload.video)
  return fd
}

function buildUpdateFormData(payload: UpdateStartupMediaPayload): FormData {
  const fd = new FormData()
  fd.append('Id', String(payload.id))
  if (payload.startupMediaTypeId !== undefined)
    fd.append('StartupMediaTypeId', String(payload.startupMediaTypeId))
  if (payload.fromDate !== undefined) fd.append('FromDate', toDateTime(payload.fromDate))
  if (payload.toDate   !== undefined) fd.append('ToDate',   toDateTime(payload.toDate))
  if (payload.webFlag  !== undefined) fd.append('WebFlag',  String(payload.webFlag))
  if (payload.appFlag  !== undefined) fd.append('AppFlag',  String(payload.appFlag))
  if (payload.isActive !== undefined) fd.append('IsActive', String(payload.isActive))
  if (payload.image) fd.append('Image', payload.image)
  if (payload.video) fd.append('Video', payload.video)
  return fd
}

export const startupMediaApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET all ─────────────────────────────────────────────────────────────
    getStartupMedias: builder.query<StartupMedia[], void>({
      query: () => '/api/admin/StartupMedia',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'StartupMedia' as const, id })),
              { type: 'StartupMedia', id: 'LIST' },
            ]
          : [{ type: 'StartupMedia', id: 'LIST' }],
    }),

    // ── POST create (multipart) ─────────────────────────────────────────────
    createStartupMedia: builder.mutation<number, CreateStartupMediaPayload>({
      query: (payload) => ({
        url: '/api/admin/StartupMedia',
        method: 'POST',
        body: buildCreateFormData(payload),
      }),
      invalidatesTags: [{ type: 'StartupMedia', id: 'LIST' }],
    }),

    // ── PUT update (multipart) ──────────────────────────────────────────────
    updateStartupMedia: builder.mutation<void, UpdateStartupMediaPayload>({
      query: (payload) => ({
        url: '/api/admin/StartupMedia',
        method: 'PUT',
        body: buildUpdateFormData(payload),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'StartupMedia', id },
        { type: 'StartupMedia', id: 'LIST' },
      ],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteStartupMedia: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/StartupMedia/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'StartupMedia', id },
        { type: 'StartupMedia', id: 'LIST' },
      ],
    }),

    // ── Dropdown ────────────────────────────────────────────────────────────
    getStartupMediaTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getStartupMediaTypeDropdown',
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetStartupMediasQuery,
  useCreateStartupMediaMutation,
  useUpdateStartupMediaMutation,
  useDeleteStartupMediaMutation,
  useGetStartupMediaTypeDropdownQuery,
} = startupMediaApi
