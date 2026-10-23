import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { useAuthStore } from '../stores/authStore';
import { apiFetch } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Building2, BedDouble, DollarSign, MessageSquare, Wrench, Calendar, 
  Search, Plus, Menu, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp, UserCheck,
  Check, X, Eye, Phone, Mail, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessingBookingId(bookingId);
      const updated = await apiFetch<any>(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setRecentBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, ...updated, status: newStatus } : b)));
      if (selectedBookingForDetails?.id === bookingId) {
        setSelectedBookingForDetails((prev: any) => prev ? { ...prev, ...updated, status: newStatus } : null);
      }
      setActionSuccessMsg(`Booking successfully ${newStatus === 'APPROVED' ? 'confirmed & approved' : 'declined'}.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (e: any) {
      alert(e.message || 'Failed updating booking status');
    } finally {
      setProcessingBookingId(null);
    }
  };

  useEffect(() => {
    const loadOwnerData = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch('/analytics/owner');
        setStats(data);

        const bookings = await apiFetch<any[]>('/bookings/my-bookings');
        setRecentBookings(bookings || []);

        const tickets = await apiFetch<any[]>('/maintenance');
        setMaintenanceTickets(tickets || []);

        const enqList = await apiFetch<any[]>('/enquiries');
        setEnquiries(enqList || []);
      } catch (e) {
        console.error('Failed loading analytics/dashboard data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadOwnerData();
  }, []);

  const chartData = stats?.occupancy_trend || [
    { month: 'Jan', occupancy: 0 },
    { month: 'Feb', occupancy: 0 },
    { month: 'Mar', occupancy: 0 },
    { month: 'Apr', occupancy: 0 },
    { month: 'May', occupancy: 0 },
    { month: 'Jun', occupancy: 0 }
  ];

  const urgentTickets = maintenanceTickets.filter(t => t.priority === 'HIGH' && t.status !== 'RESOLVED');

  const filteredBookings = recentBookings.filter(b => 
    !searchQuery || 
    (b.seeker_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.property_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

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
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-sm leading-none tracking-tight">HMS Owner</span>
              <span className="text-[9px] font-extrabold text-brand-600 uppercase tracking-wider mt-0.5">PORTAL</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
        </div>

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Good morning, {user?.name || 'Owner'}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Here is what's happening with your properties on HMS today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter bookings or stay..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-full md:w-64 shadow-2xs"
              />
            </div>
            <Link to="/owner/properties/new" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 flex items-center gap-1.5 shrink-0 transition-all">
              <Plus className="w-4 h-4" /> Add Property
            </Link>
          </div>
        </div>

        {/* 4 Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Card 1: Total Properties */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-brand-300 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Properties Managed</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : (stats?.total_properties ?? 0)}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 block mt-1">Listed & verified stays</span>
          </div>

          {/* Card 2: Beds Occupancy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-brand-300 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bed Occupancy</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {isLoading ? '...' : (stats?.occupied_beds ?? 0)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ {isLoading ? '...' : (stats?.total_beds ?? 0)} total</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 block mt-1">Active tenant beds</span>
          </div>

          {/* Card 3: Collected Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{isLoading ? '...' : (stats?.total_revenue ?? 0).toLocaleString()}
            </div>
            <span className="text-[11px] font-bold text-emerald-600 block mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Rent Collected
            </span>
          </div>

          {/* Card 4: Pending Enquiries */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Enquiries</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : (stats?.pending_enquiries ?? 0)}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 block mt-1">Active seeker inquiries</span>
          </div>
        </div>

        {/* Middle Section: Chart & Maintenance Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Occupancy Trend Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Occupancy Trend (%)</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Average bed occupancy timeline for your units.</p>
              </div>
              <span className="text-xs font-extrabold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl">
                {stats ? stats.occupancy_rate : 0}% Avg
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="occupancy" name="Occupancy %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maintenance Requests Panel */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-brand-600" /> Maintenance Queue
                </h3>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  urgentTickets.length > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {urgentTickets.length} Urgent
                </span>
              </div>

              {maintenanceTickets.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 p-4 my-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">All clear!</p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">No maintenance requests reported for your stays.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceTickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors">
                      <h4 className="font-bold text-slate-900 text-xs">{ticket.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ticket.property_name || 'Stay'} • Rm {ticket.room_number || '101'}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] font-bold">
                        <span className={ticket.priority === 'HIGH' ? 'text-red-600' : 'text-amber-600'}>
                          {ticket.priority} Priority
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/owner/maintenance" className="mt-4 text-center block text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors">
              View All Maintenance Tickets →
            </Link>
          </div>
        </div>

        {/* Bottom Section: Recent Bookings & Upcoming Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Recent Bookings Table */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-brand-600" /> Recent Booking Requests
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Manage and confirm tenant move-in applications.</p>
              </div>
              <Link to="/owner/bookings" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
                View All Bookings ({recentBookings.length}) →
              </Link>
            </div>

            {actionSuccessMsg && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[540px]">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Tenant Name</th>
                    <th className="py-3 px-3">Property & Room</th>
                    <th className="py-3 px-3">Move-In</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {(b.seeker_name || 'T').charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{b.seeker_name || 'Tenant'}</span>
                              {b.seeker_phone && <span className="text-[10px] text-slate-400 font-normal">{b.seeker_phone}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          <div>{b.property_name || 'HMS Stay'}</div>
                          {b.room_number && <div className="text-[10px] text-slate-400 font-normal">Rm #{b.room_number}</div>}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{b.move_in_date || 'Immediate'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            b.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : b.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedBookingForDetails(b)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {b.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'APPROVED')}
                                  disabled={processingBookingId === b.id}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                                  title="Confirm & Approve Booking"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Confirm</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Decline this booking application?')) {
                                      handleUpdateBookingStatus(b.id, 'REJECTED');
                                    }
                                  }}
                                  disabled={processingBookingId === b.id}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Decline"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs text-slate-400 font-semibold">
                        No recent booking requests for your properties.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tour & Enquiry Activity Timeline */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" /> Tour & Enquiry Activity
            </h3>

            {enquiries.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No pending property visits or enquiries.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiries.slice(0, 4).map((enq, idx) => (
                  <div key={enq.id || idx} className="flex gap-3 items-start p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1 shrink-0"></div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{enq.name || 'Visitor Enquiry'}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{enq.message || 'Interested in booking stay'}</p>
                      <span className="text-[10px] font-bold text-brand-600 block mt-1">Status: {enq.status || 'OPEN'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Booking Inspection Modal */}
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
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Room Requested</span>
                    <span className="font-bold text-slate-900">
                      {selectedBookingForDetails.room_type || 'Standard'} {selectedBookingForDetails.room_number ? `#${selectedBookingForDetails.room_number}` : ''}
                    </span>
                  </div>
                  {selectedBookingForDetails.room_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Monthly Rent</span>
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
                          handleUpdateBookingStatus(selectedBookingForDetails.id, 'REJECTED');
                        }
                      }}
                      disabled={Boolean(processingBookingId)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, 'APPROVED')}
                      disabled={Boolean(processingBookingId)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer"
                    >
                      {processingBookingId ? 'Confirming...' : 'Confirm & Approve Booking'}
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
