/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Generate Google Maps navigation URL
 */
const getNavigationUrl = (destLat, destLng, originLat, originLng) => {
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  if (originLat && originLng) {
    url += `&origin=${originLat},${originLng}`;
  }
  return url;
};

/**
 * Format price to 2 decimal places
 */
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

/**
 * Generate unique reservation code
 */
const generateReservationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RML-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Build pagination metadata
 */
const getPaginationData = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  calculateDistance,
  getNavigationUrl,
  formatPrice,
  generateReservationCode,
  getPaginationData,
};
