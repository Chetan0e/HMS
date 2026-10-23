import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { apiFetch } from '../lib/api';
import { Booking } from '../types';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Search, CheckCircle2, XCircle, Clock, 
  Phone, Mail, Building2, BedDouble, Calendar, 
  Menu, Eye, Check, X, AlertCircle
} from 'lucide-react';

export const OwnerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<Booking[]>('/bookings/my-bookings');
      setBookings(data || []);
    } catch (e: any) {
      console.error('Failed to load bookings', e);
      setErrorMsg(e.message || 'Failed loading bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessingId(bookingId);
      setErrorMsg(null);
      
      const updated = await apiFetch<Booking>(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, ...updated, status: newStatus } : b)));
      
      if (selectedBookingForDetails?.id === bookingId) {
        setSelectedBookingForDetails(prev => prev ? { ...prev, ...updated, status: newStatus } : null);
      }

      setSuccessMsg(`Booking request successfully ${newStatus === 'APPROVED' ? 'confirmed & approved' : 'rejected'}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || `Failed to update booking to ${newStatus}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (b.seeker_name || '').toLowerCase().includes(q) ||
      (b.property_name || '').toLowerCase().includes(q) ||
      (b.seeker_email || '').toLowerCase().includes(q) ||
      (b.seeker_phone || '').toLowerCase().includes(q) ||
      (b.room_number || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
  const rejectedCount = bookings.filter(b => b.status === 'REJECTED').length;

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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between lg:hidden mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-slate-900 text-sm">Booking Requests</span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-full">
              {pendingCount} Pending
            </span>
          )}
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <ClipboardList className="w-4 h-4 text-brand-600" />
              <span>Tenant Applications</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Booking Requests & Confirmations</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review and confirm prospective tenant move-in applications for your properties.
            </p>
          </div>

          <Link
            to="/owner/residents"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-2xs transition-all shrink-0"
          >
            <span>Active Residents Directory →</span>
          </Link>
        </div>

        {/* Feedback Alert Banners */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Received</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{bookings.length}</span>
              <ClipboardList className="w-5 h-5 text-brand-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Pending Review</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Confirmed & Approved</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-700">{approvedCount}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rejected / Closed</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-600">{rejectedCount}</span>
              <XCircle className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tenant name, phone, email, or property..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                {tab === 'PENDING' && pendingCount > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'PENDING' ? 'bg-white text-brand-700' : 'bg-amber-200 text-amber-900'}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Content */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-32 mx-auto"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base">No booking requests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No applications match your active search or filters. Try clearing filters.'
                : 'When prospective tenants apply for your listed properties, their move-in requests will appear here for review and confirmation.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isPending = b.status === 'PENDING';
              const isApproved = b.status === 'APPROVED';
              const isRejected = b.status === 'REJECTED';
              const isBusy = processingId === b.id;

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all shadow-2xs hover:shadow-md ${
                    isPending ? 'border-amber-200 ring-1 ring-amber-400/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Tenant & Property summary */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-base shrink-0 shadow-xs">
                        {(b.seeker_name || 'T').charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-base">{b.seeker_name || 'Prospective Tenant'}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isApproved ? '✓ Confirmed & Approved' : isPending ? '● Pending Review' : b.status}
                          </span>
                        </div>

                        {/* Property & Room */}
                        <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold flex-wrap">
                          <span className="flex items-center gap-1 text-slate-900 font-bold">
                            <Building2 className="w-3.5 h-3.5 text-brand-600" />
                            {b.property_name || 'HMS Property'}
                          </span>
                          {(b.room_type || b.room_number) && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                              {b.room_type || 'Room'} {b.room_number ? `#${b.room_number}` : ''}
                            </span>
                          )}
                          {b.room_price && (
                            <span className="text-brand-700 font-extrabold">
                              ₹{b.room_price.toLocaleString()}/mo
                            </span>
                          )}
                        </div>

                        {/* Contacts */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                          {b.seeker_phone && (
                            <a
                              href={`tel:${b.seeker_phone}`}
                              className="flex items-center gap-1 hover:text-brand-600 transition-colors"
                              title="Call Tenant"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{b.seeker_phone}</span>
                            </a>
                          )}
                          {b.seeker_email && (
                            <a
                              href={`mailto:${b.seeker_email}`}
                              className="flex items-center gap-1 hover:text-brand-600 transition-colors"
                              title="Email Tenant"
                            >
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{b.seeker_email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Move-In & Duration */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-3 text-xs lg:min-w-[220px]">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Move-In Date</span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          {b.move_in_date || 'Immediate'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Stay Duration</span>
                        <span className="font-bold text-slate-800 block mt-0.5">{b.stay_duration || 'Flexible'}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <button
                        onClick={() => setSelectedBookingForDetails(b)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View Full Booking Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'APPROVED')}
                            disabled={isBusy}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isBusy ? 'Confirming...' : 'Confirm'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to decline this booking request?')) {
                                handleUpdateStatus(b.id, 'REJECTED');
                              }
                            }}
                            disabled={isBusy}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <div className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Approved</span>
                        </div>
                      )}

                      {isRejected && (
                        <div className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-slate-400" />
                          <span>Declined</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional notes row */}
                  {b.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                      <span className="font-bold text-slate-500 shrink-0">Tenant Note:</span>
                      <span className="italic">"{b.notes}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Inspection Modal */}
        {selectedBookingForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-black flex items-center justify-center text-sm">
                    {(selectedBookingForDetails.seeker_name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Booking Application Details</h3>
                    <p className="text-xs text-slate-400 font-semibold">Reference ID: #{selectedBookingForDetails.id.slice(-6)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Current Request Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedBookingForDetails.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedBookingForDetails.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedBookingForDetails.status}
                </span>
              </div>

              {/* Tenant Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Tenant Profile</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-bold text-slate-900">{selectedBookingForDetails.seeker_name || 'N/A'}</span>
                  </div>
                  {selectedBookingForDetails.seeker_phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phone Number</span>
                      <a href={`tel:${selectedBookingForDetails.seeker_phone}`} className="font-bold text-brand-600 hover:underline">
                        {selectedBookingForDetails.seeker_phone}
                      </a>
                    </div>
                  )}
                  {selectedBookingForDetails.seeker_email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email Address</span>
                      <a href={`mailto:${selectedBookingForDetails.seeker_email}`} className="font-bold text-brand-600 hover:underline">
                        {selectedBookingForDetails.seeker_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Stay & Room Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Stay & Property Information</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Target Property</span>
                    <span className="font-bold text-slate-900">{selectedBookingForDetails.property_name || 'HMS Stay'}</span>
                  </div>
                  {selectedBookingForDetails.property_address && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Address</span>
                      <span className="font-semibold text-slate-700">{selectedBookingForDetails.property_address}, {selectedBookingForDetails.property_city || ''}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Room Requested</span>
                    <span className="font-bold text-slate-900">
                      {selectedBookingForDetails.room_type || 'Standard'} {selectedBookingForDetails.room_number ? `#${selectedBookingForDetails.room_number}` : ''}
                    </span>
                  </div>
                  {selectedBookingForDetails.room_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Agreed Monthly Rent</span>
                      <span className="font-extrabold text-brand-700">₹{selectedBookingForDetails.room_price.toLocaleString()}/month</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Proposed Move-In Date</span>
                    <span className="font-extrabold text-slate-900">{selectedBookingForDetails.move_in_date || 'Immediate'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Stay Duration</span>
                    <span className="font-bold text-slate-900">{selectedBookingForDetails.stay_duration || '6 Months'}</span>
                  </div>
                </div>
              </div>

              {/* Tenant Notes */}
              {selectedBookingForDetails.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Tenant Notes</h4>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 italic">
                    "{selectedBookingForDetails.notes}"
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>

                {selectedBookingForDetails.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        if (confirm('Decline this booking application?')) {
                          handleUpdateStatus(selectedBookingForDetails.id, 'REJECTED');
                        }
                      }}
                      disabled={Boolean(processingId)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedBookingForDetails.id, 'APPROVED')}
                      disabled={Boolean(processingId)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer"
                    >
                      {processingId ? 'Confirming...' : 'Confirm & Approve Booking'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
