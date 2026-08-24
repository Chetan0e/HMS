import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { apiFetch } from '../lib/api';
import { Wrench, Search, AlertCircle, CheckCircle2, Clock, Filter, Menu, MessageSquare, ChevronRight } from 'lucide-react';

export const OwnerMaintenancePage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<any[]>('/maintenance');
      setTickets(data || []);
    } catch (e) {
      console.error('Failed fetching maintenance tickets', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const activeTickets = tickets;


  const filteredTickets = activeTickets.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.property_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await apiFetch(`/maintenance/${ticketId}/status?status=${newStatus}`, { method: 'PATCH' });
    } catch (e) {
      console.log('Backend sync or mock update');
    }
    setTickets(prev =>
      prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
    );
    if (selectedTicket) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const urgentCount = activeTickets.filter(t => t.priority === 'HIGH' && t.status !== 'RESOLVED').length;

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
            <span className="font-extrabold text-slate-900 text-sm">Maintenance Center</span>
          </div>
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">
            {urgentCount} Urgent
          </span>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Maintenance Requests</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review and resolve repair, plumbing, electrical, and facility tickets submitted by residents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-red-100 text-red-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {urgentCount} Urgent Action Required
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, category, or property..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 shrink-0">Status:</span>
            {['ALL', 'REPORTED', 'IN_PROGRESS', 'RESOLVED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    {ticket.category || 'General'}
                  </span>

                  <div className="flex gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                      ticket.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ticket.priority || 'NORMAL'}
                    </span>

                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                      ticket.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ticket.status === 'IN_PROGRESS'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {ticket.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{ticket.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{ticket.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600 space-y-1">
                  <p><strong>Property:</strong> {ticket.property_name || 'HMS Stay'}</p>
                  <p><strong>Resident:</strong> {ticket.seeker_name || 'Tenant'} (Rm {ticket.room_number || '101'})</p>
                  <p className="text-[10px] text-slate-400">Reported: {ticket.created_at || 'Recently'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">Update Status:</span>

                <div className="flex gap-2">
                  {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      In Progress
                    </button>
                  )}

                  {ticket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {ticket.status === 'RESOLVED' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
