import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheck, HiX, HiClock, HiOutlineDocumentDownload, HiOutlineShoppingBag, HiExclamation, HiPhone, HiMail } from 'react-icons/hi';
import toast from 'react-hot-toast';
import pharmacyService from '../services/pharmacyService';
import reservationService from '../services/reservationService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDate } from '../utils/helpers';
import { STATUS_COLORS } from '../utils/constants';

const TABS = ['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'];

const PharmacyReservations = () => {
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPharmacy, setHasPharmacy] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Rejection modal states
  const [rejectionResId, setRejectionResId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

  useEffect(() => {
    fetchProfileAndReservations();
  }, []);

  const fetchProfileAndReservations = async () => {
    try {
      const { data } = await pharmacyService.getMyPharmacy();
      if (data.data?.pharmacy) {
        setPharmacy(data.data.pharmacy);
        setHasPharmacy(true);
        const { data: resData } = await reservationService.getPharmacyReservations(data.data.pharmacy._id);
        setReservations(resData.data || []);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasPharmacy(false);
      } else {
        toast.error('Failed to load reservations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (resId, newStatus, reason = '') => {
    try {
      await reservationService.updateStatus(resId, { status: newStatus, rejectionReason: reason });
      setReservations(reservations.map((r) => r._id === resId ? { ...r, status: newStatus, rejectionReason: reason } : r));
      toast.success(`Reservation status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update reservation status');
    }
  };

  const handleOpenRejection = (resId) => {
    setRejectionResId(resId);
    setRejectionReason('');
  };

  const handleConfirmRejection = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }

    setSubmittingRejection(true);
    await handleUpdateStatus(rejectionResId, 'rejected', rejectionReason);
    setSubmittingRejection(false);
    setRejectionResId(null);
  };

  if (loading) return <LoadingSkeleton type="list" count={4} />;

  if (!hasPharmacy) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 pb-12 max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mb-6 border border-amber-200 dark:border-amber-900/50">
          <HiExclamation className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">No Pharmacy Setup Yet</h2>
        <p className="text-surface-500 mb-6">
          You must set up your pharmacy storefront details before you can receive reservations.
        </p>
        <button onClick={() => navigate('/pharmacy/profile')} className="btn-primary">
          Setup Storefront Settings
        </button>
      </div>
    );
  }

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status.toLowerCase() === activeTab;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <HiOutlineShoppingBag className="text-primary-500" />
          Manage Reservations
        </h1>
        <p className="text-surface-500 mt-1">
          Review, approve, and track reservation orders placed by patients.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 mb-6 gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-all whitespace-nowrap capitalize ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-surface-500">No reservations found for status: {activeTab}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReservations.map((res) => (
            <div key={res._id} className="glass-card p-6 border border-surface-200 dark:border-surface-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-surface-150 dark:border-surface-850 pb-3">
                <div>
                  <span className="text-xs text-surface-400 font-mono">Code: {res.reservationCode}</span>
                  <h3 className="font-bold text-lg text-surface-950 dark:text-white mt-0.5">
                    {res.medicine?.name || 'Unknown Medication'}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_COLORS[res.status]}`}>
                  {res.status}
                </span>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {/* Medicine & Qty */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-surface-500">Order Details</h4>
                  <p className="text-surface-800 dark:text-surface-200">
                    Quantity: <span className="font-bold">{res.quantity}</span>
                  </p>
                  <p className="text-surface-800 dark:text-surface-200">
                    Total Price: <span className="font-bold text-primary-500">₹{res.totalPrice}</span>
                  </p>
                  <p className="text-surface-400 text-xs mt-1">
                    Reserved: {formatDate(res.createdAt)}
                  </p>
                </div>

                {/* Patient details */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-surface-500">Patient Details</h4>
                  <p className="font-bold text-surface-800 dark:text-surface-200">{res.user?.name}</p>
                  <p className="text-surface-600 dark:text-surface-400 flex items-center gap-1.5">
                    <HiMail className="w-4 h-4 text-surface-400" />
                    {res.user?.email}
                  </p>
                  {res.user?.phone && (
                    <p className="text-surface-600 dark:text-surface-400 flex items-center gap-1.5">
                      <HiPhone className="w-4 h-4 text-surface-400" />
                      {res.user.phone}
                    </p>
                  )}
                </div>

                {/* Prescription details */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-surface-500">Prescription Verification</h4>
                  {res.prescription ? (
                    <a
                      href={`http://localhost:5000${res.prescription}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 p-2 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 hover:bg-primary-100/50 transition-colors mt-1"
                    >
                      <HiOutlineDocumentDownload className="w-5 h-5" />
                      <span className="font-medium">View Prescription</span>
                    </a>
                  ) : (
                    <p className="text-surface-400 italic">No prescription required</p>
                  )}
                </div>
              </div>

              {/* Rejection Details (if applicable) */}
              {res.rejectionReason && (
                <div className="p-3 bg-red-50 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/20 text-xs text-red-600 dark:text-red-400 mt-2">
                  <span className="font-bold">Rejection Reason:</span> {res.rejectionReason}
                </div>
              )}

              {/* Action Buttons */}
              {res.status === 'pending' && (
                <div className="flex gap-3 pt-3 border-t border-surface-150 dark:border-surface-850 justify-end">
                  <button
                    onClick={() => handleOpenRejection(res._id)}
                    className="btn-secondary px-4 py-2 flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 border-red-200 dark:border-red-900/40"
                  >
                    <HiX className="w-4 h-4" />
                    Reject Order
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(res._id, 'approved')}
                    className="btn-primary px-4 py-2 flex items-center gap-1.5"
                  >
                    <HiCheck className="w-4 h-4" />
                    Approve Order
                  </button>
                </div>
              )}

              {res.status === 'approved' && (
                <div className="flex gap-3 pt-3 border-t border-surface-150 dark:border-surface-850 justify-end">
                  <button
                    onClick={() => handleUpdateStatus(res._id, 'completed')}
                    className="btn-primary px-4 py-2 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <HiCheck className="w-4 h-4" />
                    Log Medicine Pickup (Completed)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal overlay */}
      {rejectionResId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-2xl border border-surface-200 dark:border-surface-850 relative">
            <button
              onClick={() => setRejectionResId(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold font-display mb-4">Reject Reservation</h3>
            <form onSubmit={handleConfirmRejection} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Rejection Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  className="input-field py-3"
                  placeholder="e.g. Medicine expired, out of stock, prescription invalid..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectionResId(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRejection}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  {submittingRejection ? 'Rejecting...' : 'Reject Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyReservations;
