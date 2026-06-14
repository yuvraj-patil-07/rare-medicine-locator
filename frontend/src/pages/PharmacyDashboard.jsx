import { useState, useEffect } from 'react';
import pharmacyService from '../services/pharmacyService';
import reservationService from '../services/reservationService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { HiOutlineCurrencyRupee as IconRupee, HiOutlineClipboardList as IconList, HiOutlineClock as IconClock, HiOutlineStar as IconStar, HiCheck as IconCheck, HiX as IconX, HiMail as IconMail, HiPhone as IconPhone, HiExclamation as IconExclamation, HiOutlineShoppingBag as IconBag } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';
import { STATUS_COLORS } from '../utils/constants';

const PharmacyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPharmacy, setHasPharmacy] = useState(false);

  // Rejection modal states
  const [rejectionResId, setRejectionResId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: pharmacyData } = await pharmacyService.getMyPharmacy();
      if (pharmacyData.data?.pharmacy) {
        setPharmacy(pharmacyData.data.pharmacy);
        setHasPharmacy(true);
        
        // Only fetch stats if approved
        if (pharmacyData.data.pharmacy.isApproved) {
          const { data } = await pharmacyService.getStats(pharmacyData.data.pharmacy._id);
          // Set to data.data.stats as the API wraps it in { stats: { ... } }
          setStats(data.data.stats);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasPharmacy(false);
      } else {
        console.error('Failed to fetch stats');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (resId, newStatus, reason = '') => {
    try {
      await reservationService.updateStatus(resId, { status: newStatus, rejectionReason: reason });
      toast.success(`Reservation status updated to ${newStatus}`);
      fetchStats(); // Update dashboard stats & list instantly!
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

  if (loading) return <LoadingSkeleton type="stats" count={4} />;

  // Case 1: No pharmacy registered yet
  if (!hasPharmacy) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-12 max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center mb-6 border border-primary-200 dark:border-primary-900/50">
          <IconList className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">Welcome to MedLocator!</h2>
        <p className="text-surface-500 mb-6">
          To start listing rare medications, receiving reservations, and managing orders, please setup your pharmacy profile first.
        </p>
        <a href="/pharmacy/profile" className="btn-primary">
          Setup Storefront Profile
        </a>
      </div>
    );
  }

  // Case 2: Pharmacy registered but pending approval
  if (pharmacy && !pharmacy.isApproved) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-12 max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mb-6 border border-amber-200 dark:border-amber-900/50 animate-pulse">
          <IconClock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">Awaiting Verification</h2>
        <p className="text-surface-500 mb-6">
          Your profile for <span className="font-semibold text-surface-800 dark:text-surface-200">{pharmacy.name}</span> is under review. You will receive an email notification and unlock inventory listings once approved by our administrator team.
        </p>
        <a href="/pharmacy/profile" className="btn-secondary">
          Review Profile Settings
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Pharmacy Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 border-b-4 border-primary-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400">
              <IconList className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-surface-900 dark:text-white">{stats?.totalMedicines || 0}</h3>
          <p className="text-sm text-surface-500">Total Medicines Listed</p>
        </div>
        
        <div className="glass-card p-6 border-b-4 border-amber-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
              <IconClock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-surface-900 dark:text-white">{stats?.pendingReservations || 0}</h3>
          <p className="text-sm text-surface-500">Pending Reservations</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
              <IconRupee className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-surface-900 dark:text-white">₹{stats?.totalRevenue || 0}</h3>
          <p className="text-sm text-surface-500">Total Revenue</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-purple-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <IconStar className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-surface-900 dark:text-white">{stats?.rating?.toFixed(1) || '0.0'}</h3>
          <p className="text-sm text-surface-500">Average Rating</p>
        </div>
      </div>
      
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-surface-900 dark:text-white">
          <IconBag className="w-5 h-5 text-primary-500" />
          Recent Reservations
        </h2>
        
        {!stats?.recentReservations || stats.recentReservations.length === 0 ? (
          <div className="text-center py-8 text-surface-500">
            No recent reservations found.
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentReservations.map((res) => (
              <div 
                key={res._id} 
                className="p-5 rounded-2xl border border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/10 flex flex-col lg:flex-row justify-between gap-4 transition-all hover:border-surface-200 dark:hover:border-surface-700"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-base text-surface-900 dark:text-white">
                      {res.medicine?.name || 'Unknown Medicine'}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[res.status] || 'bg-surface-100 text-surface-600'}`}>
                      {res.status}
                    </span>
                    <span className="text-xs text-surface-400 font-mono">Code: {res.reservationCode}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-surface-500">
                    <p>Quantity: <span className="font-semibold text-surface-700 dark:text-surface-300">{res.quantity}</span></p>
                    <p>Total Price: <span className="font-semibold text-primary-600 dark:text-primary-400">₹{res.totalPrice}</span></p>
                    <p>Reserved: <span>{formatDate(res.createdAt)}</span></p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500 pt-1 border-t border-surface-100 dark:border-surface-800/50">
                    <p className="font-medium text-surface-750 dark:text-surface-250">{res.user?.name}</p>
                    {res.user?.email && (
                      <span className="flex items-center gap-1">
                        <IconMail className="w-3.5 h-3.5 text-surface-400" />
                        {res.user.email}
                      </span>
                    )}
                    {res.user?.phone && (
                      <span className="flex items-center gap-1">
                        <IconPhone className="w-3.5 h-3.5 text-surface-400" />
                        {res.user.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dashboard Action Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  {res.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOpenRejection(res._id)}
                        className="p-2 px-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900/40 transition-all flex items-center gap-1 text-xs font-semibold"
                        title="Reject Reservation"
                      >
                        <IconX className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(res._id, 'approved')}
                        className="p-2 px-3 rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all flex items-center gap-1 text-xs font-semibold shadow-sm shadow-primary-500/10"
                        title="Approve Reservation"
                      >
                        <IconCheck className="w-4 h-4" />
                        Approve
                      </button>
                    </>
                  )}
                  {res.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(res._id, 'completed')}
                      className="p-2 px-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1 text-xs font-semibold shadow-sm shadow-emerald-500/10"
                      title="Log Pickup"
                    >
                      <IconCheck className="w-4 h-4" />
                      Log Pickup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal overlay */}
      {rejectionResId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-2xl border border-surface-200 dark:border-surface-850 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setRejectionResId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-surface-950 dark:text-white mb-2 flex items-center gap-2">
              <IconExclamation className="text-red-500 w-6 h-6" />
              Reject Reservation
            </h3>
            <p className="text-sm text-surface-500 mb-4">
              Please provide a reason for rejecting this reservation. The patient will be notified.
            </p>

            <form onSubmit={handleConfirmRejection} className="space-y-4">
              <textarea
                required
                rows={3}
                className="input-field"
                placeholder="Enter rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionResId(null)}
                  className="btn-secondary px-4 py-2"
                  disabled={submittingRejection}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary bg-red-600 hover:bg-red-700 px-4 py-2"
                  disabled={submittingRejection}
                >
                  {submittingRejection ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
