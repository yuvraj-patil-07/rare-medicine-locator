const Pharmacy = require('../models/Pharmacy');

class GeoService {
  /**
   * Find nearby pharmacies using MongoDB $geoNear
   * @param {Number} longitude - User's longitude
   * @param {Number} latitude - User's latitude
   * @param {Number} maxDistanceKm - Maximum distance in km (default 10km)
   * @param {Object} filter - Additional filter criteria
   */
  static async findNearbyPharmacies(longitude, latitude, maxDistanceKm = 10, filter = {}) {
    const maxDistanceMeters = maxDistanceKm * 1000;

    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distance',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: { isApproved: true, isActive: true, ...filter },
        },
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 2] },
        },
      },
      {
        $sort: { distance: 1 },
      },
    ]);

    return pharmacies;
  }

  /**
   * Find pharmacies with a specific medicine nearby
   * @param {Number} longitude
   * @param {Number} latitude
   * @param {String} medicineId
   * @param {Number} maxDistanceKm
   */
  static async findNearbyPharmaciesWithMedicine(longitude, latitude, medicineId, maxDistanceKm = 10) {
    const Medicine = require('../models/Medicine');
    const maxDistanceMeters = maxDistanceKm * 1000;

    // First find pharmacies nearby
    const nearbyPharmacyIds = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distance',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: { isApproved: true, isActive: true },
        },
      },
      {
        $project: { _id: 1, distance: 1 },
      },
    ]);

    // Get pharmacy IDs
    const pharmacyIdMap = {};
    nearbyPharmacyIds.forEach((p) => {
      pharmacyIdMap[p._id.toString()] = p.distance;
    });

    // Find medicines in those pharmacies
    const medicines = await Medicine.find({
      pharmacy: { $in: Object.keys(pharmacyIdMap) },
      isActive: true,
      stock: { $gt: 0 },
    }).populate('pharmacy');

    // Add distance to each result
    const results = medicines.map((med) => {
      const medObj = med.toObject();
      medObj.pharmacyDistance = Math.round((pharmacyIdMap[med.pharmacy._id.toString()] / 1000) * 100) / 100;
      return medObj;
    });

    // Sort by distance
    results.sort((a, b) => a.pharmacyDistance - b.pharmacyDistance);

    return results;
  }

  /**
   * Generate Google Maps navigation URL
   */
  static getNavigationUrl(destLat, destLng, originLat, originLng) {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    if (originLat && originLng) {
      url += `&origin=${originLat},${originLng}`;
    }
    url += '&travelmode=driving';
    return url;
  }
}

module.exports = GeoService;
