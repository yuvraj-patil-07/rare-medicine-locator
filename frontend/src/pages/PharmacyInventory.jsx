import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiExclamation, HiOutlineClipboardList, HiX, HiCloudUpload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import pharmacyService from '../services/pharmacyService';
import medicineService from '../services/medicineService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const CATEGORIES = [
  'Antibiotics', 'Antiviral', 'Antifungal', 'Cardiovascular', 'Oncology',
  'Neurology', 'Immunosuppressants', 'Orphan Drugs', 'Biologics', 'Hormonal',
  'Dermatology', 'Gastrointestinal', 'Respiratory', 'Pain Management',
  'Psychiatric', 'Rare Disease', 'Supplements', 'Other'
];

const DOSAGE_FORMS = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment',
  'Drops', 'Inhaler', 'Patch', 'Powder', 'Suspension', 'Other'
];

const PharmacyInventory = () => {
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPharmacy, setHasPharmacy] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [brand, setBrand] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [strength, setStrength] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [sideEffects, setSideEffects] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchProfileAndInventory();
  }, []);

  const fetchProfileAndInventory = async () => {
    try {
      const { data } = await pharmacyService.getMyPharmacy();
      if (data.data?.pharmacy) {
        setPharmacy(data.data.pharmacy);
        setHasPharmacy(true);
        if (data.data.pharmacy.isApproved) {
          const { data: invData } = await medicineService.getPharmacyInventory(data.data.pharmacy._id);
          setMedicines(invData.data || []);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasPharmacy(false);
      } else {
        toast.error('Failed to load inventory');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setGenericName('');
    setBrand('');
    setManufacturer('');
    setDescription('');
    setCategory('Other');
    setDosageForm('Tablet');
    setStrength('');
    setPrice('');
    setStock('');
    setLowStockThreshold('5');
    setRequiresPrescription(false);
    setSideEffects('');
    setContraindications('');
    setExpiryDate('');
    setBatchNumber('');
    setImage(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedicine(med);
    setName(med.name || '');
    setGenericName(med.genericName || '');
    setBrand(med.brand || '');
    setManufacturer(med.manufacturer || '');
    setDescription(med.description || '');
    setCategory(med.category || 'Other');
    setDosageForm(med.dosageForm || 'Tablet');
    setStrength(med.strength || '');
    setPrice(med.price?.toString() || '');
    setStock(med.stock?.toString() || '');
    setLowStockThreshold(med.lowStockThreshold?.toString() || '5');
    setRequiresPrescription(med.requiresPrescription || false);
    setSideEffects(med.sideEffects?.join(', ') || '');
    setContraindications(med.contraindications?.join(', ') || '');
    setExpiryDate(med.expiryDate ? med.expiryDate.split('T')[0] : '');
    setBatchNumber(med.batchNumber || '');
    setImage(null);
    setImagePreview(med.image ? med.image : '');
    setIsModalOpen(true);
  };

  const handleDeleteMedicine = async (medId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      await medicineService.delete(medId);
      setMedicines(medicines.filter((m) => m._id !== medId));
      toast.success('Medicine deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('genericName', genericName);
      formData.append('brand', brand);
      formData.append('manufacturer', manufacturer);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('dosageForm', dosageForm);
      formData.append('strength', strength);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('lowStockThreshold', lowStockThreshold);
      formData.append('requiresPrescription', requiresPrescription);
      formData.append('sideEffects', sideEffects);
      formData.append('contraindications', contraindications);
      formData.append('batchNumber', batchNumber);
      if (expiryDate) formData.append('expiryDate', expiryDate);
      if (image) formData.append('image', image);

      if (editingMedicine) {
        await medicineService.update(editingMedicine._id, formData);
        toast.success('Medicine updated successfully!');
      } else {
        await medicineService.create(formData);
        toast.success('Medicine added successfully!');
      }
      setIsModalOpen(false);
      fetchProfileAndInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton type="list" count={4} />;

  if (!hasPharmacy) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 pb-12 max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mb-6 border border-amber-200 dark:border-amber-900/50">
          <HiExclamation className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">No Pharmacy Setup Yet</h2>
        <p className="text-surface-500 mb-6">
          You must set up your pharmacy storefront and coordinates details before you can list medications.
        </p>
        <button onClick={() => navigate('/pharmacy/profile')} className="btn-primary">
          Setup Storefront Settings
        </button>
      </div>
    );
  }

  if (pharmacy && !pharmacy.isApproved) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 pb-12 max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-900/50">
          <HiExclamation className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">Awaiting Approval</h2>
        <p className="text-surface-500 mb-6">
          Your pharmacy profile is currently pending review by our administrator team. You will be able to manage inventory and list rare medicines once approved.
        </p>
      </div>
    );
  }

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <HiOutlineClipboardList className="text-primary-500" />
            Medicine Inventory
          </h1>
          <p className="text-surface-500 mt-1">
            Manage your medicine listings, stock counts, and threshold alerts.
          </p>
        </div>
        
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      {/* Inventory Search & Metrics */}
      <div className="glass-card p-4 mb-6 flex items-center gap-3">
        <HiSearch className="w-5 h-5 text-surface-400" />
        <input
          type="text"
          className="bg-transparent border-0 outline-none w-full text-sm placeholder-surface-400"
          placeholder="Search by medicine name, generic name, or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table view */}
      {filteredMedicines.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-surface-500">No medicines found in your inventory.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-900/40 text-xs font-bold text-surface-500 border-b border-surface-200 dark:border-surface-800">
                  <th className="p-4">Medicine Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800 text-sm">
                {filteredMedicines.map((med) => (
                  <tr key={med._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-900/10">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {med.image ? (
                            <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-surface-400 text-xs">No image</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-surface-950 dark:text-white">{med.name}</div>
                          <div className="text-xs text-surface-500">{med.genericName} • {med.strength}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-surface-600 dark:text-surface-400">{med.category}</td>
                    <td className="p-4 font-semibold text-surface-950 dark:text-white">₹{med.price}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${med.stock === 0 ? 'text-red-500' : med.stock <= med.lowStockThreshold ? 'text-amber-500' : 'text-surface-800 dark:text-surface-250'}`}>
                        {med.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      {med.stock === 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400">Out of Stock</span>
                      ) : med.stock <= med.lowStockThreshold ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">Low Stock</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">In Stock</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(med)}
                          className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-850 hover:text-primary-500 transition-colors"
                          title="Edit Medicine"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(med._id)}
                          className="p-2 rounded-lg text-surface-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors"
                          title="Delete Medicine"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Add Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-surface-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-surface-200 dark:border-surface-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-display font-bold mb-6">
              {editingMedicine ? 'Edit Medicine Details' : 'Add New Medicine'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Details */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter medicine name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Generic Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter generic active ingredient"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Brand Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter commercial brand name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Manufacturer</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter manufacturer name"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Category *</label>
                  <select
                    className="input-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Dosage Form *</label>
                  <select
                    className="input-field"
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value)}
                  >
                    {DOSAGE_FORMS.map((df) => (
                      <option key={df} value={df}>{df}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Strength *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter strength specification"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Price (INR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    placeholder="Enter price in Rupees"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Stock Count *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    placeholder="Enter stock quantity"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Low Stock Notification Threshold *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Batch Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter batch code"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Expiry Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Description</label>
                  <textarea
                    rows={3}
                    className="input-field py-3"
                    placeholder="Describe indications, instructions, or packaging details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Side Effects</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter potential side effects (comma separated)"
                    value={sideEffects}
                    onChange={(e) => setSideEffects(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Contraindications</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter contraindications (comma separated)"
                    value={contraindications}
                    onChange={(e) => setContraindications(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-800">
                  <input
                    type="checkbox"
                    id="reqPresc"
                    className="rounded border-surface-350 dark:border-surface-700 text-primary-600 focus:ring-primary-500 h-5 w-5 bg-transparent"
                    checked={requiresPrescription}
                    onChange={(e) => setRequiresPrescription(e.target.checked)}
                  />
                  <label htmlFor="reqPresc" className="font-semibold text-surface-900 dark:text-white cursor-pointer select-none">
                    Requires Prescription upload for patients to reserve
                  </label>
                </div>

                {/* Upload Section */}
                <div className="md:col-span-2 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-surface-100 dark:bg-surface-800 border-2 border-dashed border-surface-300 dark:border-surface-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Medicine preview" className="w-full h-full object-cover" />
                    ) : (
                      <HiCloudUpload className="w-8 h-8 text-surface-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Medicine Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-950/30 dark:file:text-primary-400 hover:file:bg-primary-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-8"
                >
                  {submitting ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyInventory;
