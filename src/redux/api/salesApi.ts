import { baseApi } from './baseApi';

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesHistory: builder.query({
      query: () => ({
        url: '/sales',
        method: 'GET',
      }),
      providesTags: ['Sales'],
    }),
    createSale: builder.mutation({
      query: (saleData) => ({
        url: '/sales',
        method: 'POST',
        body: saleData,
      }),
      invalidatesTags: ['Sales', 'Products', 'Dashboard', 'Notifications'],
    }),
  }),
});

export const { useGetSalesHistoryQuery, useCreateSaleMutation } = salesApi;
