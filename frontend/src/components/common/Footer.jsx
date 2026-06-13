import { Link } from 'react-router-dom';
import { HiHeart } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold">+</div>
              <span className="font-display font-bold text-lg">
                <span className="gradient-text">Med</span>Locator
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              Find rare medicines at nearby pharmacies instantly. Your health, our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Search Medicines</Link></li>
              <li><Link to="/pharmacies" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Pharmacies</Link></li>
              <li><Link to="/register" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Register Pharmacy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-4">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-surface-500">Help Center</span></li>
              <li><span className="text-sm text-surface-500">Contact Us</span></li>
              <li><span className="text-sm text-surface-500">Privacy Policy</span></li>
              <li><span className="text-sm text-surface-500">Terms of Service</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-surface-500">support@medlocator.com</span></li>
              <li><span className="text-sm text-surface-500">+91 98765 43210</span></li>
              <li><span className="text-sm text-surface-500">Mumbai, India</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400 flex items-center gap-1">
            © {new Date().getFullYear()} Rare Medicine Locator. Made with
            <HiHeart className="w-3 h-3 text-red-500" />
            for healthcare.
          </p>
          <p className="text-xs text-surface-400">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
