import { baseApi } from './baseApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/product',
        method: 'GET',
        params,
      }),
      providesTags: ['Products'],
    }),
    getProductById: builder.query({
      query: (id) => `/product/${id}`,
      providesTags: (_, __, id) => [{ type: 'Products', id }],
    }),
    createProduct: builder.mutation({
      query: (formData) => ({
        url: '/product',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Products', 'Dashboard'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/product/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (_, __, { id }) => [
        'Products',
        { type: 'Products', id },
        'Dashboard',
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products', 'Dashboard'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
