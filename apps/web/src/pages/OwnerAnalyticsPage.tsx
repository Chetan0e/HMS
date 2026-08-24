import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { apiFetch } from '../lib/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, BedDouble, Building2, Menu, Download } from 'lucide-react';

export const OwnerAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch('/analytics/owner');
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const occupancyTrend = stats?.occupancy_trend || [
    { month: 'Jan', occupancy: 65, revenue: 180000 },
    { month: 'Feb', occupancy: 70, revenue: 195000 },
    { month: 'Mar', occupancy: 78, revenue: 210000 },
    { month: 'Apr', occupancy: 82, revenue: 225000 },
    { month: 'May', occupancy: 88, revenue: 240000 },
    { month: 'Jun', occupancy: 92, revenue: 265000 }
  ];

  const propertyComparisonData = [
    { name: 'Shree Mahalaxmi', occupancy: 94, beds: 24 },
    { name: 'Grand Oak', occupancy: 88, beds: 36 },
    { name: 'Rankala Girls', occupancy: 96, beds: 18 },
    { name: 'Powai Colive', occupancy: 85, beds: 20 },
    { name: 'Kothrud Palms', occupancy: 90, beds: 28 }
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
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-slate-900 text-sm">Analytics & Reports</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Analytics & Business Intelligence</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Comprehensive financial metrics, occupancy trends, and stay performance reports.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs shadow-2xs hover:bg-slate-50 transition-all shrink-0"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Occupancy</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats ? stats.occupancy_rate : 89.4}%</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +4.2%
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Monthly Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                ₹{stats ? stats.total_revenue.toLocaleString() : '2,65,000'}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +8.1%
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Beds Occupied</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats ? stats.occupied_beds : 112}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {stats ? stats.total_beds : 126} total</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Properties</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats ? stats.total_properties : 5}</span>
              <span className="text-xs text-slate-400 font-semibold">Stays Managed</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Chart 1: Occupancy Trend */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" /> Monthly Occupancy Trend (%)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="occupancy" name="Occupancy %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Property Occupancy Comparison */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" /> Occupancy Rate by Property
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={110} />
                  <Tooltip />
                  <Bar dataKey="occupancy" name="Occupancy %" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
