import React, { useState } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { Check, ArrowRight, ArrowLeft, Upload, Plus, Menu } from 'lucide-react';

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('PG');
  const [genderPolicy, setGenderPolicy] = useState('Unisex');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560034');
  const [latitude, setLatitude] = useState(12.9345);
  const [longitude, setLongitude] = useState(77.6265);
  const [deposit, setDeposit] = useState(15000);
  const [minimumStay, setMinimumStay] = useState('3 Months');

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-Speed WiFi', 'Nutritious Meals', 'Laundry Service', 'Daily Cleaning'
  ]);

  const amenitiesList = [
    'High-Speed WiFi', 'Nutritious Meals', 'Laundry Service', 'Daily Cleaning',
    '24/7 Security', 'Gymnasium', 'Power Backup', 'Attached Bathroom', 'AC', 'Parking'
  ];

  const toggleAmenity = (a: string) => {
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(item => item !== a) : [...prev, a]
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await apiFetch('/properties', {
        method: 'POST',
        body: JSON.stringify({
          name,
          property_type: propertyType,
          gender_policy: genderPolicy,
          description,
          address,
          city,
          state,
          country: 'India',
          postal_code: postalCode,
          latitude,
          longitude,
          nearby_places: ['Nearby Station (500m)', 'Local Market (200m)'],
          images: [
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
          ],
          amenities: selectedAmenities,
          rules: ['No Smoking', 'No Pets'],
          deposit,
          minimum_stay: minimumStay
        })
      });

      // Auto add initial default room
      await apiFetch(`/properties/${res.id}/rooms`, {
        method: 'POST',
        body: JSON.stringify({
          room_number: '101',
          floor: 1,
          room_type: 'Single',
          capacity: 1,
          price: 12000,
          deposit: deposit,
          amenities: selectedAmenities.slice(0, 3),
          description: 'Standard single room'
        })
      });

      navigate('/owner/properties');
    } catch (e: any) {
      alert(e.message || 'Failed creating property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <OwnerSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="w-64 bg-navy-900 h-full">
            <OwnerSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between lg:hidden mb-6 bg-white p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-slate-900 text-sm">Add New Unit</span>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">List a New Property</h1>
              <p className="text-xs text-slate-500 font-semibold">Step {step} of 4</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`w-6 sm:w-8 h-2 rounded-full ${s <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Property Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Oak Residence"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Co-living">Co-living</option>
                    <option value="Dormitory">Dormitory</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Gender Policy</label>
                  <select
                    value={genderPolicy}
                    onChange={e => setGenderPolicy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your stay, vibe, rules..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Street Address</label>
                <input
                  type="text"
                  placeholder="12th Main Rd, Koramangala 4th Block"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <div className="space-y-6">
              <label className="text-xs font-bold text-slate-700 block mb-2">Select Amenities Included</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenitiesList.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedAmenities.includes(a)
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{a}</span>
                    {selectedAmenities.includes(a) && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Minimum Stay</label>
                  <select
                    value={minimumStay}
                    onChange={e => setMinimumStay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Summary Review</h4>
                <p className="text-xs text-slate-600"><strong>Name:</strong> {name || 'Untitled'}</p>
                <p className="text-xs text-slate-600"><strong>Type:</strong> {propertyType} ({genderPolicy})</p>
                <p className="text-xs text-slate-600"><strong>Location:</strong> {address}, {city}</p>
              </div>
            </div>
          )}

          {/* Step Actions */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !name) { alert('Property name is required'); return; }
                  setStep(step + 1);
                }}
                className="px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Property for Verification'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
