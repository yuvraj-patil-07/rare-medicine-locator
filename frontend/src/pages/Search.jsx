import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineFilter, HiLocationMarker } from 'react-icons/hi';
import SearchBar from '../components/common/SearchBar';
import MedicineFilters from '../components/medicine/MedicineFilters';
import MedicineList from '../components/medicine/MedicineList';
import Pagination from '../components/common/Pagination';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import useGeolocation from '../hooks/useGeolocation';
import medicineService from '../services/medicineService';
import favoriteService from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location, loading: locationLoading, refresh: refreshLocation } = useGeolocation();
  const { isAuthenticated } = useAuth();
  
  const [medicines, setMedicines] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [useLocationFilter, setUseLocationFilter] = useState(false);

  const initialFilters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
    maxDistance: searchParams.get('maxDistance') || '10',
    page: parseInt(searchParams.get('page')) || 1,
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    fetchMedicines();
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [filters, useLocationFilter, location]);

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const queryParams = { ...filters };
      if (useLocationFilter && location) {
        queryParams.longitude = location.longitude;
        queryParams.latitude = location.latitude;
      }
      
      const { data } = await medicineService.search(queryParams);
      setMedicines(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data } = await favoriteService.getMedicines({ limit: 100 });
      setFavorites(data.data.filter(fav => fav.medicine).map(fav => fav.medicine._id));
    } catch (error) {
      console.error('Failed to fetch favorites');
    }
  };

  const handleFavoriteToggle = async (medicineId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      return;
    }
    
    try {
      const { data } = await favoriteService.toggleMedicine(medicineId);
      if (data.data.isFavorited) {
        setFavorites([...favorites, medicineId]);
        toast.success('Added to favorites');
      } else {
        setFavorites(favorites.filter(id => id !== medicineId));
        toast.success('Removed from favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleSearch = (query) => {
    setFilters({ ...filters, q: query, page: 1 });
  };

  const toggleLocationFilter = () => {
    if (!useLocationFilter) {
      if (!location) {
        refreshLocation();
      }
      setUseLocationFilter(true);
    } else {
      setUseLocationFilter(false);
    }
  };

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-3xl font-display font-bold mb-4">Search Medicines</h1>
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search rare medicines, brands..." 
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLocationFilter}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              useLocationFilter && location
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'glass-card hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
          >
            <HiLocationMarker className="w-5 h-5" />
            <span className="hidden sm:inline">
              {locationLoading ? 'Locating...' : useLocationFilter ? 'Using Location' : 'Near Me'}
            </span>
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-3 rounded-xl glass-card font-medium"
          >
            <HiOutlineFilter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`w-full md:w-64 lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24">
            <MedicineFilters filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-surface-600 dark:text-surface-400">
              {loading ? 'Searching...' : `Found ${pagination?.totalItems || 0} results`}
              {filters.q && <span className="font-semibold text-surface-900 dark:text-surface-100"> for "{filters.q}"</span>}
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : (
            <>
              <MedicineList 
                medicines={medicines} 
                onFavoriteToggle={handleFavoriteToggle}
                favorites={favorites}
              />
              <Pagination 
                pagination={pagination} 
                onPageChange={(page) => setFilters({ ...filters, page })} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
