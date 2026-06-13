import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLocationMarker, HiPhone, HiStar, HiClock } from 'react-icons/hi';

const PharmacyCard = ({ pharmacy, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card-hover overflow-hidden group"
    >
      <Link to={`/pharmacies/${pharmacy._id}`}>
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-surface-800 dark:to-surface-700 overflow-hidden">
          {pharmacy.image ? (
            <img src={pharmacy.image} alt={pharmacy.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🏥</span>
            </div>
          )}

          {pharmacy.distanceKm !== undefined && (
            <span className="absolute top-3 right-3 badge bg-white/90 dark:bg-surface-900/90 text-surface-700 dark:text-surface-200 backdrop-blur-sm shadow-sm">
              <HiLocationMarker className="w-3 h-3" />
              {pharmacy.distanceKm} km
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-base mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
            {pharmacy.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-3">
            <HiLocationMarker className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {pharmacy.address?.street}, {pharmacy.address?.city}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-surface-500 mb-4">
            {pharmacy.rating > 0 && (
              <div className="flex items-center gap-1">
                <HiStar className="w-4 h-4 text-amber-400" />
                <span className="font-medium">{pharmacy.rating}</span>
                <span>({pharmacy.totalReviews})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <HiPhone className="w-3.5 h-3.5" />
              <span>{pharmacy.phone}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
            <div className="flex gap-2">
              {pharmacy.emergencyAvailable && (
                <span className="badge-danger text-[10px]">24/7</span>
              )}
              {pharmacy.deliveryAvailable && (
                <span className="badge-success text-[10px]">Delivery</span>
              )}
            </div>
            <span className="text-xs text-primary-500 font-medium">View Details →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PharmacyCard;
