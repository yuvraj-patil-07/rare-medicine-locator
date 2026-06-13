import api from './api';

const medicineService = {
  search: (params) => api.get('/medicines/search', { params }),
  autocomplete: (q) => api.get('/medicines/autocomplete', { params: { q } }),
  getCategories: () => api.get('/medicines/categories'),
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id, params) => api.get(`/medicines/${id}`, { params }),
  create: (data) => api.post('/medicines', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/medicines/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/medicines/${id}`),
  getPharmacyInventory: (pharmacyId, params) => api.get(`/medicines/pharmacy/${pharmacyId}`, { params }),
};

export default medicineService;
