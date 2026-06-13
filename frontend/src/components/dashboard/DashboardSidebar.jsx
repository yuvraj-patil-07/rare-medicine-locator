import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineShoppingBag, 
  HiOutlineClipboardList, 
  HiOutlineUsers, 
  HiOutlineChartBar, 
  HiOutlineCog 
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = () => {
  const { isAdmin, isPharmacy } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', icon: HiOutlineHome, label: 'Overview' },
    { to: '/admin/pharmacies', icon: HiOutlineShoppingBag, label: 'Pharmacies' },
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
    { to: '/admin/medicines', icon: HiOutlineClipboardList, label: 'Medicines' },
    { to: '/admin/reports', icon: HiOutlineChartBar, label: 'Reports' },
  ];

  const pharmacyLinks = [
    { to: '/pharmacy/dashboard', icon: HiOutlineHome, label: 'Overview' },
    { to: '/pharmacy/inventory', icon: HiOutlineClipboardList, label: 'Inventory' },
    { to: '/pharmacy/reservations', icon: HiOutlineShoppingBag, label: 'Reservations' },
    { to: '/pharmacy/profile', icon: HiOutlineCog, label: 'Settings' },
  ];

  const links = isAdmin ? adminLinks : isPharmacy ? pharmacyLinks : [];

  return (
    <div className="w-64 glass-card h-[calc(100vh-6rem)] sticky top-24 overflow-y-auto hidden md:block">
      <div className="p-4">
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                  isActive
                    ? 'gradient-bg text-white shadow-glow'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
