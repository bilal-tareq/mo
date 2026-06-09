import client from './client'

export const authApi = {
  login:          (data)     => client.post('/auth/login/', data),
  logout:         (data)     => client.post('/auth/logout/', data),
  refreshToken:   (data)     => client.post('/auth/token/refresh/', data),
  getProfile:     ()         => client.get('/auth/profile/'),
  updateProfile:  (data)     => client.patch('/auth/profile/', data),
  changePassword: (data)     => client.post('/auth/change-password/', data),
  listUsers:      (params)   => client.get('/auth/users/', { params }),
  createUser:     (data)     => client.post('/auth/users/', data),
  updateUser:     (id, data) => client.patch(`/auth/users/${id}/`, data),
  deleteUser:     (id)       => client.delete(`/auth/users/${id}/`),
}
