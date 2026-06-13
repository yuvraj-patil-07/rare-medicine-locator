import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiHeart, HiStar, HiLocationMarker, HiPhone, HiChevronLeft, HiClock, HiExclamation, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import medicineService from '../services/medicineService';
import favoriteService from '../services/favoriteService';
import reviewService from '../services/reviewService';
import reservationService from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Map from '../components/map/Map';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';
import Modal from '../components/common/Modal';
import { formatPrice, getStockStatus } from '../utils/helpers';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { location } = useGeolocation();

  const [medicine, setMedicine] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [reserveNotes, setReserveNotes] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    fetchMedicineDetails();
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [id, location]);

  const fetchMedicineDetails = async () => {
    try {
      const params = {};
      if (location) {
        params.userLat = location.latitude;
        params.userLng = location.longitude;
      }
      
      const [medRes, revRes] = await Promise.all([
        medicineService.getById(id, params),
        reviewService.getMedicineReviews(id)
      ]);
      
      setMedicine(medRes.data.data.medicine);
      setReviews(revRes.data.data);
    } catch (error) {
      toast.error('Failed to load medicine details');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const { data } = await favoriteService.check({ medicineId: id });
      setIsFavorited(data.data.isFavorited);
    } catch (error) {
      console.error('Failed to check favorite status');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      navigate('/login', { state: { from: { pathname: `/medicines/${id}` } } });
      return;
    }
    
    try {
      const { data } = await favoriteService.toggleMedicine(id);
      setIsFavorited(data.data.isFavorited);
      toast.success(data.data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const { data } = await reviewService.createMedicineReview(id, reviewData);
      setReviews([data.data.review, ...reviews]);
      // Update local rating state immediately for better UX
      const newTotal = medicine.totalReviews + 1;
      const newRating = ((medicine.rating * medicine.totalReviews) + reviewData.rating) / newTotal;
      setMedicine({ ...medicine, rating: Number(newRating.toFixed(1)), totalReviews: newTotal });
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to reserve medicine');
      navigate('/login', { state: { from: { pathname: `/medicines/${id}` } } });
      return;
    }

    if (medicine.requiresPrescription && !prescriptionFile) {
      toast.error('Prescription is required for this medicine');
      return;
    }

    setIsReserving(true);
    try {
      const formData = new FormData();
      formData.append('medicineId', id);
      formData.append('quantity', reserveQuantity);
      formData.append('notes', reserveNotes);
      if (prescriptionFile) {
        formData.append('prescription', prescriptionFile);
      }

      await reservationService.create(formData);
      toast.success('Reservation successful! You will be notified when approved.');
      setShowReserveModal(false);
      fetchMedicineDetails(); // Refresh stock
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (!medicine) return null;

  const stockStatus = getStockStatus(medicine.stock);
  const pharmacy = medicine.pharmacy;

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 !px-3">
        <HiChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Image Container */}
              <div className="relative h-64 md:h-80 bg-surface-100 dark:bg-surface-800 rounded-2xl overflow-hidden flex items-center justify-center">
                {medicine.image ? (
                  <img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">💊</span>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={stockStatus.color}>{stockStatus.label}</span>
                  {medicine.requiresPrescription && (
                    <span className="badge bg-purple-100 text-purple-700">Rx Required</span>
                  )}
                </div>
                <button
                  onClick={handleFavoriteToggle}
                  className="absolute top-4 right-4 p-3 rounded-xl bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm hover:scale-110 transition-transform shadow-sm"
                >
                  {isFavorited ? <HiHeart className="w-6 h-6 text-red-500" /> : <HiOutlineHeart className="w-6 h-6 text-surface-500" />}
                </button>
              </div>

              {/* Basic Info */}
              <div className="flex flex-col">
                <div className="mb-auto">
                  <h1 className="text-3xl font-display font-bold mb-2">{medicine.name}</h1>
                  {medicine.genericName && <p className="text-lg text-surface-500 mb-4">{medicine.genericName}</p>}
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                      <HiStar className="w-5 h-5 text-amber-400" />
                      <span className="font-medium text-lg">{medicine.rating > 0 ? medicine.rating : 'New'}</span>
                      <span className="text-surface-500 text-sm">({medicine.totalReviews} reviews)</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-300"></span>
                    <span className="badge-info">{medicine.category}</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex">
                      <span className="w-24 text-surface-500">Brand:</span>
                      <span className="font-medium">{medicine.brand || 'Generic'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-surface-500">Form:</span>
                      <span className="font-medium">{medicine.dosageForm}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-surface-500">Strength:</span>
                      <span className="font-medium">{medicine.strength || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-surface-500">Manufacturer:</span>
                      <span className="font-medium">{medicine.manufacturer || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-200 dark:border-surface-700 mt-6">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Price</p>
                      <p className="text-3xl font-bold gradient-text">{formatPrice(medicine.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-surface-500 mb-1">Availability</p>
                      <p className="font-medium">{medicine.stock} units</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowReserveModal(true)}
                    disabled={medicine.stock === 0}
                    className="btn-primary w-full text-lg shadow-glow"
                  >
                    {medicine.stock === 0 ? 'Out of Stock' : 'Reserve Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Details Tab */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">About this medicine</h2>
            <p className="text-surface-600 dark:text-surface-300 leading-relaxed mb-8">
              {medicine.description || 'No detailed description available.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {medicine.sideEffects && medicine.sideEffects.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <HiExclamation className="text-amber-500" />
                    Possible Side Effects
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-surface-600 dark:text-surface-400">
                    {medicine.sideEffects.map((effect, i) => <li key={i}>{effect}</li>)}
                  </ul>
                </div>
              )}
              {medicine.contraindications && medicine.contraindications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-500">
                    <HiX className="w-4 h-4" />
                    Contraindications
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-surface-600 dark:text-surface-400">
                    {medicine.contraindications.map((ci, i) => <li key={i}>{ci}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pharmacy Info & Map */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-bold text-lg mb-4">Available At</h2>
            <Link to={`/pharmacies/${pharmacy._id}`} className="group block">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏥</span>
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary-500 transition-colors">{pharmacy.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-surface-500 mt-1">
                    <HiStar className="text-amber-400 w-4 h-4" />
                    <span>{pharmacy.rating}</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="space-y-3 text-sm text-surface-600 dark:text-surface-400 mb-6 pb-6 border-b border-surface-200 dark:border-surface-700">
              <div className="flex gap-3">
                <HiLocationMarker className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>{pharmacy.address.street}, {pharmacy.address.city}, {pharmacy.address.state} - {pharmacy.address.zipCode}</span>
              </div>
              <div className="flex gap-3">
                <HiPhone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>{pharmacy.phone}</span>
              </div>
              <div className="flex gap-3 items-center">
                <HiClock className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-green-500 font-medium">Open Now</span>
              </div>
            </div>

            <div className="h-48 rounded-xl overflow-hidden shadow-inner mb-4">
              <Map pharmacies={[pharmacy]} userLocation={location} zoom={14} />
            </div>

            {medicine.navigationUrl && (
              <a 
                href={medicine.navigationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary w-full text-sm"
              >
                Get Directions
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
            <p className="text-surface-500 mt-1">See what other patients say about this medicine.</p>
          </div>
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please log in to write a review');
                return;
              }
              setShowReviewModal(true);
            }} 
            className="btn-secondary"
          >
            Write a Review
          </button>
        </div>
        <ReviewList reviews={reviews} />
      </div>

      {/* Review Modal */}
      <ReviewForm
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        type="medicine"
      />

      {/* Reserve Modal */}
      <Modal isOpen={showReserveModal} onClose={() => setShowReserveModal(false)} title="Reserve Medicine">
        <form onSubmit={handleReservationSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl mb-4">
            <div>
              <p className="font-semibold">{medicine.name}</p>
              <p className="text-sm text-surface-500">{formatPrice(medicine.price)} per unit</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg gradient-text">{formatPrice(medicine.price * reserveQuantity)}</p>
              <p className="text-xs text-surface-500">Total</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              max={medicine.stock}
              value={reserveQuantity}
              onChange={(e) => setReserveQuantity(Number(e.target.value))}
              className="input-field"
            />
            <p className="text-xs text-surface-500 mt-1">Maximum available: {medicine.stock}</p>
          </div>

          {medicine.requiresPrescription && (
            <div>
              <label className="block text-sm font-medium mb-1">Upload Prescription <span className="text-red-500">*</span></label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPrescriptionFile(e.target.files[0])}
                className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Special Notes (Optional)</label>
            <textarea
              value={reserveNotes}
              onChange={(e) => setReserveNotes(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Any specific instructions for the pharmacy..."
            ></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setShowReserveModal(false)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isReserving} className="btn-primary flex-1">
              {isReserving ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicineDetail;
