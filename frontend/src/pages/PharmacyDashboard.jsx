import { useState, useEffect } from 'react';
import pharmacyService from '../services/pharmacyService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { HiOutlineCurrencyRupee, HiOutlineClipboardList, HiOutlineClock, HiOutlineStar } from 'react-icons/hi';

const PharmacyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPharmacy, setHasPharmacy] = useState(false);

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
          setStats(data.data);
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

  if (loading) return <LoadingSkeleton type="stats" count={4} />;

  // Case 1: No pharmacy registered yet
  if (!hasPharmacy) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-12 max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center mb-6 border border-primary-200 dark:border-primary-900/50">
          <HiOutlineClipboardList className="w-10 h-10 animate-bounce" />
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
          <HiOutlineClock className="w-10 h-10" />
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
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
              <HiOutlineClipboardList className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.totalMedicines || 0}</h3>
          <p className="text-sm text-surface-500">Total Medicines Listed</p>
        </div>
        
        <div className="glass-card p-6 border-b-4 border-amber-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <HiOutlineClock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.pendingReservations || 0}</h3>
          <p className="text-sm text-surface-500">Pending Reservations</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <HiOutlineCurrencyRupee className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">₹{stats?.totalRevenue || 0}</h3>
          <p className="text-sm text-surface-500">Total Revenue</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-purple-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <HiOutlineStar className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.rating?.toFixed(1) || '0.0'}</h3>
          <p className="text-sm text-surface-500">Average Rating</p>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Recent Reservations</h2>
        <p className="text-surface-500">Navigate to the Reservations tab to manage active orders.</p>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
