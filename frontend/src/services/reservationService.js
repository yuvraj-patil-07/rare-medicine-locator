import api from './api';

const reservationService = {
  create: (data) => api.post('/reservations', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyReservations: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  getPharmacyReservations: (pharmacyId, params) => api.get(`/reservations/pharmacy/${pharmacyId}`, { params }),
  updateStatus: (id, data) => api.put(`/reservations/${id}/status`, data),
  cancel: (id) => api.put(`/reservations/${id}/cancel`),
};

export default reservationService;
