import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { apiFetch } from '../lib/api';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, LocateFixed, Loader2, X, Filter } from 'lucide-react';
import { getUserLocation, reverseGeocodeCity } from '../lib/location';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [genderPolicy, setGenderPolicy] = useState(searchParams.get('gender_policy') || 'All');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || 'All');
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [sort, setSort] = useState('recommended');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleGetLiveLocation = async () => {

    setIsLocating(true);
    try {
      const loc = await getUserLocation();
      const resolvedCity = loc.city || await reverseGeocodeCity(loc.latitude, loc.longitude);
      const displayCity = (resolvedCity && resolvedCity !== 'Current Location') ? resolvedCity : 'Kolhapur';
      setQuery(displayCity);
      const params = new URLSearchParams(searchParams);
      params.set('q', displayCity);
      params.set('lat', loc.latitude.toString());
      params.set('lng', loc.longitude.toString());
      setSearchParams(params);
    } catch (err) {
      console.error("Location error:", err);
      setQuery("Kolhapur");
    } finally {
      setIsLocating(false);
    }
  };


  const amenitiesOptions = ['WiFi', 'Food Included', 'AC', 'Laundry', 'Gym', 'Parking', 'Daily Cleaning'];

  const fetchProperties = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (genderPolicy !== 'All') params.set('gender_policy', genderPolicy);
      if (propertyType !== 'All') params.set('property_type', propertyType);
      if (maxPrice) params.set('max_price', maxPrice.toString());
      if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
      params.set('sort', sort);

      const res = await apiFetch<{ items: Property[]; total: number }>(`/search?${params.toString()}`);
      setProperties(res.items || []);
      setTotalCount(res.total || 0);
    } catch (e: any) {
      console.error('Failed fetching properties', e);
      setFetchError(e?.message || 'Failed to connect to backend server');
      setProperties([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams, sort, genderPolicy, propertyType, maxPrice, selectedAmenities]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (genderPolicy !== 'All') params.set('gender_policy', genderPolicy);
    if (propertyType !== 'All') params.set('property_type', propertyType);
    setSearchParams(params);
    fetchProperties();
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const renderFilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filter Options
        </h3>
        <button
          onClick={() => { setGenderPolicy('All'); setPropertyType('All'); setSelectedAmenities([]); setMaxPrice(25000); }}
          className="text-xs text-brand-600 font-semibold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Occupancy / Gender Policy */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-3 uppercase tracking-wider">Occupancy</label>
        <div className="space-y-2">
          {['All', 'Boys', 'Girls', 'Unisex'].map((g) => (
            <label key={g} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="radio"
                name="gender"
                checked={genderPolicy === g}
                onChange={() => setGenderPolicy(g)}
                className="accent-brand-600"
              />
              <span>{g === 'Boys' ? 'Boys PG' : g === 'Girls' ? 'Girls PG' : g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Room / Property Type */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-900 block mb-3 uppercase tracking-wider">Property Type</label>
        <div className="space-y-2">
          {['All', 'PG', 'Hostel', 'Co-living', 'Dormitory', 'Apartment'].map((t) => (
            <label key={t} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={propertyType === t}
                onChange={() => setPropertyType(t)}
                className="accent-brand-600"
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Checkboxes */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-900 block mb-3 uppercase tracking-wider">Amenities</label>
        <div className="space-y-2">
          {amenitiesOptions.map((a) => (
            <label key={a} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                className="rounded accent-brand-600"
              />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Max Monthly Rent</label>
          <span className="text-xs font-bold text-brand-600">₹{maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="3000"
          max="50000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-600 cursor-pointer"
        />
      </div>

      <button
        onClick={() => { fetchProperties(); setMobileFilterOpen(false); }}
        className="w-full py-3 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Top Search Subheader */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 sticky top-16 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleFilterSubmit} className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative w-full flex items-center">
              <button
                type="button"
                onClick={handleGetLiveLocation}
                title="Tap to detect your live location"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-brand-600 hover:bg-brand-50 rounded-lg transition-all cursor-pointer group/pin"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                ) : (
                  <LocateFixed className="w-4 h-4 text-brand-600 group-hover/pin:scale-110 transition-transform" />
                )}
              </button>
              <input
                type="text"
                placeholder="Search location, college, landmark..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-100 pl-10 pr-16 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={handleGetLiveLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-brand-700 hover:text-brand-800 bg-brand-100/70 hover:bg-brand-200/80 px-2 py-0.5 rounded-md transition-colors uppercase tracking-wider cursor-pointer"
              >
                {isLocating ? "..." : "Live"}
              </button>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Sort Selector & Mobile Filter Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200"
            >
              <Filter className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters</span>
            </button>

            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {properties.length} stays
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-semibold hidden md:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Explore Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs h-fit">
            {renderFilterContent()}
          </aside>

          {/* Right Property Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4 animate-pulse">
                    <div className="aspect-[4/3] bg-slate-200 rounded-xl"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : fetchError ? (
              <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
                <h4 className="text-slate-900 font-bold text-base mb-2">Unable to Load Stays</h4>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mb-6 max-w-md mx-auto">{fetchError}</p>
                <button
                  onClick={() => fetchProperties()}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 text-xs sm:text-sm font-medium mb-4">No properties match your current search criteria.</p>
                <button
                  onClick={() => { setQuery(''); setGenderPolicy('All'); setPropertyType('All'); setSearchParams({}); }}
                  className="px-4 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Reset All Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Slide-over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-xs sm:max-w-sm bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-lg">Filter Stays</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {renderFilterContent()}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
