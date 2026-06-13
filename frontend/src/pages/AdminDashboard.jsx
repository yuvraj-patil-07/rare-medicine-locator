import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineClipboardList, HiOutlineCurrencyRupee } from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminService.getDashboard();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="stats" count={4} />;

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Admin Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 border-b-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <HiOutlineUsers className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.totalUsers || 0}</h3>
          <p className="text-sm text-surface-500">Total Users</p>
        </div>
        
        <div className="glass-card p-6 border-b-4 border-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <HiOutlineOfficeBuilding className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.totalPharmacies || 0}</h3>
          <p className="text-sm text-surface-500">Registered Pharmacies</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-purple-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <HiOutlineClipboardList className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.totalMedicines || 0}</h3>
          <p className="text-sm text-surface-500">Medicines Listed</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-accent-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-accent-50 text-accent-600">
              <HiOutlineCurrencyRupee className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.totalReservations || 0}</h3>
          <p className="text-sm text-surface-500">Total Reservations</p>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
        <p className="text-surface-500">Navigate to the Pharmacies tab to manage verification requests.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
