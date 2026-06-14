import api from './api';

const requestService = {
  create: (data) => api.post('/requests', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyRequests: (params) => api.get('/requests/my', { params }),
  cancel: (id) => api.put(`/requests/${id}/cancel`),
  getActiveRequests: (params) => api.get('/requests/active', { params }),
  acceptRequest: (id, data) => api.post(`/requests/${id}/accept`, data),
};

export default requestService;
