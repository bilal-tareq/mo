import client from './client'

export const salesApi = {
  list:   (params)   => client.get('/sales/', { params }),
  get:    (id)       => client.get(`/sales/${id}/`),
  create: (data)     => client.post('/sales/', data),
  update: (id, data) => client.patch(`/sales/${id}/`, data),
}
