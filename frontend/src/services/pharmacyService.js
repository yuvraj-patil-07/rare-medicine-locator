import api from './api';

const pharmacyService = {
  getAll: (params) => api.get('/pharmacies', { params }),
  getNearby: (params) => api.get('/pharmacies/nearby', { params }),
  getById: (id, params) => api.get(`/pharmacies/${id}`, { params }),
  create: (data) => api.post('/pharmacies', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/pharmacies/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStats: (id) => api.get(`/pharmacies/${id}/stats`),
  getMyPharmacy: () => api.get('/pharmacies/my/pharmacy'),
};

export default pharmacyService;
