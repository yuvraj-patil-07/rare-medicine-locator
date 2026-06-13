import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiStar, HiLocationMarker, HiPhone, HiClock, HiCheckCircle, HiExclamationCircle, HiChevronLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import pharmacyService from '../services/pharmacyService';
import medicineService from '../services/medicineService';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Map from '../components/map/Map';
import MedicineList from '../components/medicine/MedicineList';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';

const PharmacyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { location } = useGeolocation();

  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchPharmacyData();
  }, [id, location]);

  const fetchPharmacyData = async () => {
    try {
      const params = {};
      if (location) {
        params.userLat = location.latitude;
        params.userLng = location.longitude;
      }

      const [pharmRes, invRes, revRes] = await Promise.all([
        pharmacyService.getById(id, params),
        medicineService.getAll({ pharmacy: id, limit: 12 }),
        reviewService.getPharmacyReviews(id)
      ]);

      setPharmacy(pharmRes.data.data.pharmacy);
      setInventory(invRes.data.data);
      setReviews(revRes.data.data);
    } catch (error) {
      toast.error('Failed to load pharmacy details');
      navigate('/pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const { data } = await reviewService.createPharmacyReview(id, reviewData);
      setReviews([data.data.review, ...reviews]);
      // Update local rating
      const newTotal = pharmacy.totalReviews + 1;
      const newRating = ((pharmacy.rating * pharmacy.totalReviews) + reviewData.rating) / newTotal;
      setPharmacy({ ...pharmacy, rating: Number(newRating.toFixed(1)), totalReviews: newTotal });
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (!pharmacy) return null;

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 !px-3">
        <HiChevronLeft className="w-5 h-5" />
        Back
      </button>

      {/* Hero Section */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="relative h-64 md:h-80 bg-surface-900">
          {pharmacy.image ? (
            <img src={pharmacy.image} alt={pharmacy.name} className="w-full h-full object-cover opacity-70" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-90"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/50 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                {pharmacy.isVerified && (
                  <span className="badge bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-md">
                    <HiCheckCircle className="w-4 h-4 mr-1" />
                    Verified Pharmacy
                  </span>
                )}
                {pharmacy.distanceKm !== undefined && (
                  <span className="badge bg-white/20 text-white backdrop-blur-md">
                    <HiLocationMarker className="w-4 h-4 mr-1" />
                    {pharmacy.distanceKm} km away
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">{pharmacy.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-surface-200">
                <div className="flex items-center gap-2">
                  <HiStar className="text-amber-400 w-5 h-5" />
                  <span className="font-semibold text-white">{pharmacy.rating > 0 ? pharmacy.rating : 'New'}</span>
                  <span>({pharmacy.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiPhone className="w-5 h-5" />
                  <span>{pharmacy.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiClock className="w-5 h-5" />
                  <span>{pharmacy.operatingHours?.open} - {pharmacy.operatingHours?.close}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar & Services */}
        <div className="p-6 border-t border-surface-200 dark:border-surface-700 bg-white/50 dark:bg-surface-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-wrap gap-3">
            {pharmacy.emergencyAvailable && (
              <span className="badge-danger flex items-center gap-1.5 py-1.5 px-3">
                <HiExclamationCircle className="w-4 h-4" /> 24/7 Emergency Services
              </span>
            )}
            {pharmacy.deliveryAvailable && (
              <span className="badge-success flex items-center gap-1.5 py-1.5 px-3">
                <HiCheckCircle className="w-4 h-4" /> Home Delivery Available
              </span>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {pharmacy.navigationUrl && (
              <a href={pharmacy.navigationUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 md:flex-none">
                Get Directions
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className="flex space-x-1 border-b border-surface-200 dark:border-surface-800">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'inventory' ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
            >
              Available Medicines
              {activeTab === 'inventory' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
            >
              Reviews ({pharmacy.totalReviews})
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full"></span>
              )}
            </button>
          </div>

          <div className="pt-4">
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Medicines in Stock</h2>
                </div>
                <MedicineList medicines={inventory} />
                {inventory.length === 12 && (
                  <div className="text-center mt-8">
                    <button className="btn-ghost">Load More</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Patient Reviews</h2>
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Please log in to write a review');
                        return;
                      }
                      setShowReviewModal(true);
                    }} 
                    className="btn-secondary text-sm"
                  >
                    Write a Review
                  </button>
                </div>
                <ReviewList reviews={reviews} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-4">Location</h3>
            <div className="text-sm text-surface-600 dark:text-surface-400 mb-6">
              <p className="mb-1">{pharmacy.address.street}</p>
              <p>{pharmacy.address.city}, {pharmacy.address.state} - {pharmacy.address.zipCode}</p>
            </div>
            <div className="h-48 rounded-xl overflow-hidden shadow-inner relative z-0">
              <Map pharmacies={[pharmacy]} userLocation={location} zoom={15} />
            </div>
          </div>

          {pharmacy.license && (
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">Pharmacy Credentials</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">License No.</span>
                  <span className="font-medium text-surface-900 dark:text-surface-100">{pharmacy.license}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReviewForm
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        type="pharmacy"
      />
    </div>
  );
};

export default PharmacyDetail;
