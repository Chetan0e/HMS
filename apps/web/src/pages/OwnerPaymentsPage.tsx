import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { apiFetch } from '../lib/api';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Plus, Search, Calendar, CheckCircle2, Clock, AlertCircle, Menu, Download } from 'lucide-react';

export const OwnerPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Record payment state
  const [amount, setAmount] = useState(8500);
  const [method, setMethod] = useState('UPI');
  const [residentName, setResidentName] = useState('Anita Smith');
  const [propertyName, setPropertyName] = useState('Shree Mahalaxmi Executive PG');

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<any[]>('/payments');
      setPayments(data || []);
    } catch (e) {
      console.error('Failed fetching payments', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const demoPayments = [
    {
      id: 'pay-101',
      resident_name: 'Anita Smith',
      property_name: 'Shree Mahalaxmi Executive PG',
      amount: 8500,
      due_date: '2026-08-05',
      paid_at: '2026-08-04 10:30 AM',
      method: 'UPI',
      status: 'PAID',
      transaction_reference: 'TXN-984920412'
    },
    {
      id: 'pay-102',
      resident_name: 'Priya Sharma',
      property_name: 'Rankala View Girls Residency',
      amount: 7000,
      due_date: '2026-08-05',
      paid_at: '2026-08-03 04:15 PM',
      method: 'Bank Transfer',
      status: 'PAID',
      transaction_reference: 'TXN-773819201'
    },
    {
      id: 'pay-103',
      resident_name: 'Vikram Mehta',
      property_name: 'The Grand Oak Scholar Residence',
      amount: 14000,
      due_date: '2026-08-10',
      paid_at: '-',
      method: 'UPI',
      status: 'PENDING',
      transaction_reference: '-'
    },
    {
      id: 'pay-104',
      resident_name: 'Karan Patel',
      property_name: 'Powai Lake View Co-Living',
      amount: 16000,
      due_date: '2026-08-01',
      paid_at: '-',
      method: 'Cash',
      status: 'OVERDUE',
      transaction_reference: '-'
    }
  ];

  const activePayments = payments.length > 0 ? payments : demoPayments;

  const filteredPayments = activePayments.filter(p =>
    (p.resident_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.property_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.transaction_reference || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollected = activePayments
    .filter(p => p.status === 'PAID')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalPending = activePayments
    .filter(p => p.status !== 'PAID')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `pay-${Date.now()}`,
      resident_name: residentName,
      property_name: propertyName,
      amount: Number(amount),
      due_date: '2026-08-24',
      paid_at: 'Today, Just Now',
      method,
      status: 'PAID',
      transaction_reference: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`
    };

    setPayments(prev => [newEntry, ...prev]);
    setIsRecordModalOpen(false);
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
            <span className="font-extrabold text-slate-900 text-sm">Payments & Revenue</span>
          </div>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="p-2 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Record
          </button>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Payments & Rent Collection</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Track monthly rent collections, pending dues, transaction logs, and issue receipts.
            </p>
          </div>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Record Manual Payment
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Collected (This Month)</span>
              <span className="text-2xl font-black text-emerald-600">₹{totalCollected.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending / Overdue Dues</span>
              <span className="text-2xl font-black text-amber-500">₹{totalPending.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Transactions</span>
              <span className="text-2xl font-black text-slate-900">{activePayments.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resident, stay, or TXN ref..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors">
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
        </div>

        {/* Payment History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Paid Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">TXN Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.resident_name || 'Anita Smith'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {p.property_name || 'HMS 101'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {p.paid_at || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2 py-1 bg-slate-100 rounded-md font-bold text-[11px]">
                        {p.method || 'UPI'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-700'
                          : p.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                      {p.transaction_reference || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Payment Modal */}
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
              <h3 className="text-lg font-black text-slate-900 mb-1">Record Rent Payment</h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Manually log a rent payment received from a resident.</p>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Resident Name *</label>
                  <input
                    type="text"
                    required
                    value={residentName}
                    onChange={e => setResidentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    value={propertyName}
                    onChange={e => setPropertyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                    <select
                      value={method}
                      onChange={e => setMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cash">Cash Handover</option>
                      <option value="Card">Debit / Credit Card</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                  >
                    Record Payment
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
