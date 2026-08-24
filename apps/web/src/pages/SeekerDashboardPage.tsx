import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { useAuthStore } from '../stores/authStore';
import { apiFetch } from '../lib/api';
import { Booking, Visit, Property, ResidentStay, MaintenanceItem, Enquiry } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { 
  Calendar, Heart, Home, Clock, Wrench, CreditCard, MessageSquare, 
  Plus, CheckCircle2, AlertCircle, X, ShieldCheck, MapPin, Phone, 
  Mail, ArrowRight, Compass, Filter, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SeekerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'stay' | 'bookings' | 'visits' | 'saved' | 'maintenance' | 'enquiries'>('bookings');
  
  const [myStay, setMyStay] = useState<ResidentStay | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Maintenance Modal State
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [mCategory, setMCategory] = useState('Plumbing');
  const [mTitle, setMTitle] = useState('');
  const [mPriority, setMPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [mDescription, setMDescription] = useState('');
  const [mSubmitting, setMSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load my stay
      try {
        const stayData = await apiFetch<ResidentStay>('/residents/my-stay');
        setMyStay(stayData);
        if (stayData) setActiveTab('stay');
      } catch (e) {
        setMyStay(null);
      }

      // Load bookings
      const b = await apiFetch<Booking[]>('/bookings/my-bookings');
      setBookings(b || []);

      // Load visits
      const v = await apiFetch<Visit[]>('/visits');
      setVisits(v || []);

      // Load saved properties
      const s = await apiFetch<Property[]>('/saved-properties');
      setSavedProperties(s || []);

      // Load maintenance
      const m = await apiFetch<MaintenanceItem[]>('/maintenance');
      setMaintenance(m || []);

      // Load enquiries
      const e = await apiFetch<Enquiry[]>('/enquiries');
      setEnquiries(e || []);

      // Load recommended properties
      const props = await apiFetch<Property[]>('/search');
      setRecommended(props?.slice(0, 3) || []);
    } catch (err) {
      console.error('Error loading seeker dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Cancel Booking handler
  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH' });
      triggerNotification('Booking request cancelled successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  // Cancel Visit handler
  const handleCancelVisit = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this visit?')) return;
    try {
      await apiFetch(`/visits/${id}/cancel`, { method: 'PATCH' });
      triggerNotification('Property visit cancelled.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel visit');
    }
  };

  // Toggle Saved Property
  const handleToggleSave = async (propId: string) => {
    const isAlreadySaved = savedProperties.some(p => p.id === propId);
    try {
      if (isAlreadySaved) {
        await apiFetch(`/saved-properties/${propId}`, { method: 'DELETE' });
        setSavedProperties(prev => prev.filter(p => p.id !== propId));
        triggerNotification('Removed from saved stays.');
      } else {
        await apiFetch(`/saved-properties/${propId}`, { method: 'POST' });
        triggerNotification('Added to saved stays!');
        loadData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Submit Maintenance Request
  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStay) return;
    setMSubmitting(true);
    try {
      await apiFetch('/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          property_id: myStay.property_id,
          room_id: myStay.room_id,
          category: mCategory,
          title: mTitle,
          priority: mPriority,
          description: mDescription
        })
      });
      setShowMaintenanceModal(false);
      setMTitle('');
      setMDescription('');
      triggerNotification('Maintenance request submitted successfully!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit maintenance request');
    } finally {
      setMSubmitting(false);
    }
  };

  const activeBookingsCount = bookings.filter(b => b.status === 'PENDING' || b.status === 'APPROVED').length;
  const scheduledVisitsCount = visits.filter(v => v.status === 'PENDING' || v.status === 'CONFIRMED').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Toast Alert */}
        {actionSuccess && (
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-brand-900 via-navy-900 to-brand-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-500/20 text-brand-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 border border-brand-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Seeker Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome back, {user?.name || 'Resident'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Manage your active stay, view booking status, schedule visits, and track service requests effortlessly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/explore"
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Compass className="w-4 h-4" /> Explore Stays
              </Link>
              <button
                onClick={loadData}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
                title="Refresh Dashboard"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Active Stay */}
          <div 
            onClick={() => setActiveTab(myStay ? 'stay' : 'bookings')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'stay' ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${myStay ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {myStay ? 'Resident' : 'None'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Active Stay</span>
            <span className="text-base font-bold text-slate-900 truncate block">
              {myStay ? `Room ${myStay.room_number || 'N/A'}` : 'No Active Stay'}
            </span>
          </div>

          {/* Active Bookings */}
          <div 
            onClick={() => setActiveTab('bookings')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Active Bookings</span>
            <span className="text-xl font-black text-slate-900">{activeBookingsCount}</span>
          </div>

          {/* Scheduled Visits */}
          <div 
            onClick={() => setActiveTab('visits')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'visits' ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Scheduled Visits</span>
            <span className="text-xl font-black text-slate-900">{scheduledVisitsCount}</span>
          </div>

          {/* Saved Stays */}
          <div 
            onClick={() => setActiveTab('saved')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'saved' ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Saved Stays</span>
            <span className="text-xl font-black text-slate-900">{savedProperties.length}</span>
          </div>

          {/* Maintenance Requests */}
          <div 
            onClick={() => setActiveTab('maintenance')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'maintenance' ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Maintenance</span>
            <span className="text-xl font-black text-slate-900">{maintenance.length}</span>
          </div>

          {/* Enquiries */}
          <div 
            onClick={() => setActiveTab('enquiries')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'enquiries' ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Enquiries</span>
            <span className="text-xl font-black text-slate-900">{enquiries.length}</span>
          </div>

        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {myStay && (
            <button
              onClick={() => setActiveTab('stay')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'stay' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" /> My Active Stay
            </button>
          )}
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'bookings' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" /> My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'visits' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" /> Scheduled Visits ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'saved' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" /> Saved Stays ({savedProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'maintenance' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" /> Maintenance ({maintenance.length})
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'enquiries' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Enquiries ({enquiries.length})
          </button>
        </div>

        {/* --- TAB CONTENT AREA --- */}

        {/* 1. MY ACTIVE STAY TAB */}
        {activeTab === 'stay' && (
          <div className="space-y-6">
            {myStay ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between border-b border-slate-100 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center overflow-hidden shrink-0">
                      {myStay.property_image ? (
                        <img src={myStay.property_image} alt={myStay.property_name} className="w-full h-full object-cover" />
                      ) : (
                        <Home className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">ACTIVE RESIDENT</span>
                        <span className="text-xs text-slate-500">Move-in: {myStay.move_in_date}</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">{myStay.property_name || 'HMS Partner Residence'}</h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {myStay.property_address}, {myStay.property_city}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowMaintenanceModal(true)}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Raise Maintenance Issue
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Room & Bed Info</span>
                    <div className="text-lg font-extrabold text-slate-900">Room {myStay.room_number || '101'}</div>
                    <p className="text-xs text-slate-600 mt-1">Bed: {myStay.bed_number || 'Bed A'} ({myStay.room_type || 'Single Room'})</p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Monthly Rent</span>
                    <div className="text-lg font-extrabold text-brand-600">₹{myStay.monthly_rent?.toLocaleString() || '12,000'} / mo</div>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Deposit Paid: ₹{myStay.deposit?.toLocaleString() || '15,000'}</p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Property Owner & Manager</span>
                    <div className="text-sm font-bold text-slate-900">{myStay.owner_name || 'Rahul Sharma'}</div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {myStay.owner_phone || '+91 98123 45678'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
                <Home className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Active Resident Stay</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Once your booking request is approved by a property owner, your room details and active stay information will appear here.
                </p>
                <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl">
                  Explore Stays <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 2. MY BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">My Booking Requests</h2>
                <p className="text-xs text-slate-500">Track and manage your room reservation requests</p>
              </div>
              <Link to="/explore" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                + New Booking
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No booking requests submitted yet.</p>
                <Link to="/explore" className="inline-block px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">
                  Find & Book a Stay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="p-5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{b.property_name || 'Stay Reservation'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Move-in Date: <strong className="text-slate-800">{b.move_in_date}</strong> | Duration: {b.stay_duration}
                        </p>
                        {b.notes && <p className="text-xs text-slate-600 italic mt-1">"{b.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        b.status === 'CANCELLED' ? 'bg-slate-200 text-slate-600' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {b.status}
                      </span>

                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. SCHEDULED VISITS TAB */}
        {activeTab === 'visits' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">Scheduled Property Tours</h2>
                <p className="text-xs text-slate-500">In-person and virtual property visits</p>
              </div>
            </div>

            {visits.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No property visits scheduled yet.</p>
                <Link to="/explore" className="inline-block px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">
                  Schedule a Tour
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map(v => (
                  <div key={v.id} className="p-5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{v.property_name || 'Property Tour'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Date: <strong className="text-slate-800">{v.proposed_date}</strong> at <strong className="text-slate-800">{v.proposed_time}</strong>
                        </p>
                        {v.notes && <p className="text-xs text-slate-600 italic mt-1">"{v.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        v.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        v.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        v.status === 'CANCELLED' ? 'bg-slate-200 text-slate-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {v.status}
                      </span>

                      {v.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelVisit(v.id)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                        >
                          Cancel Tour
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SAVED STAYS TAB */}
        {activeTab === 'saved' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">Saved Stays & Wishlist</h2>
                <p className="text-xs text-slate-500">Your bookmarked hostels, PGs, and co-living spaces</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{savedProperties.length} Saved</span>
            </div>

            {savedProperties.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Your saved stays list is empty.</p>
                <Link to="/explore" className="inline-block px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map(prop => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. MAINTENANCE REQUESTS TAB */}
        {activeTab === 'maintenance' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">Maintenance & Service Tickets</h2>
                <p className="text-xs text-slate-500">Track reported issues for your room and property</p>
              </div>

              {myStay && (
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> New Ticket
                </button>
              )}
            </div>

            {maintenance.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No maintenance requests reported.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenance.map(m => (
                  <div key={m.id} className="p-5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{m.title}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          m.priority === 'CRITICAL' || m.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {m.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{m.description}</p>
                      <span className="text-[11px] text-slate-400 block">{m.category} | {m.property_name || 'Resident Room'}</span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center ${
                      m.status === 'RESOLVED' || m.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-700' :
                      m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">My Sent Enquiries</h2>
                <p className="text-xs text-slate-500">Messages and inquiries sent to property managers</p>
              </div>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No enquiries sent yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map(e => (
                  <div key={e.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{e.property_name || 'Property Enquiry'}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        e.status === 'RESPONDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {e.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">"{e.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommended Stays Section */}
        {recommended.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Recommended Stays For You</h3>
                <p className="text-xs text-slate-500">Top rated PGs and hostels in popular locations</p>
              </div>
              <Link to="/explore" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View All Stays <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map(prop => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSaved={savedProperties.some(s => s.id === prop.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- MAINTENANCE MODAL --- */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Raise Maintenance Issue</h3>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={mCategory}
                  onChange={e => setMCategory(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Plumbing">Plumbing (Leaks, Taps, Washroom)</option>
                  <option value="Electrical">Electrical (Lights, Fans, Sockets)</option>
                  <option value="WiFi">WiFi & Internet</option>
                  <option value="Cleaning">Housekeeping & Cleaning</option>
                  <option value="Appliance">Appliances (AC, Geyser, Fridge)</option>
                  <option value="Carpentry">Furniture & Doors</option>
                  <option value="Other">Other Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Washroom tap leaking"
                  value={mTitle}
                  onChange={e => setMTitle(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={mPriority}
                  onChange={e => setMPriority(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="LOW">Low (Minor request)</option>
                  <option value="MEDIUM">Medium (Normal priority)</option>
                  <option value="HIGH">High (Urgent attention needed)</option>
                  <option value="CRITICAL">Critical (Immediate fix required)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue in detail..."
                  value={mDescription}
                  onChange={e => setMDescription(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {mSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
