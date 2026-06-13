import MedicineCard from './MedicineCard';
import EmptyState from '../common/EmptyState';
import { Link } from 'react-router-dom';

const MedicineList = ({ medicines, onFavoriteToggle, favorites = [] }) => {
  if (!medicines || medicines.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No medicines found"
        message="Try adjusting your search or filters to find what you're looking for."
        action={
          <Link to="/search" className="btn-primary text-sm">
            Browse All
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {medicines.map((medicine, index) => (
        <MedicineCard
          key={medicine._id || medicine.id}
          medicine={medicine}
          index={index}
          onFavoriteToggle={onFavoriteToggle}
          isFavorited={favorites.includes(medicine._id || medicine.id)}
        />
      ))}
    </div>
  );
};

export default MedicineList;
