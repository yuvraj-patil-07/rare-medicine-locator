import { useState, useEffect } from 'react';
import favoriteService from '../services/favoriteService';
import MedicineList from '../components/medicine/MedicineList';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await favoriteService.getMedicines();
      setFavorites(data.data.filter(fav => fav.medicine).map(fav => fav.medicine));
    } catch (error) {
      console.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (medicineId) => {
    try {
      await favoriteService.toggleMedicine(medicineId);
      setFavorites(favorites.filter(med => med._id !== medicineId));
    } catch (error) {
      console.error('Failed to update favorites');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">My Saved Medicines</h1>
      
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : favorites.length === 0 ? (
        <EmptyState 
          icon="heart"
          title="No favorites yet"
          message="Medicines you save will appear here for easy access."
        />
      ) : (
        <MedicineList 
          medicines={favorites} 
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites.map(f => f._id)}
        />
      )}
    </div>
  );
};

export default Favorites;
