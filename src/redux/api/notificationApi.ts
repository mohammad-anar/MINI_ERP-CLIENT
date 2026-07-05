import { baseApi } from './baseApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => ({
        url: '/notification',
        method: 'GET',
      }),
      providesTags: ['Notifications'],
    }),
    markAllRead: builder.mutation({
      query: () => ({
        url: '/notification/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markRead: builder.mutation({
      query: (id) => ({
        url: `/notification/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} = notificationApi;
