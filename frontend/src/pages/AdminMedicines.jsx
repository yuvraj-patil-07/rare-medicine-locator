import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineClipboardList, 
  HiOutlineSearch, 
  HiOutlineTrash, 
  HiOutlineOfficeBuilding
} from 'react-icons/hi';
import adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Categories list based on backend models
  const categories = [
    'all',
    'Oncology',
    'Immunosuppressants',
    'Antiviral',
    'Antibiotics',
    'Cardiology',
    'Rare Diseases'
  ];

  useEffect(() => {
    fetchMedicines();
  }, [search, categoryFilter, page]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      const { data } = await adminService.getMedicines(params);
      setMedicines(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast.error('Failed to fetch medicines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this medicine listing?')) return;
    try {
      await adminService.deleteMedicine(id);
      toast.success('Medicine listing deactivated successfully');
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Manage Medicines</h1>
        <p className="text-surface-500 text-sm mt-1">Review all listed rare medicines, verify prescription requirements, and manage global inventory.</p>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search medicine name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-full md:col-span-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setPage(1); }}
              className={`whitespace-nowrap px-4 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : medicines.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 mb-4">
            <HiOutlineClipboardList className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Medicines Listed</h3>
          <p className="text-surface-500 text-sm max-w-xs">No medicine listings matched the search or category filters.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-surface-200/50 dark:border-surface-700/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/70 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700 text-xs font-semibold uppercase text-surface-500 tracking-wider">
                  <th className="px-6 py-4">Medicine Details</th>
                  <th className="px-6 py-4">Pharmacy</th>
                  <th className="px-6 py-4">Price / Stock</th>
                  <th className="px-6 py-4">Prescription Required</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800 text-sm">
                {medicines.map((med) => (
                  <tr key={med._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-surface-900 dark:text-white">{med.name}</p>
                        <p className="text-xs text-surface-500">Generic: {med.genericName}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded text-[10px] text-surface-600 dark:text-surface-400 font-semibold">
                            {med.category}
                          </span>
                          <span className="bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded text-[10px] text-primary-600 dark:text-primary-400 font-semibold">
                            {med.brand}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1.5 text-surface-600 dark:text-surface-400">
                        <HiOutlineOfficeBuilding className="w-4 h-4 shrink-0 text-surface-400" />
                        <div>
                          <p className="font-medium text-surface-900 dark:text-white">{med.pharmacy?.name || 'Unknown Store'}</p>
                          <p className="text-surface-500">{med.pharmacy?.address?.city || 'Unknown Location'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-surface-900 dark:text-white">₹{med.price}</p>
                      <p className={`text-xs ${med.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {med.stock > 0 ? `${med.stock} in stock` : 'Out of stock'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {med.requiresPrescription ? (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full font-semibold">
                          Yes, Required
                        </span>
                      ) : (
                        <span className="bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400 px-2.5 py-1 rounded-full font-semibold">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {med.isActive !== false ? (
                        <button
                          onClick={() => handleDeleteMedicine(med._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <HiOutlineTrash className="w-3.5 h-3.5" /> Deactivate
                        </button>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">Deactivated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/10">
              <span className="text-xs text-surface-500">
                Showing Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-50 text-xs font-medium"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 disabled:opacity-50 text-xs font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMedicines;
