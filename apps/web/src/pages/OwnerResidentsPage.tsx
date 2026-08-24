import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { apiFetch } from '../lib/api';
import { Users, Search, Plus, Phone, Mail, Building2, BedDouble, Calendar, CheckCircle2, AlertTriangle, Menu, MessageSquare } from 'lucide-react';

export const OwnerResidentsPage: React.FC = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentPhone, setNewResidentPhone] = useState('');
  const [newResidentEmail, setNewResidentEmail] = useState('');
  const [newMoveInDate, setNewMoveInDate] = useState('2026-09-01');

  const fetchResidents = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<any[]>('/residents');
      setResidents(data || []);
    } catch (e) {
      console.error('Failed to load residents', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const activeResidentList = residents;

  const filteredResidents = activeResidentList.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.property_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.room_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResidentName) return;

    const newRes = {
      id: `res-${Date.now()}`,
      name: newResidentName,
      phone: newResidentPhone || '+91 98000 00000',
      email: newResidentEmail || 'tenant@gmail.com',
      property_name: 'Shree Mahalaxmi Executive PG',
      room_number: '105',
      bed_number: 'Bed A',
      move_in_date: newMoveInDate,
      rent: 9000,
      payment_status: 'PAID',
      status: 'ACTIVE'
    };

    setResidents(prev => [newRes, ...prev]);
    setIsAddModalOpen(false);
    setNewResidentName('');
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
            <span className="font-extrabold text-slate-900 text-sm">Residents Directory</span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Residents & Tenants</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              View active resident profiles, move-in schedules, and rent compliance status.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Register New Tenant
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Active Residents</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{activeResidentList.length}</span>
              <Users className="w-5 h-5 text-brand-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rent Paid</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-600">
                {activeResidentList.filter(r => r.payment_status === 'PAID').length}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Payment Pending</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-500">
                {activeResidentList.filter(r => r.payment_status === 'PENDING').length}
              </span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notice Period</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-red-600">
                {activeResidentList.filter(r => r.status === 'NOTICE_PERIOD').length}
              </span>
              <Calendar className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resident name, stay or room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Residents Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Property & Room</th>
                  <th className="py-3 px-4">Move-In Date</th>
                  <th className="py-3 px-4">Monthly Rent</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {filteredResidents.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {res.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{res.name}</p>
                          <p className="text-[11px] text-slate-400">{res.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{res.property_name || 'HMS Stay'}</p>
                      <p className="text-[11px] text-slate-400">Rm {res.room_number || '101'} • {res.bed_number || 'Bed A'}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {res.move_in_date || 'Oct 12, 2026'}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{(res.rent || 8500).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        res.payment_status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-700'
                          : res.payment_status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {res.payment_status || 'PAID'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Contacting ${res.name} via ${res.phone}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Resident Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
              <h3 className="text-lg font-black text-slate-900 mb-1">Register New Tenant</h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Assign a resident to an available room and bed.</p>

              <form onSubmit={handleAddResident} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tenant Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    value={newResidentName}
                    onChange={e => setNewResidentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98000 00000"
                      value={newResidentPhone}
                      onChange={e => setNewResidentPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="tenant@gmail.com"
                      value={newResidentEmail}
                      onChange={e => setNewResidentEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Move-In Date</label>
                  <input
                    type="date"
                    value={newMoveInDate}
                    onChange={e => setNewMoveInDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl"
                  >
                    Save Tenant Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
