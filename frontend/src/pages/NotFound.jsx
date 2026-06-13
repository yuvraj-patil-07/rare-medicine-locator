import { Link } from 'react-router-dom';
import { HiOutlineQuestionMarkCircle, HiOutlineSearch, HiOutlineHome } from 'react-icons/hi';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="w-24 h-24 rounded-3xl bg-surface-100 dark:bg-surface-800 text-primary-500 flex items-center justify-center border border-surface-200 dark:border-surface-700/50 shadow-glass relative">
            <HiOutlineQuestionMarkCircle className="w-12 h-12 animate-bounce" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-extrabold text-surface-900 dark:text-white">Page Not Found</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm max-w-sm mx-auto">
            The page you are looking for does not exist, has been moved, or is under construction.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-glow text-sm"
          >
            <HiOutlineHome className="w-5 h-5" /> Go Back Home
          </Link>
          <Link
            to="/search"
            className="btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm"
          >
            <HiOutlineSearch className="w-5 h-5" /> Search Medicines
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
