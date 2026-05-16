import { api } from '@/services/api'
import type {
    DefaultImage,
    CreateDefaultImageRequest,
    UpdateDefaultImageRequest,
    ImageSectionOption,
    ImagePhotoTypeOption
} from '../types'

export const defaultImageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDefaultImage: builder.query<DefaultImage[], void>({
      query: () => '/api/admin/DefaultImage',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'DefaultImage' as const, id })),
              { type: 'DefaultImage', id: 'LIST' },
            ]
          : [{ type: 'DefaultImage', id: 'LIST' }],
    }),

    createDefaultImage: builder.mutation<number, CreateDefaultImageRequest>({
      query: (body) => ({
        url: '/api/admin/DefaultImage',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'DefaultImage', id: 'LIST' }],
    }),

    // ── PUT update specialist ───────────────────────────────────────────────
    updateDefaultImage: builder.mutation<void, UpdateDefaultImageRequest>({
      query: (body) => ({
        url: '/api/admin/DefaultImage',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DefaultImage', id }],
    }),

    // ── DELETE specialist by id ─────────────────────────────────────────────
    deleteDefaultImage: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/DefaultImage/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'DefaultImage', id }],
    }),

    // ── POST upload specialist image ────────────────────────────────────────
    uploadDefaultImage: builder.mutation<void, { defaultImageId: number; file: File }>({
      query: ({ defaultImageId, file }) => {
        const body = new FormData()
        body.append('Id', String(defaultImageId))
        body.append('ImageFile', file)
        return {
          url: '/api/admin/DefaultImage/uploadImage',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_result, _error, { defaultImageId }) => [
        { type: 'DefaultImage', id: defaultImageId },
      ],
    }),

    // ── GET jobs dropdown ───────────────────────────────────────────────────
    getImageSectionDropdown: builder.query<ImageSectionOption[], void>({
      query: () => '/api/admin/BasicData/getDefaultImageSectionDropdown',
      providesTags: [{ type: 'Dropdown', id: 'ImageSection' }],
    }),
    getImagePhotoTypeDropdown: builder.query<ImagePhotoTypeOption[], void>({
        query: () => '/api/admin/BasicData/getDefaultImagePhotoTypeDropdown',
        providesTags: [{ type: 'Dropdown', id: 'ImagePhotoType' }],
      }),
  }),
  overrideExisting: false,
})

export const {
  useGetDefaultImageQuery,
  useCreateDefaultImageMutation,
  useUpdateDefaultImageMutation,
  useDeleteDefaultImageMutation,
  useUploadDefaultImageMutation,
  useGetImageSectionDropdownQuery,
  useGetImagePhotoTypeDropdownQuery,

} = defaultImageApi