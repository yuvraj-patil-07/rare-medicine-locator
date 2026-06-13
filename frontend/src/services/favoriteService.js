import api from './api';

const favoriteService = {
  toggleMedicine: (medicineId) => api.post(`/favorites/medicine/${medicineId}`),
  togglePharmacy: (pharmacyId) => api.post(`/favorites/pharmacy/${pharmacyId}`),
  getMedicines: (params) => api.get('/favorites/medicines', { params }),
  getPharmacies: (params) => api.get('/favorites/pharmacies', { params }),
  check: (params) => api.get('/favorites/check', { params }),
};

export default favoriteService;
