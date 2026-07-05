import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getProfile: builder.query({
      query: () => '/user/profile',
      providesTags: ['Users'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/user/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    createStaff: builder.mutation({
      query: (staffData) => ({
        url: '/user/create-staff',
        method: 'POST',
        body: staffData,
      }),
    }),
    getUsersStats: builder.query({
      query: (params) => ({
        url: '/user/users-stats',
        method: 'GET',
        params,
      }),
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateStaffMutation,
  useGetUsersStatsQuery,
} = authApi;
