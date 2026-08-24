import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { useAuthStore } from '../stores/authStore';
import { apiFetch } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, BedDouble, DollarSign, MessageSquare, Wrench, Calendar, Bell, Search, Plus, Menu, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

          <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
            {user?.name.charAt(0)}
          </div>
        </div>

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
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
                placeholder="Search unit or resident..."
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none w-full md:w-64 shadow-2xs"
              />
            </div>
            <Link to="/owner/properties/new" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-4 h-4" /> Add Unit
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Card 1: Total Properties */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Properties</span>
              <Building2 className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : (stats?.total_properties ?? 0)}
            </div>
          </div>

          {/* Card 2: Beds */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Beds (Occupied / Total)</span>
              <BedDouble className="w-4 h-4 text-brand-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {isLoading ? '...' : (stats?.occupied_beds ?? 0)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ {isLoading ? '...' : (stats?.total_beds ?? 0)}</span>
            </div>
          </div>

          {/* Card 3: Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Collected Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{isLoading ? '...' : (stats?.total_revenue ?? 0).toLocaleString()}
            </div>
          </div>

          {/* Card 4: Pending Enquiries */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Enquiries</span>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : (stats?.pending_enquiries ?? 0)}
            </div>
          </div>
        </div>

        {/* Middle Section: Chart & Maintenance Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Occupancy Trend Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Occupancy Trend (%)</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-xs font-bold">Monthly</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Wrench className="w-4 h-4 text-brand-600" /> Maintenance
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  urgentTickets.length > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {urgentTickets.length} Urgent
                </span>
              </div>

              {maintenanceTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">No maintenance requests reported for your properties.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceTickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <h4 className="font-bold text-slate-900 text-xs">{ticket.title}</h4>
                      <p className="text-[11px] text-slate-500">{ticket.property_name || 'Stay'} • Rm {ticket.room_number || '101'}</p>
                      <span className={`text-[10px] font-bold block mt-1 ${
                        ticket.priority === 'HIGH' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {ticket.priority} Priority • {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/owner/maintenance" className="mt-4 text-center block text-xs font-bold text-brand-600 hover:underline">
              View All Requests →
            </Link>
          </div>
        </div>

        {/* Bottom Section: Recent Bookings & Upcoming Visits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Recent Bookings Table */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Bookings</h3>
              <Link to="/owner/properties" className="text-xs font-bold text-brand-600 hover:underline">View Properties →</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[500px]">
                <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Seeker</th>
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3">Move-In</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 px-3 font-bold text-slate-900">{b.seeker_name || 'Tenant'}</td>
                        <td className="py-3 px-3">{b.property_name || 'HMS Stay'}</td>
                        <td className="py-3 px-3">{b.move_in_date || 'TBD'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : b.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-semibold">
                        No recent booking requests for your properties.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Visits / Enquiries Timeline */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" /> Tour & Enquiry Activity
            </h3>

            {enquiries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No pending property visits or enquiries.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiries.slice(0, 3).map((enq, idx) => (
                  <div key={enq.id || idx} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{enq.subject || 'Property Enquiry'}</h4>
                      <p className="text-[11px] text-slate-500">{enq.name} • {enq.message}</p>
                      <span className="text-[10px] font-bold text-brand-600 block mt-0.5">Status: {enq.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
