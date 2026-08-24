import React, { useState } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { useAuthStore } from '../stores/authStore';
import { User, Building, CreditCard, Bell, Shield, Menu, Check } from 'lucide-react';

export const OwnerSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'payout' | 'notifications'>('profile');
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98123 45678');
  const [email, setEmail] = useState(user?.email || 'owner@hms.com');
  const [businessName, setBusinessName] = useState('HMS Executive Stays');
  const [bankAccount, setBankAccount] = useState('981230491029');
  const [ifsc, setIFSC] = useState('HDFC0000123');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-5xl mx-auto">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between lg:hidden mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-slate-900 text-sm">Account Settings</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Account & Business Settings</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage owner profile information, payout accounts, and notification controls.
          </p>
        </div>

        {/* Saved Alert Toast */}
        {isSaved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold shadow-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings successfully updated!</span>
          </div>
        )}

        {/* Settings Sub-Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-4 h-4" /> Profile & Business
          </button>

          <button
            onClick={() => setActiveTab('payout')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'payout'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Bank Payouts
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'notifications'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Registered Hostel Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'payout' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
              <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100 mb-6 text-xs text-brand-800 font-semibold">
                Monthly rent payments received online will be disbursed to your linked bank account every 1st and 15th of the month.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Account Holder Name</label>
                <input
                  type="text"
                  defaultValue={name}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Bank Account Number</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={e => setIFSC(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Update Payout Account
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              {[
                { title: 'New Booking Enquiries', desc: 'Receive instant alerts when a student submits an enquiry or tour request.' },
                { title: 'Rent Collection Alerts', desc: 'Get daily summaries of collected and overdue rent payments.' },
                { title: 'Urgent Maintenance Tickets', desc: 'Instant push notifications for high priority plumbing or electrical issues.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600 rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
