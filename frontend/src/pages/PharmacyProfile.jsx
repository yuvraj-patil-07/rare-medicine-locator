import { useState, useEffect } from 'react';
import { HiOutlineOfficeBuilding, HiLocationMarker, HiPhone, HiMail, HiGlobe, HiClipboardList, HiShieldCheck, HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import pharmacyService from '../services/pharmacyService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const PharmacyProfile = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPharmacy, setHasPharmacy] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [license, setLicense] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Operating Hours state
  const [operatingHours, setOperatingHours] = useState(
    DAYS.reduce((acc, day) => {
      acc[day] = { open: '09:00', close: '21:00', closed: day === 'sunday' };
      return acc;
    }, {})
  );

  useEffect(() => {
    fetchPharmacyProfile();
  }, []);

  const fetchPharmacyProfile = async () => {
    try {
      const { data } = await pharmacyService.getMyPharmacy();
      if (data.data?.pharmacy) {
        const p = data.data.pharmacy;
        setPharmacy(p);
        setHasPharmacy(true);
        
        // Populate form
        setName(p.name || '');
        setDescription(p.description || '');
        setLicense(p.license || '');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setWebsite(p.website || '');
        setStreet(p.address?.street || '');
        setCity(p.address?.city || '');
        setState(p.address?.state || '');
        setZipCode(p.address?.zipCode || '');
        setCountry(p.address?.country || 'India');
        setLatitude(p.location?.coordinates?.[1] || '');
        setLongitude(p.location?.coordinates?.[0] || '');
        setDeliveryAvailable(p.deliveryAvailable || false);
        setEmergencyAvailable(p.emergencyAvailable || false);
        setImagePreview(p.image ? `http://localhost:5000${p.image}` : '');
        
        if (p.operatingHours) {
          setOperatingHours(p.operatingHours);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasPharmacy(false);
      } else {
        toast.error('Failed to load pharmacy details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.promise(
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude.toFixed(6));
            setLongitude(position.coords.longitude.toFixed(6));
            resolve(position);
          },
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }),
      {
        loading: 'Detecting location...',
        success: 'Location detected successfully!',
        error: 'Could not detect location. Please type manually.',
      }
    );
  };

  const handleHoursChange = (day, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('license', license);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('website', website);
      formData.append('deliveryAvailable', deliveryAvailable);
      formData.append('emergencyAvailable', emergencyAvailable);
      
      formData.append('address', JSON.stringify({ street, city, state, zipCode, country }));
      formData.append('coordinates', JSON.stringify({ latitude, longitude }));
      formData.append('operatingHours', JSON.stringify(operatingHours));
      
      if (image) {
        formData.append('image', image);
      }

      if (hasPharmacy) {
        await pharmacyService.update(pharmacy._id, formData);
        toast.success('Pharmacy profile updated successfully!');
      } else {
        await pharmacyService.create(formData);
        toast.success('Pharmacy registered! Awaiting admin approval.');
        setHasPharmacy(true);
        fetchPharmacyProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save pharmacy settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="form" count={1} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <HiOutlineOfficeBuilding className="text-primary-500" />
            Pharmacy Settings
          </h1>
          <p className="text-surface-500 mt-1">
            {hasPharmacy 
              ? 'Manage your pharmacy storefront profile, operating hours, and location.' 
              : 'Register your pharmacy to start listing medicines and receiving reservations.'}
          </p>
        </div>

        {hasPharmacy && (
          <div>
            {pharmacy?.isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                <HiShieldCheck className="w-4 h-4" /> Active / Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                <HiOutlineSparkles className="w-4 h-4" /> Pending Admin Approval
              </span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Storefront Info */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-surface-200 dark:border-surface-700 pb-3 flex items-center gap-2">
            <HiOutlineOfficeBuilding className="w-5 h-5 text-primary-500" />
            Storefront Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Pharmacy Name *</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. Apex Pharmacy & Wellness"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Drug License Number *</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. DL-12345-XYZ"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Description</label>
              <textarea
                rows={3}
                className="input-field py-3"
                placeholder="Tell patients about your specialty medicines, services, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Profile Image Preview & Selector */}
            <div className="md:col-span-2 flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-surface-100 dark:bg-surface-800 border-2 border-dashed border-surface-300 dark:border-surface-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Pharmacy Preview" className="w-full h-full object-cover" />
                ) : (
                  <HiOutlineOfficeBuilding className="w-8 h-8 text-surface-400" />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Storefront Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-950/30 dark:file:text-primary-400 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-surface-200 dark:border-surface-700 pb-3 flex items-center gap-2">
            <HiPhone className="w-5 h-5 text-primary-500" />
            Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Phone Number *</label>
              <input
                type="tel"
                required
                className="input-field"
                placeholder="+91 22 2642 2200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Email Address *</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="contact@pharmacy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Website URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://pharmacy.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Address & Location coordinates */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-surface-200 dark:border-surface-700 pb-3 flex items-center gap-2">
            <HiLocationMarker className="w-5 h-5 text-primary-500" />
            Address & Coordinates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Street Address *</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Shop 4, Hill Road, Bandra West"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">City *</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">State *</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Zip / PIN Code *</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="400050"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>

            {/* Latitude and Longitude with Autofill */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Latitude *</label>
              <input
                type="number"
                step="any"
                required
                className="input-field"
                placeholder="e.g. 19.0583"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Longitude *</label>
              <input
                type="number"
                step="any"
                required
                className="input-field"
                placeholder="e.g. 72.8286"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleDetectLocation}
                className="btn-secondary w-full justify-center gap-2 h-[42px]"
              >
                <HiLocationMarker className="w-5 h-5 text-primary-500" />
                Detect My Location
              </button>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-surface-200 dark:border-surface-700 pb-3 flex items-center gap-2">
            <HiClipboardList className="w-5 h-5 text-primary-500" />
            Operating Hours
          </h2>

          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-surface-100 dark:border-surface-800 last:border-b-0">
                <span className="capitalize font-semibold text-surface-700 dark:text-surface-300 w-32">{day}</span>
                
                <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-surface-300 dark:border-surface-700 text-primary-600 focus:ring-primary-500 h-4 w-4 bg-transparent"
                      checked={operatingHours[day].closed}
                      onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                    />
                    <span className="text-sm text-surface-600 dark:text-surface-400">Closed</span>
                  </label>

                  {!operatingHours[day].closed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        className="input-field px-2 py-1.5 text-sm w-32"
                        value={operatingHours[day].open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      />
                      <span className="text-surface-400 text-sm">to</span>
                      <input
                        type="time"
                        className="input-field px-2 py-1.5 text-sm w-32"
                        value={operatingHours[day].close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services & Features */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-surface-200 dark:border-surface-700 pb-3 flex items-center gap-2">
            <HiShieldCheck className="w-5 h-5 text-primary-500" />
            Services & Facilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-900/30 transition-colors cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-surface-300 dark:border-surface-700 text-primary-600 focus:ring-primary-500 h-5 w-5 bg-transparent"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
              />
              <div>
                <span className="font-semibold block text-surface-900 dark:text-white">Home Delivery Available</span>
                <span className="text-xs text-surface-500">Provide shipping or home delivery options for rare medications.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-900/30 transition-colors cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-surface-300 dark:border-surface-700 text-primary-600 focus:ring-primary-500 h-5 w-5 bg-transparent"
                checked={emergencyAvailable}
                onChange={(e) => setEmergencyAvailable(e.target.checked)}
              />
              <div>
                <span className="font-semibold block text-surface-900 dark:text-white">24/7 / Emergency Services</span>
                <span className="text-xs text-surface-500">Available outside regular hours for critical medicine emergencies.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-3 font-semibold shadow-glow"
          >
            {saving ? 'Saving details...' : hasPharmacy ? 'Save Settings' : 'Register Pharmacy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PharmacyProfile;
