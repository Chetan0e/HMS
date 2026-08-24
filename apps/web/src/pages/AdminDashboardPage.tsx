import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { apiFetch } from '../lib/api';
import { Property } from '../types';
import { ShieldCheck, CheckCircle2, XCircle, Users, Building2 } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const loadAdminData = async () => {
    try {
      const s = await apiFetch('/admin/analytics');
      setStats(s);
      const queue = await apiFetch<Property[]>('/admin/verification-queue');
      setPendingProperties(queue);
      const u = await apiFetch<any[]>('/admin/users');
      setUsers(u);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (propId: string, verification_status: 'Verified' | 'Rejected') => {
    try {
      await apiFetch(`/admin/properties/${propId}/verify?verification_status=${verification_status}`, {
        method: 'POST'
      });
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Verification update failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Admin Control Center</h1>
            <p className="text-xs text-slate-500 font-medium">Verify properties, manage platform metrics and users</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Users</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.total_users || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Properties</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.total_properties || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verified Properties</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.verified_properties || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Bookings</span>
            <div className="text-2xl font-extrabold text-brand-600 mt-1">{stats?.total_bookings || 0}</div>
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Property Verification Queue ({pendingProperties.length})</h2>
          {pendingProperties.length === 0 ? (
            <p className="text-xs text-slate-500">No properties currently awaiting verification.</p>
          ) : (
            <div className="space-y-4">
              {pendingProperties.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.city} • {p.property_type} ({p.gender_policy})</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(p.id, 'Verified')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verify & Publish
                    </button>
                    <button
                      onClick={() => handleVerify(p.id, 'Rejected')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
