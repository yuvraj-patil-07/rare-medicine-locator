import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineChartBar, 
  HiOutlineCalendar,
  HiOutlineArrowUp,
  HiOutlineCurrencyRupee,
  HiOutlineOfficeBuilding,
  HiOutlineShoppingCart
} from 'react-icons/hi';
import adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await adminService.getReports(params);
      setReports(data.data?.reports || null);
    } catch (error) {
      toast.error('Failed to fetch system reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled': return 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400';
      default: return 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Analytics & Reports</h1>
          <p className="text-surface-500 text-sm mt-1">Review system activity, track top performing products, and analyze revenue metrics.</p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-50 dark:bg-surface-800 p-2.5 rounded-xl border border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500">
            <HiOutlineCalendar className="w-4 h-4" /> Filters:
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none dark:text-white"
          />
          <span className="text-xs text-surface-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none dark:text-white"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="stats" count={4} />
      ) : !reports ? (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <HiOutlineChartBar className="w-12 h-12 text-surface-400 mb-4" />
          <h3 className="text-lg font-semibold">No Report Data Available</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section 1: Reservations by Status */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-200 dark:border-surface-700 pb-3">
              <HiOutlineShoppingCart className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold font-display">Reservations by Status</h2>
            </div>
            {reports.reservationsByStatus?.length === 0 ? (
              <p className="text-surface-500 text-sm py-4">No reservations in this date range.</p>
            ) : (
              <div className="space-y-4">
                {reports.reservationsByStatus?.map((stat) => (
                  <div key={stat._id} className="flex justify-between items-center bg-surface-50/50 dark:bg-surface-850 p-3 rounded-xl border border-surface-100 dark:border-surface-800">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(stat._id)}`}>
                      {stat._id}
                    </span>
                    <span className="font-bold text-surface-900 dark:text-white">{stat.count} orders</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Daily Trends */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-200 dark:border-surface-700 pb-3">
              <HiOutlineChartBar className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold font-display">Daily Orders Trend</h2>
            </div>
            {reports.dailyReservations?.length === 0 ? (
              <p className="text-surface-500 text-sm py-4">No daily reservation data found.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {reports.dailyReservations?.map((day) => (
                  <div key={day._id} className="flex justify-between items-center text-xs">
                    <span className="text-surface-500 font-medium">{day._id}</span>
                    <div className="flex-1 mx-3 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (day.count / Math.max(...reports.dailyReservations.map(d => d.count), 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-surface-900 dark:text-white shrink-0">{day.count} orders</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Top Medicines */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-200 dark:border-surface-700 pb-3">
              <HiOutlineShoppingCart className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold font-display">Top Selling Medicines</h2>
            </div>
            {reports.topMedicines?.length === 0 ? (
              <p className="text-surface-500 text-sm py-4">No medicine sales recorded.</p>
            ) : (
              <div className="space-y-4">
                {reports.topMedicines?.map((med, index) => (
                  <div key={med._id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-surface-900 dark:text-white text-sm truncate max-w-xs">{med.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-surface-900 dark:text-white">{med.count} units</p>
                      <p className="text-xs text-surface-500">₹{med.revenue?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Top Pharmacies */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-200 dark:border-surface-700 pb-3">
              <HiOutlineOfficeBuilding className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold font-display">Top Pharmacies by Revenue</h2>
            </div>
            {reports.topPharmacies?.length === 0 ? (
              <p className="text-surface-500 text-sm py-4">No pharmacy sales recorded.</p>
            ) : (
              <div className="space-y-4">
                {reports.topPharmacies?.map((pharm, index) => (
                  <div key={pharm._id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-surface-900 dark:text-white text-sm truncate max-w-xs">{pharm.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">₹{pharm.revenue?.toLocaleString()}</p>
                      <p className="text-xs text-surface-500">{pharm.count} reservations</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminReports;
