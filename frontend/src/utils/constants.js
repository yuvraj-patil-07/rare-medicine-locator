export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const ROLES = {
  USER: 'user',
  PHARMACY: 'pharmacy',
  ADMIN: 'admin',
};

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const MEDICINE_CATEGORIES = [
  'Antibiotics',
  'Antiviral',
  'Antifungal',
  'Cardiovascular',
  'Oncology',
  'Neurology',
  'Immunosuppressants',
  'Orphan Drugs',
  'Biologics',
  'Hormonal',
  'Dermatology',
  'Gastrointestinal',
  'Respiratory',
  'Pain Management',
  'Psychiatric',
  'Rare Disease',
  'Supplements',
  'Other',
];

export const DOSAGE_FORMS = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream',
  'Ointment', 'Drops', 'Inhaler', 'Patch', 'Powder', 'Suspension', 'Other',
];

export const STATUS_COLORS = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
  completed: 'badge-info',
  cancelled: 'badge-danger',
  expired: 'badge-danger',
};

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'newest', label: 'Newest First' },
];
