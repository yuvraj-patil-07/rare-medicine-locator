import PharmacyCard from './PharmacyCard';
import EmptyState from '../common/EmptyState';

const PharmacyList = ({ pharmacies }) => {
  if (!pharmacies || pharmacies.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No pharmacies found"
        message="No pharmacies found matching your criteria."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pharmacies.map((pharmacy, index) => (
        <PharmacyCard
          key={pharmacy._id}
          pharmacy={pharmacy}
          index={index}
        />
      ))}
    </div>
  );
};

export default PharmacyList;
