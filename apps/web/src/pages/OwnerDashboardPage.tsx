import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { useAuthStore } from '../stores/authStore';
import { apiFetch } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, BedDouble, DollarSign, MessageSquare, Wrench, Calendar, Bell, Search, Plus, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const loadOwnerData = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch('/analytics/owner');
        setStats(data);
        const bookings = await apiFetch('/bookings/my-bookings');
        setRecentBookings(bookings.slice(0, 5));
      } catch (e) {
        console.error('Failed loading analytics', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadOwnerData();
  }, []);

  const chartData = stats?.occupancy_trend || [
    { month: 'Jan', occupancy: 65 },
    { month: 'Feb', occupancy: 70 },
    { month: 'Mar', occupancy: 78 },
    { month: 'Apr', occupancy: 82 },
    { month: 'May', occupancy: 88 },
    { month: 'Jun', occupancy: 92 }
  ];

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
            <img src="/logo.svg" alt="HMS Logo" className="w-8 h-8 drop-shadow-xs" />
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-sm leading-none tracking-tight">HMS</span>
              <span className="text-[9px] font-extrabold text-brand-600 uppercase tracking-wider mt-0.5">HOSTEL & STAY</span>
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
              Good morning, {user?.name || 'Rahul'}
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
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-brand-600 relative shadow-2xs shrink-0">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-brand-600 rounded-full absolute top-2 right-2"></span>
            </button>
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
              {stats ? stats.total_properties : 14}
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
                {stats ? stats.occupied_beds : 412}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ {stats ? stats.total_beds : 485}</span>
            </div>
          </div>

          {/* Card 3: Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Collected Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{stats ? stats.total_revenue.toLocaleString() : '2,45,000'}
            </div>
          </div>

          {/* Card 4: Pending Enquiries */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Enquiries</span>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {stats ? stats.pending_enquiries : 28}
            </div>
          </div>
        </div>

        {/* Middle Section: Chart & Maintenance Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Occupancy Trend Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Occupancy Trend</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-xs font-bold">Monthly</button>
                <button className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-medium">Quarterly</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="occupancy" fill="#2563eb" radius={[6, 6, 0, 0]} />
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
                <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">6 Urgent</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="font-bold text-slate-900 text-xs">Plumbing Leak</h4>
                  <p className="text-[11px] text-slate-500">HMS 101, Kitchen area</p>
                  <span className="text-[10px] text-red-600 font-bold block mt-1">High Priority • Reported 2h ago</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="font-bold text-slate-900 text-xs">AC Servicing</h4>
                  <p className="text-[11px] text-slate-500">Marina Heights, Rm 12</p>
                  <span className="text-[10px] text-amber-600 font-bold block mt-1">Scheduled • Today</span>
                </div>
              </div>
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
              <Link to="/owner/properties" className="text-xs font-bold text-brand-600 hover:underline">View All +</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[500px]">
                <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Resident</th>
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3">Move-In</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 px-3 font-bold text-slate-900">{b.seeker_name || 'Anita Smith'}</td>
                        <td className="py-3 px-3">{b.property_name || 'HMS 101, Rm 12'}</td>
                        <td className="py-3 px-3">{b.move_in_date || 'Oct 12, 2026'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">Anita Smith</td>
                        <td className="py-3 px-3">HMS 101, Rm 12</td>
                        <td className="py-3 px-3">Oct 12, 2026</td>
                        <td className="py-3 px-3"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Confirmed</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">John Doe</td>
                        <td className="py-3 px-3">Marina Heights, Rm 4</td>
                        <td className="py-3 px-3">Oct 15, 2026</td>
                        <td className="py-3 px-3"><span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Pending</span></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Visits Timeline */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" /> Upcoming Visits
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Property Tour</h4>
                  <p className="text-[11px] text-slate-500">Sarah Jenkins • HMS 101</p>
                  <span className="text-[10px] font-bold text-brand-600 block mt-0.5">10:00 AM Today</span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Lease Signing</h4>
                  <p className="text-[11px] text-slate-500">David Chen • Rm 05</p>
                  <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">02:30 PM Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
