import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineUsers, 
  HiOutlineSearch, 
  HiOutlineTrash, 
  HiOutlineUser, 
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi';
import adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined
      };

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      const { data } = await adminService.getUsers(params);
      setUsers(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast.error('Failed to fetch users list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const actionText = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;
    try {
      if (currentStatus) {
        // Deactivate
        await adminService.deleteUser(id);
        toast.success('User deactivated successfully');
      } else {
        // Activate
        await adminService.updateUser(id, { isActive: true });
        toast.success('User activated successfully');
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionText} user`);
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      const { data } = await adminService.updateUser(id, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">User Management</h1>
        <p className="text-surface-500 text-sm mt-1">Monitor user registrations, change user roles, and activate/deactivate accounts.</p>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Role Filter */}
        <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-full md:col-span-2">
          {['all', 'user', 'pharmacy', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                roleFilter === role
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : users.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 mb-4">
            <HiOutlineUsers className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Users Found</h3>
          <p className="text-surface-500 text-sm max-w-xs">No user accounts found matching the current search criteria.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-surface-200/50 dark:border-surface-700/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/70 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700 text-xs font-semibold uppercase text-surface-500 tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800 text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          u.role === 'admin' 
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400'
                            : u.role === 'pharmacy'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                        }`}>
                          {u.role === 'admin' ? (
                            <HiOutlineShieldCheck className="w-5 h-5" />
                          ) : (
                            <HiOutlineUser className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-surface-500">{u.email}</p>
                          {u.phone && <p className="text-xs text-surface-400 mt-0.5">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="user">User</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {u.isActive !== false ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <HiOutlineCheckCircle className="w-4 h-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                            <HiOutlineXCircle className="w-4 h-4" /> Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-surface-500">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive !== false)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          u.isActive !== false
                            ? 'border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                            : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        {u.isActive !== false ? (
                          <>
                            <HiOutlineTrash className="w-3.5 h-3.5" /> Suspend
                          </>
                        ) : (
                          'Activate'
                        )}
                      </button>
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

export default AdminUsers;
