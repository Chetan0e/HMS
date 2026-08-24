import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { Property, Room } from '../types';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { CheckCircle2, Star, MapPin, Users, ShieldCheck, Wifi, Utensils, Shirt, Sparkles, Calendar, MessageSquare, ArrowRight } from 'lucide-react';

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
  const [stayDuration, setStayDuration] = useState('6 Months');
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
    if (!property || !selectedRoom || !moveInDate) {
      alert('Please select a room and move-in date');
      return;
    }

    try {
      setIsSubmittingBooking(true);
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          property_id: property.id,
          room_id: selectedRoom.id,
          move_in_date: moveInDate,
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20 lg:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1">
        {/* Back Link */}
        <button onClick={() => navigate(-1)} className="text-xs font-bold text-slate-500 hover:text-slate-900 mb-4 flex items-center gap-1">
          ← Back to properties
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

            {/* Owner Info Card */}
            <div className="border-t border-slate-200 pt-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                    RS
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">Rahul Sharma</h4>
                    <p className="text-xs text-slate-500">Verified Property Host • HMS Managed</p>
                  </div>
                </div>
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
              </div>
            </div>
          </div>

          {/* Sticky Booking Form Side Card (Desktop & Tablet) */}
          <div className="lg:col-span-1" id="booking-card">
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
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Minimum Stay Duration</label>
                    <select
                      value={stayDuration}
                      onChange={(e) => setStayDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-900 cursor-pointer"
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                      <option value="12 Months">12 Months</option>
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
                  RS
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Contact Host</h3>
                  <p className="text-xs text-slate-500">{property.name}</p>
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
                    placeholder="Hi Rahul, I am interested in booking a stay at your property. Could you please provide more details regarding room availability and move-in process?"
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white border-t border-slate-200 z-40 flex items-center justify-between shadow-2xl">
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
      </div>

      <Footer />
    </div>
  );
};
