// ─── Product API ──────────────────────────────────────────────────────────────
//
//  All product-related RTK Query endpoints.
//  Covers: CRUD, details (colors/sizes), packaging, images.

import { api } from '@/services/api'
import type {
  ProductListResponse,
  ProductFull,
  CreateProductRequest,
  UpdateProductRequest,
  DropdownItem,
  SubCategoryDropdownItem,
  ProductTypeDetailDropdownItem,
  SaveProductDetailsRequest,
  UpdateProductDetailsRequest,
  SavePackagingRequest,
  ProductColorListItem,
} from '../types'

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET paginated products ────────────────────────────────────────────────
    getProducts: builder.query<
      ProductListResponse,
      { pageNo: number; pageSize: number; searchText?: string }
    >({
      query: ({ pageNo, pageSize, searchText }) => {
        const params = new URLSearchParams({
          pageNo: String(pageNo),
          pageSize: String(pageSize),
        })
        if (searchText) params.set('searchText', searchText)
        return `/api/admin/Product?${params.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // ── GET single product by ID ──────────────────────────────────────────────
    getProduct: builder.query<ProductFull, number>({
      query: (id) => `/api/admin/Product/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    // ── POST create product ───────────────────────────────────────────────────
    createProduct: builder.mutation<number, CreateProductRequest>({
      query: (body) => ({ url: '/api/admin/Product', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // ── PUT update product ────────────────────────────────────────────────────
    updateProduct: builder.mutation<void, UpdateProductRequest>({
      query: (body) => ({ url: '/api/admin/Product', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // ── DELETE product ────────────────────────────────────────────────────────
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/admin/Product/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    // ── POST save product details (color + sizes) ─────────────────────────────
    saveProductDetails: builder.mutation<void, SaveProductDetailsRequest>({
      query: (body) => ({
        url: '/api/admin/Product/saveProductDetails',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Product', id: productId }],
    }),

    // ── PUT update product details ────────────────────────────────────────────
    updateProductDetails: builder.mutation<void, UpdateProductDetailsRequest>({
      query: (body) => ({
        url: '/api/admin/Product/updateProductDetails',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Product', id: productId }],
    }),

    // ── DELETE stop product detail ────────────────────────────────────────────
    stopProductDetail: builder.mutation<void, number>({
      query: (detailId) => ({
        url: `/api/admin/Product/stopDetail?detailId=${detailId}`,
        method: 'DELETE',
      }),
    }),

    // ── DELETE delete product detail ──────────────────────────────────────────
    deleteProductDetail: builder.mutation<void, number>({
      query: (detailId) => ({
        url: `/api/admin/Product/deleteDetail?detailId=${detailId}`,
        method: 'DELETE',
      }),
    }),

    // ── GET product colors list ───────────────────────────────────────────────
    getProductColors: builder.query<ProductColorListItem[], number>({
      query: (productId) => `/api/admin/Product/getProductColors/${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'Product', id: `COLORS_${productId}` }],
    }),

    // ── POST add product images ───────────────────────────────────────────────
    addProductImages: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: '/api/admin/Product/addProductImages',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_r, _e, formData) => {
        const productId = formData.get('ProductId')
        return productId
          ? [{ type: 'Product' as const, id: Number(productId) }]
          : []
      },
    }),

    // ── PUT set primary image ─────────────────────────────────────────────────
    setPrimaryImage: builder.mutation<
      void,
      { productId: number; colorId: number; imageId: number }
    >({
      query: (body) => ({
        url: '/api/admin/Product/setPrimaryImage',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Product' as const, id: productId }],
    }),

    // ── DELETE product image ──────────────────────────────────────────────────
    deleteProductImage: builder.mutation<void, { imageId: number; productId: number }>({
      query: ({ imageId }) => ({
        url: `/api/admin/Product/deleteProductImage?imageId=${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Product' as const, id: productId }],
    }),

    // ── POST save product packaging ───────────────────────────────────────────
    saveProductPackaging: builder.mutation<void, SavePackagingRequest>({
      query: (body) => ({
        url: '/api/admin/Product/savePackaging',
        method: 'POST',
        body,
      }),
    }),

    // ── DELETE stop packaging ─────────────────────────────────────────────────
    stopPackaging: builder.mutation<void, number>({
      query: (productPackagingId) => ({
        url: `/api/admin/Product/stopPackaging?productPackagingId=${productPackagingId}`,
        method: 'DELETE',
      }),
    }),

    // ── Dropdowns ─────────────────────────────────────────────────────────────
    getCategoryDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getCategoryDropdown',
      providesTags: [{ type: 'Dropdown', id: 'CATEGORY' }],
    }),

    getSubCategoryDropdown: builder.query<SubCategoryDropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSubCategoryDropdown',
      providesTags: [{ type: 'Dropdown', id: 'SUBCATEGORY' }],
    }),

    getProductTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getProductTypeDropdown',
      providesTags: [{ type: 'Dropdown', id: 'PRODUCT_TYPE' }],
    }),

    getProductTypeDetailDropdown: builder.query<ProductTypeDetailDropdownItem[], number>({
      query: (productTypeId) =>
        `/api/admin/BasicData/getProductTypeDetailDropdown?productTypeId=${productTypeId}`,
      providesTags: (_r, _e, id) => [{ type: 'Dropdown', id: `PTD_${id}` }],
    }),

    getBrandDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBrandDropdown',
      providesTags: [{ type: 'Dropdown', id: 'BRAND' }],
    }),

    getHairTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getHairTypeDropdown',
      providesTags: [{ type: 'Dropdown', id: 'HAIR_TYPE' }],
    }),

    getSkinTypeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSkinTypeDropdown',
      providesTags: [{ type: 'Dropdown', id: 'SKIN_TYPE' }],
    }),

    getBeautyCategoryDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getBeautyCategoryDropdown',
      providesTags: [{ type: 'Dropdown', id: 'BEAUTY_CAT' }],
    }),

    getConcernDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getConcernDropdown',
      providesTags: [{ type: 'Dropdown', id: 'CONCERN' }],
    }),

    getInterestDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getInterestDropdown',
      providesTags: [{ type: 'Dropdown', id: 'INTEREST' }],
    }),

    getGoalDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getGoalDropdown',
      providesTags: [{ type: 'Dropdown', id: 'GOAL' }],
    }),

    getSizeDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getSizeDropdown',
      providesTags: [{ type: 'Dropdown', id: 'SIZE' }],
    }),

    getHeadColorDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getHeadColorDropdown',
      providesTags: [{ type: 'Dropdown', id: 'HEAD_COLOR' }],
    }),

    getPackagingDropdown: builder.query<DropdownItem[], void>({
      query: () => '/api/admin/BasicData/getPackagingDropdown',
      providesTags: [{ type: 'Dropdown', id: 'PACKAGING' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  // Product CRUD
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Product Details (colors/sizes)
  useSaveProductDetailsMutation,
  useUpdateProductDetailsMutation,
  useStopProductDetailMutation,
  useDeleteProductDetailMutation,
  useGetProductColorsQuery,

  // Images
  useAddProductImagesMutation,
  useSetPrimaryImageMutation,
  useDeleteProductImageMutation,

  // Packaging
  useSaveProductPackagingMutation,
  useStopPackagingMutation,

  // Dropdowns
  useGetCategoryDropdownQuery,
  useGetSubCategoryDropdownQuery,
  useGetProductTypeDropdownQuery,
  useGetProductTypeDetailDropdownQuery,
  useGetBrandDropdownQuery,
  useGetHairTypeDropdownQuery,
  useGetSkinTypeDropdownQuery,
  useGetBeautyCategoryDropdownQuery,
  useGetConcernDropdownQuery,
  useGetInterestDropdownQuery,
  useGetGoalDropdownQuery,
  useGetSizeDropdownQuery,
  useGetHeadColorDropdownQuery,
  useGetPackagingDropdownQuery,
} = productApi