import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { MapView } from '../components/MapView';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { apiFetch } from '../lib/api';
import { Map, List } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    const loadProps = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch<{ items: Property[] }>('/search?page_size=50');
        setProperties(res.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProps();
  }, []);

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    const cardEl = document.getElementById(`property-card-${id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Mobile Map/List Toggle Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-2 flex justify-center sticky top-16 z-30">
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full max-w-xs">
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileView === 'map' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Map View
          </button>
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileView === 'list' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List ({properties.length})
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Map View */}
        <div className={`flex-1 h-full p-2 sm:p-4 ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
          <MapView
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={handleSelectProperty}
          />
        </div>

        {/* Sidebar Cards */}
        <div className={`w-full md:w-96 bg-white border-l border-slate-200 p-4 overflow-y-auto space-y-4 ${mobileView === 'map' ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Nearby Stays ({properties.length})</h2>
            <span className="text-[10px] font-semibold text-slate-400">Click a pin on map to select</span>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>
              ))}
            </div>
          ) : (
            properties.map(p => (
              <div
                key={p.id}
                id={`property-card-${p.id}`}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`rounded-2xl transition-all ${
                  selectedPropertyId === p.id ? 'ring-2 ring-brand-500 shadow-md bg-brand-50/20' : ''
                }`}
              >
                <PropertyCard property={p} />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
