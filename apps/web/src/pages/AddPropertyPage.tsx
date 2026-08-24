import React, { useState, useEffect, useRef } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { 
  Check, ArrowRight, ArrowLeft, Upload, Plus, Trash2, MapPin, 
  BedDouble, Sparkles, Building2, Image as ImageIcon,
  LocateFixed, Menu, X, CheckCircle2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leaflet Marker Icon Setup
const customPinIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="width:36px;height:36px;background:#2563eb;border:3px solid #ffffff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);">
      <div style="width:10px;height:10px;background:#ffffff;border-radius:50%;transform:rotate(45deg);"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

// Map Pin Picker Component
const MapLocationPicker: React.FC<{
  lat: number;
  lng: number;
  onLocationChange: (newLat: number, newLng: number) => void;
}> = ({ lat, lng, onLocationChange }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });

  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true });
    map.invalidateSize();
  }, [lat, lng, map]);

  return (
    <Marker
      position={[lat, lng]}
      icon={customPinIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onLocationChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
        },
      }}
    />
  );
};

interface RoomConfig {
  room_number: string;
  floor: number;
  room_type: string;
  capacity: number; // Number of beds
  price: number;
  deposit: number;
}

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('PG');
  const [genderPolicy, setGenderPolicy] = useState('Unisex');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');

  // Step 2: Location & Map Pin
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kolhapur');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('416003');
  const [latitude, setLatitude] = useState(16.7050);
  const [longitude, setLongitude] = useState(74.2433);

  // Step 3: Amenities & Rules
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-Speed WiFi', 'Nutritious Meals', 'Laundry Service', 'Daily Cleaning', '24/7 Security'
  ]);
  const [rules, setRules] = useState<string[]>([
    'No Smoking inside rooms', 'Visitor entry allowed till 9 PM', 'Gate closes at 10 PM'
  ]);
  const [newRuleInput, setNewRuleInput] = useState('');

  // Step 4: Photo Gallery & Uploads
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Step 5: Rooms & Beds Configuration
  const [roomsList, setRoomsList] = useState<RoomConfig[]>([
    { room_number: '101', floor: 1, room_type: 'Single', capacity: 1, price: 14000, deposit: 15000 },
    { room_number: '102', floor: 1, room_type: 'Double Sharing', capacity: 2, price: 8500, deposit: 10000 }
  ]);
  const [minimumStay, setMinimumStay] = useState('1 Month');

  const amenitiesList = [
    'High-Speed WiFi', 'Nutritious Meals', 'Laundry Service', 'Daily Cleaning',
    '24/7 Security', 'Gymnasium', 'Power Backup', 'Attached Bathroom', 'AC',
    'Parking', 'CCTV', 'Hot Water', 'Biometric Security', 'Study Lounge'
  ];

  const presetSampleImages = [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
  ];

  const toggleAmenity = (a: string) => {
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(item => item !== a) : [...prev, a]
    );
  };

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setRules(prev => [...prev, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  // Image Upload File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages(prev => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Room Configuration Management
  const handleAddRoom = () => {
    const nextRoomNo = (100 + roomsList.length + 1).toString();
    setRoomsList(prev => [
      ...prev,
      {
        room_number: nextRoomNo,
        floor: 1,
        room_type: 'Double Sharing',
        capacity: 2,
        price: 8500,
        deposit: 10000
      }
    ]);
  };

  const handleUpdateRoom = (index: number, field: keyof RoomConfig, value: any) => {
    setRoomsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRoom = (index: number) => {
    if (roomsList.length <= 1) {
      alert('Property must have at least 1 room configuration.');
      return;
    }
    setRoomsList(prev => prev.filter((_, i) => i !== index));
  };

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
        },
        (err) => {
          alert('Could not fetch current GPS location: ' + err.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Property name is required.');
      setStep(1);
      return;
    }
    if (images.length === 0) {
      alert('Please upload at least 1 photo of your stay.');
      setStep(4);
      return;
    }

    try {
      setIsSubmitting(true);
      const overallDeposit = roomsList.length > 0 ? roomsList[0].deposit : 10000;

      // 1. Create Property
      const res = await apiFetch<any>('/properties', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          property_type: propertyType,
          gender_policy: genderPolicy,
          description: description.trim() || `Premium ${propertyType} stay in ${city}`,
          address: address.trim() || `${city} Main Road`,
          city: city.trim(),
          state: state.trim(),
          country: 'India',
          postal_code: postalCode.trim(),
          latitude,
          longitude,
          nearby_places: ['Local Station (800m)', 'City Market (400m)'],
          images,
          amenities: selectedAmenities,
          rules,
          deposit: overallDeposit,
          minimum_stay: minimumStay
        })
      });

      // 2. Add Configured Rooms & Beds
      for (const rm of roomsList) {
        await apiFetch(`/properties/${res.id}/rooms`, {
          method: 'POST',
          body: JSON.stringify({
            room_number: rm.room_number,
            floor: rm.floor,
            room_type: rm.room_type,
            capacity: Number(rm.capacity),
            price: Number(rm.price),
            deposit: Number(rm.deposit),
            amenities: selectedAmenities.slice(0, 4),
            description: `${rm.room_type} room with ${rm.capacity} beds.`
          })
        });
      }

      navigate('/owner/properties');
    } catch (e: any) {
      alert(e.message || 'Failed creating property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBedsAcrossProperty = roomsList.reduce((sum, r) => sum + Number(r.capacity), 0);

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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between lg:hidden mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
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
          
          {/* Wizard Header & Progress Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">List a New Property</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Step {step} of 5 — {
                  step === 1 ? 'Basic Info & Identity' :
                  step === 2 ? 'Location & Map Pinning' :
                  step === 3 ? 'Amenities & Rules' :
                  step === 4 ? 'Photos & Media Gallery' : 'Rooms & Bed Configuration'
                }
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <div
                  key={s}
                  onClick={() => s < step && setStep(s)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    s === step ? 'w-8 bg-brand-600' : s < step ? 'w-5 bg-brand-300' : 'w-4 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Basic Info & Property Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Property Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Mahalaxmi Executive PG"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
                  >
                    <option value="PG">PG (Paying Guest)</option>
                    <option value="Hostel">Student Hostel</option>
                    <option value="Co-living">Co-Living Space</option>
                    <option value="Dormitory">Dormitory</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Gender Policy</label>
                  <select
                    value={genderPolicy}
                    onChange={e => setGenderPolicy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
                  >
                    <option value="Boys">Boys Only</option>
                    <option value="Girls">Girls Only</option>
                    <option value="Unisex">Unisex / All Welcome</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Property Overview & Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your stay, meal options, cleanliness standards, nearby colleges or tech parks..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location & Interactive Map Pin Picker */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Tarabai Park, Station Road"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="Kolhapur"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">State</label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    placeholder="416003"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Interactive Map Pin Option */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-600" /> Pin Property on Map
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Click anywhere on the map or drag the pin marker to specify exact coordinates.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-brand-600" /> Use GPS Location
                  </button>
                </div>

                {/* Map Preview Container */}
                <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 relative z-0">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <MapLocationPicker
                      lat={latitude}
                      lng={longitude}
                      onLocationChange={(nLat, nLng) => {
                        setLatitude(nLat);
                        setLongitude(nLng);
                      }}
                    />
                  </MapContainer>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span><strong>Lat:</strong> {latitude}</span>
                  <span><strong>Lng:</strong> {longitude}</span>
                  <span className="text-brand-600 text-[11px] ml-auto font-bold">✓ Location Pinned</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Property Amenities & Rules */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Amenities Included</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesList.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        selectedAmenities.includes(a)
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{a}</span>
                      {selectedAmenities.includes(a) && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom House Rules */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-2">Stay Rules & Guidelines</label>
                <div className="space-y-2 mb-3">
                  {rules.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                      <span>• {r}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Quiet hours after 10 PM"
                    value={newRuleInput}
                    onChange={e => setNewRuleInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700"
                  >
                    Add Rule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Photo Gallery & Upload Box */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Property Photos & Media</label>
                
                {/* File Dropzone Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-300 hover:border-brand-500 bg-brand-50/40 hover:bg-brand-50/70 transition-all rounded-2xl p-6 text-center cursor-pointer mb-4"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">Click or Drag photos to upload</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Supports JPG, PNG, WEBP (Multiple photos allowed)</p>
                </div>

                {/* Add Photo URL Input */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                    value={customImageUrl}
                    onChange={e => setCustomImageUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 shrink-0"
                  >
                    Add Photo URL
                  </button>
                </div>

                {/* Preset HD Gallery Picker */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Quick Add Sample HD Photos</span>
                  <div className="grid grid-cols-4 gap-2">
                    {presetSampleImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => !images.includes(img) && setImages(prev => [...prev, img])}
                        className="aspect-video rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 relative"
                      >
                        <img src={img} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Uploaded Gallery Grid */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-3">Uploaded Photo Gallery ({images.length})</span>
                  {images.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400 font-semibold">
                      No photos uploaded yet. Please add at least 1 photo of your stay.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
                          <img src={img} alt={`Photo ${idx+1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                              Cover Photo
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 shadow-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Rooms & Beds Inventory Configuration */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Rooms & Beds Configuration</h3>
                  <p className="text-xs text-slate-500 font-medium">Specify room types, bed capacity, and rent pricing per bed.</p>
                </div>

                <button
                  type="button"
                  onClick={handleAddRoom}
                  className="px-3.5 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Room Config
                </button>
              </div>

              {/* Room Cards List */}
              <div className="space-y-4">
                {roomsList.map((rm, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 relative">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <BedDouble className="w-4 h-4 text-brand-600" /> Room #{rm.room_number} ({rm.room_type})
                      </span>
                      {roomsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRoom(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Room No.</label>
                        <input
                          type="text"
                          value={rm.room_number}
                          onChange={e => handleUpdateRoom(idx, 'room_number', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Room Type</label>
                        <select
                          value={rm.room_type}
                          onChange={e => handleUpdateRoom(idx, 'room_type', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        >
                          <option value="Single">Single Room</option>
                          <option value="Double Sharing">Double Sharing</option>
                          <option value="Triple Sharing">Triple Sharing</option>
                          <option value="4-Bed Dorm">4-Bed Dormitory</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">No. of Beds (Capacity)</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={rm.capacity}
                          onChange={e => handleUpdateRoom(idx, 'capacity', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Rent / Bed (₹)</label>
                        <input
                          type="number"
                          value={rm.price}
                          onChange={e => handleUpdateRoom(idx, 'price', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Minimum Stay Selection */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Minimum Stay Duration</label>
                  <select
                    value={minimumStay}
                    onChange={e => setMinimumStay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 cursor-pointer"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                  </select>
                </div>

                <div className="bg-brand-50/60 p-3.5 rounded-2xl border border-brand-200 flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block mb-0.5">Inventory Breakdown</span>
                  <span className="text-sm font-extrabold text-brand-950">
                    {roomsList.length} Rooms • {totalBedsAcrossProperty} Total Beds Available
                  </span>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-brand-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" /> Ready to Submit Listing
                </h4>
                <p className="text-xs text-slate-300"><strong>Property:</strong> {name || 'Untitled Stay'} ({propertyType} - {genderPolicy})</p>
                <p className="text-xs text-slate-300"><strong>Address:</strong> {address || city}, {city}, {state}</p>
                <p className="text-xs text-slate-300"><strong>Capacity:</strong> {roomsList.length} Rooms ({totalBedsAcrossProperty} Beds), {images.length} Photos Pinned</p>
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !name.trim()) { alert('Property name is required'); return; }
                  setStep(step + 1);
                }}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Submitting Stay Listing...' : 'Publish Property & Inventory'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
