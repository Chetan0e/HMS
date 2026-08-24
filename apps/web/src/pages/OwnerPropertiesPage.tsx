import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { apiFetch } from '../lib/api';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { Building2, Search, PlusCircle, Eye, Star, MapPin, Trash2, CheckCircle2, AlertCircle, Menu, BedDouble, Filter } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const OwnerPropertiesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedPropertyForDelete, setSelectedPropertyForDelete] = useState<Property | null>(null);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<Property[]>('/properties/my-properties');
      setProperties(data || []);
    } catch (e) {
      console.error('Failed to load properties', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteProperty = async (id: string) => {
    try {
      await apiFetch(`/properties/${id}`, { method: 'DELETE' });
      setProperties(prev => prev.filter(p => p.id !== id));
      setSelectedPropertyForDelete(null);
    } catch (e: any) {
      alert(e.message || 'Failed deleting property');
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || p.property_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
  const verifiedCount = properties.filter(p => p.verification_status === 'Verified').length;

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
            <span className="font-extrabold text-slate-900 text-sm">My Properties</span>
          </div>
          <Link
            to="/owner/properties/new"
            className="p-2 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" /> Add
          </Link>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Properties Management</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Manage your listed hostels, PGs, and co-living stays.
            </p>
          </div>

          <Link
            to="/owner/properties/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Add New Property
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Listed</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{properties.length}</span>
              <Building2 className="w-5 h-5 text-brand-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Verified Stays</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{verifiedCount}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Profile Views</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</span>
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Deposit</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">
                ₹{properties.length > 0 ? Math.round(properties.reduce((a, b) => a + (b.deposit || 0), 0) / properties.length).toLocaleString() : '0'}
              </span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search property name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['ALL', 'PG', 'Hostel', 'Co-living'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  typeFilter === type
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base mb-1">No Properties Found</h3>
            <p className="text-xs text-slate-500 mb-6">No properties matched your current filter criteria.</p>
            <Link
              to="/owner/properties/new"
              className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(prop => (
              <div key={prop.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
                <div>
                  {/* Property Image & Status Badges */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-lg">
                        {prop.property_type}
                      </span>
                      <span className="px-2.5 py-1 bg-brand-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-lg">
                        {prop.gender_policy}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg backdrop-blur-xs shadow-xs ${
                        prop.verification_status === 'Verified'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {prop.verification_status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Card Info Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">{prop.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{prop.rating || 4.8}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {prop.address}, {prop.city}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Deposit</span>
                        <span className="font-extrabold text-slate-900">₹{prop.deposit?.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Views</span>
                        <span className="font-bold text-slate-700">{prop.views || 120} views</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to="/owner/rooms"
                    className="flex-1 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BedDouble className="w-3.5 h-3.5" /> Rooms & Beds
                  </Link>

                  <Link
                    to={`/property/${prop.slug}`}
                    target="_blank"
                    className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                    title="Preview Stay Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setSelectedPropertyForDelete(prop)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {selectedPropertyForDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Delete Property?</h3>
              <p className="text-xs text-slate-600 mb-6">
                Are you sure you want to delete <strong>{selectedPropertyForDelete.name}</strong>? This action will also delete associated room listings and bed records.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedPropertyForDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProperty(selectedPropertyForDelete.id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
