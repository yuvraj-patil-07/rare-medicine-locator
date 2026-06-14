import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiSearch, HiBell, HiUser, HiLogout, HiHeart, HiClipboardList, HiCog, HiViewGrid, HiOutlineShoppingBag, HiOutlineDocumentText } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import ThemeToggle from './ThemeToggle';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isPharmacy, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfile(false);
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isPharmacy) return '/pharmacy/dashboard';
    return '/profile';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-glow group-hover:shadow-glow transition-shadow">
              +
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">
              <span className="gradient-text">Med</span>Locator
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/search" className="btn-ghost text-sm">
              <HiSearch className="w-4 h-4" />
              Search
            </Link>
            <Link to="/pharmacies" className="btn-ghost text-sm">
              Pharmacies
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <HiBell className="w-5 h-5 text-surface-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(user?.name)}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 glass-card p-2 shadow-glass-lg"
                      >
                        <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-700 mb-1">
                          <p className="font-semibold text-sm">{user?.name}</p>
                          <p className="text-xs text-surface-500">{user?.email}</p>
                          <span className="badge-info mt-1 capitalize text-[10px]">{user?.role}</span>
                        </div>

                        {isAdmin && (
                          <Link to="/admin/dashboard" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                            <HiViewGrid className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}

                        {isPharmacy && (
                          <>
                            <Link to="/pharmacy/dashboard" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiViewGrid className="w-4 h-4" />
                              Dashboard
                            </Link>
                            <Link to="/pharmacy/inventory" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiClipboardList className="w-4 h-4" />
                              Inventory
                            </Link>
                            <Link to="/pharmacy/reservations" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiOutlineShoppingBag className="w-4 h-4" />
                              Reservations
                            </Link>
                            <Link to="/pharmacy/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiCog className="w-4 h-4" />
                              Store Settings
                            </Link>
                          </>
                        )}

                        {!isAdmin && !isPharmacy && (
                          <>
                            <Link to="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiUser className="w-4 h-4" />
                              Profile
                            </Link>
                            <Link to="/favorites" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiHeart className="w-4 h-4" />
                              Favorites
                            </Link>
                            <Link to="/reservations" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiClipboardList className="w-4 h-4" />
                              Reservations
                            </Link>
                            <Link to="/requests" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm">
                              <HiOutlineDocumentText className="w-4 h-4" />
                              Medicine Requests
                            </Link>
                          </>
                        )}

                        <div className="border-t border-surface-200 dark:border-surface-700 mt-1 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 w-full text-sm transition-colors">
                            <HiLogout className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              {isOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/search" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 font-medium transition-colors">
                Search Medicines
              </Link>
              <Link to="/pharmacies" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 font-medium transition-colors">
                Pharmacies
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
