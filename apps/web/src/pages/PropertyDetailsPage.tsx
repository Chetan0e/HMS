import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { Property, Room } from '../types';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { CheckCircle2, Star, MapPin, Users, ShieldCheck, Wifi, Utensils, Shirt, Sparkles, Calendar, MessageSquare, ArrowRight, ArrowLeft, Building2, BedDouble, ClipboardList } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const trigger = () => map.invalidateSize();
    trigger();
    const t1 = setTimeout(trigger, 150);
    const t2 = setTimeout(trigger, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
};

const propertyPin = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="display:flex;align-items:center;justify-content:center;">
      <div style="width:36px;height:36px;background:#2563eb;border:3px solid #ffffff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);">
        <div style="width:10px;height:10px;background:#ffffff;border-radius:50%;transform:rotate(45deg);"></div>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

export const PropertyDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form states for booking & visit request
  const [moveInDate, setMoveInDate] = useState('');
  const [stayDuration, setStayDuration] = useState('1 Month');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Contact Host Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const prop = await apiFetch<Property>(`/properties/${slug}`);
        setProperty(prop);
        if (prop?.minimum_stay) {
          setStayDuration(prop.minimum_stay);
        }
        const rms = await apiFetch<Room[]>(`/properties/${prop.id}/rooms`);
        setRooms(rms || []);
        if (rms && rms.length > 0) setSelectedRoom(rms[0]);
      } catch (e) {
        console.error('Failed loading details', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [slug]);

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!property || !enquiryMsg.trim()) return;

    try {
      setIsSendingEnquiry(true);
      await apiFetch('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          property_id: property.id,
          room_id: selectedRoom?.id || null,
          message: enquiryMsg
        })
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setIsContactModalOpen(false);
        setEnquirySuccess(false);
        setEnquiryMsg('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to send enquiry');
    } finally {
      setIsSendingEnquiry(false);
    }
  };

  const handleRequestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!property || !selectedRoom) {
      alert('Please select a valid room and property');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const targetDate = moveInDate || today;
    if (targetDate < today) {
      alert('Move-in date cannot be in the past');
      return;
    }


    try {
      setIsSubmittingBooking(true);
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          property_id: property.id,
          room_id: selectedRoom.id,
          move_in_date: targetDate,
          stay_duration: stayDuration,
          notes: bookingNotes
        })
      });

      setBookingSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit booking request');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="aspect-[16/7] bg-slate-200 rounded-3xl w-full"></div>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
  ];

  const isOwner = Boolean(
    user && property && (user.id === property.owner_id || user.role === 'OWNER' || user.role === 'ADMIN')
  );

  const hostName = property?.owner_name || 'Property Host';
  const hostInitials = (property?.owner_name || 'Host')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'H';

  const handleBack = () => {
    if (isOwner) {
      navigate('/owner/properties');
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-24 lg:pb-0 relative">
      <Navbar />

      {/* Floating Back Button on Mobile */}
      <button 
        onClick={handleBack} 
        className="md:hidden fixed top-2.5 left-3 z-50 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-md text-slate-800 hover:bg-white transition-all cursor-pointer border border-slate-200/80"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1">
        {/* Back Link */}
        <button onClick={handleBack} className="text-xs font-bold text-slate-500 hover:text-slate-900 mb-4 flex items-center gap-1 cursor-pointer">
          {isOwner ? '← Back to Owner Properties' : '← Back to properties'}
        </button>

        {/* Responsive Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs mb-6 sm:mb-8">
          <div className="md:col-span-2 aspect-[4/3] bg-slate-100 relative">
            <img src={images[0]} alt={property.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4 md:col-span-1">
            <div className="aspect-[4/3] bg-slate-100">
              <img src={images[1] || images[0]} alt={property.name} className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[4/3] bg-slate-100">
              <img src={images[2] || images[0]} alt={property.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="hidden md:block md:col-span-1 aspect-[4/3] bg-slate-100 relative">
            <img src={images[0]} alt={property.name} className="w-full h-full object-cover brightness-75" />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs bg-black/40">
              Verified Photos
            </div>
          </div>
        </div>

        {/* Property Info Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {property.verification_status === 'Verified' && (
                  <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> HMS Verified Property
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {property.property_type}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                {property.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900">{property.rating}</span>
                  <span className="text-slate-400">({property.review_count} reviews)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{property.address}, {property.city}</span>
                </div>
                <span>•</span>
                <span className="text-brand-600 font-bold">{property.gender_policy}</span>
              </div>
            </div>

            {/* About Section */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">About this property</h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{property.description}</p>
            </div>

            {/* Premium Amenities */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Premium Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Rooms */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Available Rooms & Beds</h2>
              <div className="space-y-3">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoom(r)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      selectedRoom?.id === r.id
                        ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{r.room_type} Occupancy</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {r.available_beds} beds available
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{r.description || 'Private room with study desk and wardrobe.'}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-extrabold text-slate-900">₹{r.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 font-normal">/mo</span>
                      </div>
                      <button
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                          selectedRoom?.id === r.id
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {selectedRoom?.id === r.id ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Neighborhood Map */}
            {property.latitude && property.longitude && (
              <div className="border-t border-slate-200 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Location & Neighborhood</h2>
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" /> {property.address}, {property.city}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 shrink-0"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>

                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative z-0">
                  <MapContainer
                    center={[Number(property.latitude), Number(property.longitude)]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="w-full h-full"
                    style={{ height: '100%', width: '100%', minHeight: '250px' }}
                  >
                    <TileLayer
                      attribution='Tiles &copy; Esri &mdash; Source: Esri'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                      maxZoom={19}
                    />
                    <MapResizer />
                    <Marker position={[Number(property.latitude), Number(property.longitude)]} icon={propertyPin}>
                      <Popup>
                        <div className="p-1 font-bold text-xs text-slate-900">
                          {property.name}
                          <p className="text-[11px] font-normal text-slate-500">{property.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Owner Info Card */}
            <div className="border-t border-slate-200 pt-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                    {hostInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{hostName}</h4>
                    <p className="text-xs text-slate-500">Verified Property Host • HMS Managed</p>
                  </div>
                </div>
                {!isOwner && (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        setIsContactModalOpen(true);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 hover:border-brand-500 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-brand-600" /> Contact Host
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Side Card (Desktop & Tablet) */}
          <div className="lg:col-span-1" id="booking-card">
            {isOwner ? (
              <div className="bg-white p-6 rounded-3xl border-2 border-brand-500/30 shadow-lg sticky top-24 space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-sm">
                    <Building2 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Owner Listing Preview</h3>
                    <p className="text-[11px] text-slate-400 font-semibold">You own & manage this stay</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Listing Status</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                      {property.property_status || 'Published'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Verification</span>
                    <span className="font-bold text-slate-800">{property.verification_status || 'Verified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Profile Views</span>
                    <span className="font-bold text-slate-800">{property.views || 0} views</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Rooms Listed</span>
                    <span className="font-bold text-slate-800">{rooms.length} rooms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Deposit Amount</span>
                    <span className="font-extrabold text-slate-900">₹{property.deposit?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => navigate('/owner/bookings')}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>View Booking Requests</span>
                  </button>

                  <button
                    onClick={() => navigate('/owner/rooms')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <BedDouble className="w-4 h-4 text-slate-600" />
                    <span>Manage Rooms & Beds</span>
                  </button>

                  <button
                    onClick={() => navigate('/owner/properties')}
                    className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>← Back to Properties Section</span>
                  </button>
                </div>
              </div>
            ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg sticky top-24 space-y-6">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Starting Monthly Rent</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{selectedRoom ? selectedRoom.price.toLocaleString() : property.deposit.toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-xs font-semibold">/month</span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-sm">Booking Request Sent!</h4>
                  <p className="text-xs text-emerald-700">The property host will review your request shortly.</p>
                  <button
                    onClick={() => navigate('/app')}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold mt-2 shadow-sm"
                  >
                    View My Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestBooking} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Selected Room</label>
                    <select
                      value={selectedRoom?.id || ''}
                      onChange={(e) => {
                        const r = rooms.find(rm => rm.id === e.target.value);
                        if (r) setSelectedRoom(r);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    >
                      {rooms.length === 0 ? (
                        <option value="">Standard Room (₹{property.deposit.toLocaleString()}/mo)</option>
                      ) : (
                        rooms.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.room_type} Room {r.room_number ? `#${r.room_number}` : ''} — ₹{r.price.toLocaleString()}/mo
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Proposed Move-in Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={moveInDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const today = new Date().toISOString().split('T')[0];
                        if (e.target.value < today) {
                          alert('Move-in date cannot be in the past');
                          setMoveInDate(today);
                          return;
                        }
                        setMoveInDate(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
                    />
                  </div>


                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Stay Duration {property?.minimum_stay ? `(Minimum: ${property.minimum_stay})` : ''}
                    </label>
                    <select
                      value={stayDuration}
                      onChange={(e) => setStayDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                      <option value="9 Months">9 Months</option>
                      <option value="11 Months">11 Months</option>
                      <option value="12 Months">12 Months (1 Year)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-brand-600/20 cursor-pointer"
                  >
                    {isSubmittingBooking ? 'Sending Request...' : 'Request Booking'}
                  </button>
                </form>
              )}
            </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Host Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                  {hostInitials}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Contact Host</h3>
                  <p className="text-xs text-slate-500">{property.name} • {hostName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {enquirySuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Enquiry Sent!</h4>
                <p className="text-xs text-emerald-700">The host will review your enquiry and get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder={`Hi ${hostName}, I am interested in booking a stay at your property. Could you please provide more details regarding room availability and move-in process?`}
                    value={enquiryMsg}
                    onChange={(e) => setEnquiryMsg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingEnquiry}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    {isSendingEnquiry ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Sticky Mobile Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 flex items-center justify-between shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        {isOwner ? (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Owner Mode</span>
              <span className="text-xs font-extrabold text-slate-900 line-clamp-1">{property.name}</span>
            </div>
            <button
              onClick={() => navigate('/owner/properties')}
              className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Back to Properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Starting at</span>
              <span className="text-lg font-black text-slate-900">
                ₹{selectedRoom ? selectedRoom.price.toLocaleString() : property.deposit.toLocaleString()}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </span>
            </div>
            <button
              onClick={() => {
                const card = document.getElementById('booking-card');
                card?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <span>Book Stay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};
