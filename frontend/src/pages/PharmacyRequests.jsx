import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineDocumentText, 
  HiOutlineClipboardList,
  HiOutlineDocumentDownload,
  HiCheck,
  HiX,
  HiClock,
  HiMail,
  HiPhone,
  HiOutlinePlus
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import requestService from '../services/requestService';
import pharmacyService from '../services/pharmacyService';
import medicineService from '../services/medicineService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDate } from '../utils/helpers';

const PharmacyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [pharmacy, setPharmacy] = useState(null);
  const [myMedicines, setMyMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPharmacy, setHasPharmacy] = useState(false);

  // Fulfill Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequestsAndInventory();
  }, []);

  const fetchRequestsAndInventory = async () => {
    try {
      const { data: pharmaData } = await pharmacyService.getMyPharmacy();
      if (pharmaData.data?.pharmacy) {
        setPharmacy(pharmaData.data.pharmacy);
        setHasPharmacy(true);
        
        if (pharmaData.data.pharmacy.isApproved) {
          // Fetch active pending patient requests
          const { data: reqData } = await requestService.getActiveRequests();
          setRequests(reqData.data || []);
          
          // Fetch pharmacy's inventory
          const { data: invData } = await medicineService.getPharmacyInventory(pharmaData.data.pharmacy._id);
          setMyMedicines(invData.data || []);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasPharmacy(false);
      } else {
        toast.error('Failed to load active requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFulfillModal = (req) => {
    setSelectedRequest(req);
    // Auto-select a medicine if there is a match by name (case-insensitive substring)
    const match = myMedicines.find(m => 
      m.name.toLowerCase().includes(req.medicineName.toLowerCase()) || 
      (req.genericName && m.genericName.toLowerCase().includes(req.genericName.toLowerCase()))
    );
    setSelectedMedicineId(match ? match._id : '');
  };

  const handleConfirmFulfillment = async (e) => {
    e.preventDefault();
    if (!selectedMedicineId) {
      toast.error('Please select a medicine from your inventory');
      return;
    }

    const medicine = myMedicines.find(m => m._id === selectedMedicineId);
    if (!medicine) {
      toast.error('Selected medicine not found');
      return;
    }

    if (medicine.stock < selectedRequest.quantity) {
      toast.error(`Insufficient stock! You only have ${medicine.stock} units, but patient needs ${selectedRequest.quantity}.`);
      return;
    }

    setSubmitting(true);
    try {
      await requestService.acceptRequest(selectedRequest._id, { medicineId: selectedMedicineId });
      toast.success('Request fulfilled successfully! A reservation has been created.');
      setSelectedRequest(null);
      setSelectedMedicineId('');
      fetchRequestsAndInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fulfill request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton type="list" count={3} />;

  if (!hasPharmacy) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 pb-12 max-w-xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mb-6 border border-amber-200 dark:border-amber-900/50">
          <HiOutlineClipboardList className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">No Pharmacy Setup Yet</h2>
        <p className="text-surface-500 mb-6">
          You must set up your pharmacy storefront details before you can fulfill patient requests.
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
        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mb-6 border border-amber-200 dark:border-amber-900/50 animate-pulse">
          <HiClock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">Awaiting Verification</h2>
        <p className="text-surface-500 mb-6">
          Your pharmacy profile is currently under review. You can view and fulfill patient requests once approved.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3 text-surface-950 dark:text-white">
          <HiOutlineDocumentText className="text-primary-500" />
          Fulfill Patient Requests
        </h1>
        <p className="text-surface-500 mt-1">
          Review rare medicine requests submitted by patients. Offer them to users if you have them in stock.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-xl mx-auto">
          <p className="text-surface-500">No pending medicine requests from patients at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req._id} className="glass-card p-6 border border-surface-200 dark:border-surface-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-surface-150 dark:border-surface-850 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-surface-950 dark:text-white mt-0.5">
                    {req.medicineName}
                  </h3>
                  {req.genericName && (
                    <p className="text-xs text-surface-500 font-medium mt-0.5">
                      Generic: {req.genericName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge-warning uppercase text-xs font-semibold">
                    PENDING REQUEST
                  </span>
                  <span className="text-xs text-surface-450 font-mono">Submitted: {formatDate(req.createdAt)}</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {/* Details */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-surface-500">Request Specifications</h4>
                  <p className="text-surface-800 dark:text-surface-200">
                    Quantity Required: <span className="font-bold">{req.quantity}</span>
                  </p>
                  {req.strength && (
                    <p className="text-surface-800 dark:text-surface-200">
                      Strength Needed: <span className="font-semibold">{req.strength}</span>
                    </p>
                  )}
                  {req.notes && (
                    <div className="text-xs bg-surface-50 dark:bg-surface-800/40 p-2.5 rounded-xl border border-surface-100 dark:border-surface-850 text-surface-600 mt-2">
                      <span className="font-bold">Patient Notes:</span> {req.notes}
                    </div>
                  )}
                </div>

                {/* Patient details */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-surface-500">Patient Details</h4>
                  <p className="font-bold text-surface-800 dark:text-surface-200">{req.user?.name}</p>
                  <p className="text-surface-600 dark:text-surface-400 flex items-center gap-1.5">
                    <HiMail className="w-4 h-4 text-surface-400" />
                    {req.user?.email}
                  </p>
                  {req.user?.phone && (
                    <p className="text-surface-600 dark:text-surface-400 flex items-center gap-1.5">
                      <HiPhone className="w-4 h-4 text-surface-400" />
                      {req.user.phone}
                    </p>
                  )}
                </div>

                {/* Prescription details */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-surface-500">Prescription Verification</h4>
                  {req.prescription ? (
                    <a
                      href={req.prescription}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 p-2 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 hover:bg-primary-100/50 transition-colors mt-1"
                    >
                      <HiOutlineDocumentDownload className="w-5 h-5" />
                      <span className="font-medium">View Prescription</span>
                    </a>
                  ) : (
                    <p className="text-surface-400 italic">No prescription uploaded</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-surface-150 dark:border-surface-850 justify-end">
                <button
                  onClick={() => handleOpenFulfillModal(req)}
                  className="btn-primary px-5 py-2 flex items-center gap-1.5"
                >
                  <HiCheck className="w-4 h-4" />
                  Fulfill Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fulfill Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-2xl border border-surface-200 dark:border-surface-850 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-surface-950 dark:text-white mb-2 flex items-center gap-2">
              <HiOutlineClipboardList className="text-primary-500 w-6 h-6" />
              Select Matching Stock
            </h3>
            <p className="text-sm text-surface-500 mb-4">
              Choose the medicine from your active inventory that matches the patient's request for <strong>{selectedRequest.medicineName}</strong> (Qty: {selectedRequest.quantity}).
            </p>

            <form onSubmit={handleConfirmFulfillment} className="space-y-4">
              <div>
                <label className="form-label mb-1">Select Medicine from Inventory *</label>
                <select
                  required
                  className="input-field"
                  value={selectedMedicineId}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                >
                  <option value="">-- Choose Medicine --</option>
                  {myMedicines
                    .filter(m => m.isActive)
                    .map((med) => (
                      <option 
                        key={med._id} 
                        value={med._id}
                        disabled={med.stock < selectedRequest.quantity}
                      >
                        {med.name} {med.strength ? `(${med.strength})` : ''} - Stock: {med.stock} units {med.stock < selectedRequest.quantity ? '(Insufficient Stock)' : ''}
                      </option>
                    ))}
                </select>
              </div>

              {selectedMedicineId && (
                <div className="p-3 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 rounded-xl text-xs text-primary-750 dark:text-primary-250">
                  <span className="font-bold">Summary:</span> This will reserve {selectedRequest.quantity} units of your selected medicine for {selectedRequest.user?.name} and immediately generate an approved reservation code.
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="btn-secondary px-4 py-2"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2"
                  disabled={submitting || !selectedMedicineId}
                >
                  {submitting ? 'Fulfilling...' : 'Confirm & Reserve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyRequests;
