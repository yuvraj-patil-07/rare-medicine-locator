import { MEDICINE_CATEGORIES, SORT_OPTIONS } from '../../utils/constants';

const MedicineFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="glass-card p-5 space-y-5">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-surface-500">Filters</h3>

      {/* Category */}
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="input-field text-sm !py-2"
        >
          <option value="">All Categories</option>
          {MEDICINE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium mb-2 block">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="input-field text-sm !py-2 w-1/2"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="input-field text-sm !py-2 w-1/2"
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => handleChange('inStock', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <select
          value={filters.sortBy || 'relevance'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className="input-field text-sm !py-2"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Nearby */}
      <div>
        <label className="text-sm font-medium mb-2 block">Max Distance (km)</label>
        <select
          value={filters.maxDistance || '10'}
          onChange={(e) => handleChange('maxDistance', e.target.value)}
          className="input-field text-sm !py-2"
        >
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
          <option value="100">100 km</option>
        </select>
      </div>

      {/* Clear filters */}
      <button
        onClick={() => onChange({ q: filters.q, page: 1 })}
        className="btn-ghost text-sm w-full !text-red-500"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default MedicineFilters;
