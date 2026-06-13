import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineOfficeBuilding, 
  HiOutlineCheck, 
  HiOutlineX, 
  HiOutlineTrash, 
  HiOutlineSearch, 
  HiOutlinePhone, 
  HiOutlineMail, 
  HiOutlineDocumentText, 
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt
} from 'react-icons/hi';
import adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPharmacies();
  }, [search, statusFilter, page]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search || undefined
      };

      if (statusFilter === 'pending') {
        params.approved = 'false';
      } else if (statusFilter === 'approved') {
        params.approved = 'true';
      }

      const { data } = await adminService.getPharmacies(params);
      setPharmacies(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast.error('Failed to fetch pharmacies list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { data } = await adminService.approvePharmacy(id);
      toast.success(data.message || 'Pharmacy approved successfully!');
      fetchPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve pharmacy');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this pharmacy registration?')) return;
    try {
      const { data } = await adminService.rejectPharmacy(id);
      toast.success(data.message || 'Pharmacy registration rejected');
      fetchPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject pharmacy');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this pharmacy? This will also deactivate all its medicine listings.')) return;
    try {
      const { data } = await adminService.deletePharmacy(id);
      toast.success(data.message || 'Pharmacy deactivated successfully');
      fetchPharmacies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate pharmacy');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage Pharmacies</h1>
          <p className="text-surface-500 text-sm mt-1">Review registrations, verify licenses, and manage pharmacy profiles.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, license..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-full md:col-span-2">
          <button
            onClick={() => { setStatusFilter('all'); setPage(1); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            All Pharmacies
          </button>
          <button
            onClick={() => { setStatusFilter('pending'); setPage(1); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/10'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => { setStatusFilter('approved'); setPage(1); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : pharmacies.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 mb-4">
            <HiOutlineOfficeBuilding className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Pharmacies Found</h3>
          <p className="text-surface-500 text-sm max-w-xs">No registered pharmacies match the current search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy._id} className="glass-card p-6 flex flex-col lg:flex-row gap-6 justify-between border border-surface-200/50 dark:border-surface-700/50 hover:shadow-lg transition-all">
              
              {/* Left Column: Details */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold font-display text-surface-900 dark:text-white">{pharmacy.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    pharmacy.isApproved 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : pharmacy.isActive === false
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {pharmacy.isApproved ? 'Approved' : pharmacy.isActive === false ? 'Deactivated' : 'Pending Verification'}
                  </span>
                </div>

                <p className="text-sm text-surface-600 dark:text-surface-400 italic">
                  {pharmacy.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-surface-600 dark:text-surface-400">
                    <HiOutlineLocationMarker className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <span>
                      {pharmacy.address?.street}, {pharmacy.address?.city}, {pharmacy.address?.state} - {pharmacy.address?.zipCode}
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-start gap-2 text-surface-600 dark:text-surface-400">
                    <HiOutlineDocumentText className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-white">Owner details:</p>
                      <p>{pharmacy.owner?.name || 'Unknown'}</p>
                      <p className="text-xs text-surface-500">{pharmacy.owner?.email}</p>
                    </div>
                  </div>

                  {/* License Info */}
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    <HiOutlineDocumentText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span>License: <strong className="text-surface-905 dark:text-surface-200">{pharmacy.license}</strong></span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    <HiOutlinePhone className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{pharmacy.phone}</span>
                  </div>

                  {/* Email & Website */}
                  {pharmacy.email && (
                    <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                      <HiOutlineMail className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>{pharmacy.email}</span>
                    </div>
                  )}

                  {pharmacy.website && (
                    <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                      <HiOutlineGlobeAlt className="w-5 h-5 text-blue-500 shrink-0" />
                      <a href={pharmacy.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary-500">
                        {pharmacy.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex lg:flex-col justify-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-surface-200 dark:border-surface-700 pt-4 lg:pt-0 lg:pl-6">
                {!pharmacy.isApproved && pharmacy.isActive !== false && (
                  <>
                    <button
                      onClick={() => handleApprove(pharmacy._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-emerald-600/10"
                    >
                      <HiOutlineCheck className="w-4 h-4" /> Approve Store
                    </button>
                    <button
                      onClick={() => handleReject(pharmacy._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
                    >
                      <HiOutlineX className="w-4 h-4" /> Reject Registration
                    </button>
                  </>
                )}

                {pharmacy.isApproved && (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-900/50">
                    <HiOutlineCheck className="w-4 h-4" /> Approved storefront
                  </div>
                )}

                {pharmacy.isActive !== false ? (
                  <button
                    onClick={() => handleDelete(pharmacy._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-all"
                  >
                    <HiOutlineTrash className="w-4 h-4" /> Deactivate
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900/50">
                    Deactivated
                  </div>
                )}
              </div>

            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPharmacies;
