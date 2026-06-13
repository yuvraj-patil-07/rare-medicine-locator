import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiOutlineHeart, HiLocationMarker, HiStar } from 'react-icons/hi';
import { formatPrice, getStockStatus } from '../../utils/helpers';

const MedicineCard = ({ medicine, onFavoriteToggle, isFavorited = false, index = 0 }) => {
  const stockStatus = getStockStatus(medicine.stock);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card-hover group overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-surface-800 dark:to-surface-700 overflow-hidden">
        {medicine.image ? (
          <img
            src={medicine.image}
            alt={medicine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">💊</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={stockStatus.color}>{stockStatus.label}</span>
        </div>

        {medicine.requiresPrescription && (
          <span className="absolute top-3 right-3 badge bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px]">
            Rx Required
          </span>
        )}

        {/* Favorite button */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => { e.preventDefault(); onFavoriteToggle(medicine._id); }}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm hover:scale-110 transition-transform shadow-sm"
          >
            {isFavorited ? (
              <HiHeart className="w-5 h-5 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-5 h-5 text-surface-500" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <Link to={`/medicines/${medicine._id || medicine.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {medicine.name}
          </h3>
          {medicine.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <HiStar className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">{medicine.rating}</span>
            </div>
          )}
        </div>

        {medicine.genericName && (
          <p className="text-xs text-surface-500 mb-1">{medicine.genericName}</p>
        )}

        <span className="badge-info text-[10px] mb-3">{medicine.category}</span>

        {medicine.pharmacy && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-surface-500">
            <HiLocationMarker className="w-3.5 h-3.5" />
            <span className="line-clamp-1">
              {medicine.pharmacy.name}{medicine.pharmacy.address?.city && `, ${medicine.pharmacy.address.city}`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100 dark:border-surface-800">
          <span className="text-lg font-bold gradient-text">{formatPrice(medicine.price)}</span>
          <span className="text-xs text-surface-400">{medicine.stock} in stock</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default MedicineCard;
