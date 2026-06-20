import { api } from '@/services/api'
import type {
  SubCategory,
  CreateSubCategoryRequest,
  UpdateSubCategoryRequest,
  CategoryOption,
} from '../types'

export const subCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET all specialists ─────────────────────────────────────────────────
    getSubCategory: builder.query<SubCategory[], void>({
      query: () => '/api/admin/SubCategory',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SubCategory' as const, id })),
              { type: 'SubCategory', id: 'LIST' },
            ]
          : [{ type: 'SubCategory', id: 'LIST' }],
    }),

    // ── POST create specialist → returns new specialist id ──────────────────
    createSubCategory: builder.mutation<number, CreateSubCategoryRequest>({
      query: (body) => ({
        url: '/api/admin/SubCategory',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SubCategory', id: 'LIST' }],
    }),

    // ── PUT update specialist ───────────────────────────────────────────────
    updateSubCategory: builder.mutation<void, UpdateSubCategoryRequest>({
      query: (body) => ({
        url: '/api/admin/SubCategory',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'SubCategory', id }],
    }),

    // ── DELETE specialist by id ─────────────────────────────────────────────
    deleteSubCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/admin/SubCategory?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'SubCategory', id }],
    }),

    // ── POST upload specialist image ────────────────────────────────────────
    uploadSubCategoryImage: builder.mutation<void, { subCategoryId: number; file: File }>({
      query: ({ subCategoryId, file }) => {
        const body = new FormData()
        body.append('SubCategoryId ', String(subCategoryId))
        body.append('SubCategoryPicture', file)
        return {
          url: '/api/admin/SubCategory/addSubCategoryImages',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (_result, _error, { subCategoryId }) => [
        { type: 'SubCategory', id: subCategoryId },
      ],
    }),

    // ── GET jobs dropdown ───────────────────────────────────────────────────
    getCategoryDropdown: builder.query<CategoryOption[], void>({
      query: () => '/api/admin/BasicData/getCategoryDropdown',
      providesTags: [{ type: 'Dropdown', id: 'JOBS' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSubCategoryQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useUploadSubCategoryImageMutation,
  useGetCategoryDropdownQuery,
} = subCategoryApi