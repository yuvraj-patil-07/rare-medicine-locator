import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineDocumentText, 
  HiOutlinePlus, 
  HiOutlineUpload, 
  HiOutlineDocumentDownload,
  HiOutlineShoppingBag,
  HiX,
  HiClock,
  HiCheck,
  HiExclamation
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import requestService from '../services/requestService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDate } from '../utils/helpers';

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // New Request Form states
  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await requestService.getMyRequests();
      setRequests(data.data || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this medicine request?')) return;
    try {
      await requestService.cancel(id);
      toast.success('Request cancelled successfully');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPrescriptionFile(e.target.files[0]);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      toast.error('Please specify the medicine name');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('medicineName', medicineName);
      formData.append('genericName', genericName);
      formData.append('strength', strength);
      formData.append('quantity', quantity);
      formData.append('notes', notes);
      if (prescriptionFile) {
        formData.append('prescription', prescriptionFile);
      }

      await requestService.create(formData);
      toast.success('Medicine request submitted successfully!');
      
      // Reset form
      setMedicineName('');
      setGenericName('');
      setStrength('');
      setQuantity(1);
      setNotes('');
      setPrescriptionFile(null);
      setIsSubmitOpen(false);
      
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'accepted': return 'badge-success';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-danger';
      default: return 'bg-surface-100 text-surface-600';
    }
  };

  if (loading) return <LoadingSkeleton type="list" count={3} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <HiOutlineDocumentText className="text-primary-500" />
            Medicine Requests
          </h1>
          <p className="text-surface-500 mt-1">
            Request rare medicines that are currently unavailable. Pharmacies will offer them if they have stock.
          </p>
        </div>
        <button 
          onClick={() => setIsSubmitOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Request Medicine
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center mb-6 mx-auto border border-primary-200 dark:border-primary-900/50">
            <HiOutlineDocumentText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Active Requests</h3>
          <p className="text-surface-500 mb-6">
            If you need a rare medicine that is currently out of stock or not listed in any pharmacy, you can submit a custom request.
          </p>
          <button onClick={() => setIsSubmitOpen(true)} className="btn-primary inline-flex items-center gap-2">
            <HiOutlinePlus className="w-5 h-5" />
            Request Medicine Now
          </button>
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
                      Generic Name: {req.genericName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(req.status)}`}>
                    {req.status}
                  </span>
                  <span className="text-xs text-surface-450 font-mono">Submitted: {formatDate(req.createdAt)}</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-surface-500">Request Specs</h4>
                  <p className="text-surface-800 dark:text-surface-200">
                    Quantity: <span className="font-bold">{req.quantity}</span>
                  </p>
                  {req.strength && (
                    <p className="text-surface-800 dark:text-surface-200">
                      Required Strength: <span className="font-semibold">{req.strength}</span>
                    </p>
                  )}
                  {req.notes && (
                    <div className="text-xs bg-surface-50 dark:bg-surface-800/40 p-2.5 rounded-xl border border-surface-100 dark:border-surface-850 text-surface-600 mt-2">
                      <span className="font-bold">My Notes:</span> {req.notes}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-semibold text-surface-500">Prescription Attached</h4>
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

                <div className="space-y-1.5">
                  <h4 className="font-semibold text-surface-500">Fulfillment Status</h4>
                  {req.status === 'accepted' && req.acceptedBy ? (
                    <div className="space-y-1">
                      <p className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                        <HiCheck className="w-4 h-4" />
                        Accepted by Pharmacy!
                      </p>
                      <p className="font-bold text-surface-800 dark:text-surface-200">{req.acceptedBy.name}</p>
                      <p className="text-xs text-surface-500">{req.acceptedBy.address?.street}, {req.acceptedBy.address?.city}</p>
                      <button 
                        onClick={() => navigate('/reservations')} 
                        className="btn-primary !py-1 !px-2.5 text-xs flex items-center gap-1.5 mt-2"
                      >
                        <HiOutlineShoppingBag className="w-3.5 h-3.5" />
                        Go to My Reservations
                      </button>
                    </div>
                  ) : req.status === 'pending' ? (
                    <p className="text-surface-500 italic flex items-center gap-1">
                      <HiClock className="w-4 h-4 animate-spin text-amber-500" />
                      Waiting for pharmacy offers...
                    </p>
                  ) : (
                    <p className="text-surface-500 capitalize">{req.status}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {req.status === 'pending' && (
                <div className="flex gap-3 pt-3 border-t border-surface-150 dark:border-surface-850 justify-end">
                  <button
                    onClick={() => handleCancelRequest(req._id)}
                    className="btn-secondary px-4 py-2 flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 border-red-200 dark:border-red-900/40"
                  >
                    <HiX className="w-4 h-4" />
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Request Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-2xl border border-surface-200 dark:border-surface-850 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsSubmitOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-surface-950 dark:text-white mb-2 flex items-center gap-2">
              <HiOutlineDocumentText className="text-primary-500 w-7 h-7" />
              Request Rare Medicine
            </h3>
            <p className="text-sm text-surface-500 mb-6">
              Fill out the specifications of the medicine you need. All registered pharmacies will see this request and can offer it if they have it in stock.
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="form-label mb-1">Medicine Name *</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  placeholder="Enter full medicine name (e.g. Remdesivir 100mg)"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label mb-1">Generic Name / Active Ingredient</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Remdesivir"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Strength / Dosage Form</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 100mg Injection"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label mb-1">Quantity Required *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="input-field"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Upload Prescription (Optional)</label>
                  <label className="relative flex items-center justify-center p-3 border border-dashed border-surface-300 dark:border-surface-700 rounded-xl cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex items-center gap-2 text-xs text-surface-500 font-semibold">
                      <HiOutlineUpload className="w-5 h-5 text-primary-500" />
                      <span>{prescriptionFile ? prescriptionFile.name : 'Select file (JPG, PNG, PDF)'}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label mb-1">Additional Notes</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Detail any urgency, medical notes, or instructions"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-surface-100 dark:border-surface-850">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="btn-secondary px-5 py-2.5"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2.5"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
