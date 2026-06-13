import api from './api';

const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: (params) => api.get('/admin/reports', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPharmacies: (params) => api.get('/admin/pharmacies', { params }),
  approvePharmacy: (id) => api.put(`/admin/pharmacies/${id}/approve`),
  rejectPharmacy: (id) => api.put(`/admin/pharmacies/${id}/reject`),
  deletePharmacy: (id) => api.delete(`/admin/pharmacies/${id}`),
  getMedicines: (params) => api.get('/admin/medicines', { params }),
  deleteMedicine: (id) => api.delete(`/admin/medicines/${id}`),
};

export default adminService;
