import api from './api';

const reviewService = {
  createPharmacyReview: (pharmacyId, data) => api.post(`/reviews/pharmacy/${pharmacyId}`, data),
  createMedicineReview: (medicineId, data) => api.post(`/reviews/medicine/${medicineId}`, data),
  getPharmacyReviews: (pharmacyId, params) => api.get(`/reviews/pharmacy/${pharmacyId}`, { params }),
  getMedicineReviews: (medicineId, params) => api.get(`/reviews/medicine/${medicineId}`, { params }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
};

export default reviewService;
