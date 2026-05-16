// ─── HowToUse API ─────────────────────────────────────────────────────────────

import { api } from '@/services/api'
import type { HowToUse, DropdownItem, CreateHowToUsePayload } from '../types'

/** Build FormData from the payload — required because API accepts multipart */
function buildFormData(payload: CreateHowToUsePayload): FormData {
  const fd = new FormData()
  fd.append('TitleEn', payload.titleEn)
  fd.append('TitleAr', payload.titleAr)
  fd.append('DescriptionEn', payload.descriptionEn)
  fd.append('DescriptionAr', payload.descriptionAr)
  fd.append('HowToUsePurposeId', String(payload.howToUsePurposeId))
  fd.append('HowToUseMediaTypeId', String(payload.howToUseMediaTypeId))
  fd.append('SortOrder', String(payload.sortOrder))
  fd.append('IsActive', String(payload.isActive))
  if (payload.image) fd.append('Image', payload.image)
  if (payload.video) fd.append('Video', payload.video)
  return fd
}

export const howToUseApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET all ─────────────────────────────────────────────────────────────
    getHowToUses: builder.query<HowToUse[], void>({
      query: () => '/api/admin/HowToUse',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'HowToUse' as const, id })),
              { type: 'HowToUse', id: 'LIST' },
            ]
          : [{ type: 'HowToUse', id: 'LIST' }],
    }),

    // ── POST create (multipart) ─────────────────────────────────────────────
    createHowToUse: builder.mutation<number, CreateHowToUsePayload>({
      query: (payload) => ({
        url: '/api/admin/HowToUse',
        method: 'POST',
        body: buildFormData(payload),
      }),
      invalidatesTags: [{ type: 'HowToUse', id: 'LIST' }],
    }),

    // ── DELETE ──────────────────────────────────────────────────────────────
    deleteHowToUse: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/HowToUse/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'HowToUse', id },
        { type: 'HowToUse', id: 'LIST' },
      ],
    }),

    // ── Dropdowns ───────────────────────────────────────────────────────────
    getMediaTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getHowToUseMediaTypeDropdown',
    }),
    getPurposeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getHowToUsePurposeDropdown',
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetHowToUsesQuery,
  useCreateHowToUseMutation,
  useDeleteHowToUseMutation,
  useGetMediaTypeDropdownQuery,
  useGetPurposeDropdownQuery,
} = howToUseApi
