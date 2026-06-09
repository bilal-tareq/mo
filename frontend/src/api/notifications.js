import client from './client'

export const notificationsApi = {
  list:       (params) => client.get('/notifications/', { params }),
  markAllRead:()       => client.post('/notifications/mark-read/'),
  markOneRead:(id)     => client.patch(`/notifications/${id}/read/`),
}
