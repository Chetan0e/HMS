import React, { useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, LocateFixed, Loader2, Calendar, Building2, ShieldCheck, Zap, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [stayType, setStayType] = useState('All');
  const [moveInDate, setMoveInDate] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || data.address?.state || "Current Location";
          setLocation(city);
        } catch {
          setLocation("Current Location");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setIsLocating(false);
        setLocation("Kolhapur");
      },
      { timeout: 8000 }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('q', location);
    if (stayType && stayType !== 'All') params.set('property_type', stayType);
    navigate(`/explore?${params.toString()}`);
  };

  const popularLocations = [
    { name: 'Kolhapur', count: '950+ properties', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Pune', count: '1,240+ properties', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80' },
    { name: 'Bangalore', count: '2,100+ properties', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
    { name: 'Mumbai', count: '1,500+ properties', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-50 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 border border-brand-200 mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Find a stay that feels like home.
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Discover verified PGs, hostels & co-living stays.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            HMS connects you to premium hostels, verified student PGs, and secure co-living spaces with zero brokerage and instant digital booking.
          </p>

          {/* Prominent Responsive Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row items-center gap-3 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 px-3.5 py-3 bg-slate-50 rounded-xl w-full md:w-5/12 border border-slate-100 focus-within:border-brand-500 transition-colors relative">
              <button
                type="button"
                onClick={handleGetLiveLocation}
                title="Tap to detect your live location"
                className="p-1 rounded-lg text-brand-600 hover:bg-brand-100/60 transition-all shrink-0 flex items-center justify-center cursor-pointer group"
              >
                {isLocating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                ) : (
                  <LocateFixed className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
                )}
              </button>
              <input
                type="text"
                placeholder="Where do you want to live?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-none text-slate-900 text-xs sm:text-sm focus:outline-none w-full placeholder:text-slate-400 font-semibold"
              />
              <button
                type="button"
                onClick={handleGetLiveLocation}
                className="text-[10px] font-extrabold text-brand-700 hover:text-brand-800 bg-brand-100/70 hover:bg-brand-200/80 px-2 py-1 rounded-lg shrink-0 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                {isLocating ? "Locating..." : "Live"}
              </button>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl w-full md:w-3/12 border border-slate-100 focus-within:border-brand-500 transition-colors">
              <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                value={stayType}
                onChange={(e) => setStayType(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-xs sm:text-sm focus:outline-none w-full font-semibold cursor-pointer"
              >
                <option value="All">Stay type (All)</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Dormitory">Dormitory</option>
                <option value="Co-living">Co-living</option>
              </select>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl w-full md:w-3/12 border border-slate-100 focus-within:border-brand-500 transition-colors">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-xs sm:text-sm focus:outline-none w-full font-semibold cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Popular Locations</h2>
            <p className="text-xs text-slate-500 font-medium">Explore trending stays across top cities</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-brand-600 hover:underline">
            View All Cities →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {popularLocations.map((loc, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/explore?q=${loc.name}`)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
            >
              <img src={loc.image} alt={loc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3.5 sm:p-5 flex flex-col justify-end">
                <h3 className="text-white font-bold text-base sm:text-lg">{loc.name}</h3>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium">{loc.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-600 text-[11px] font-bold rounded-full mb-3 uppercase tracking-wider">
              For Property Owners
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Manage your entire property from one place with HMS.
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Join thousands of property owners who use HMS Platform to streamline bookings, collect rent payments, manage residents, and view analytics effortlessly.
            </p>
            <Link
              to="/register?role=OWNER"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-brand-600/20"
            >
              <span>List Your Property Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="w-full md:w-1/2 aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"
              alt="HMS Property Dashboard"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full border-t border-slate-200/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Verified Properties</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Every PG and hostel is physically verified by our team for safety and comfort.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Instant Booking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Book your preferred bed with zero brokerage fees and transparent deposits.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Vibrant Community</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Connect with fellow students and working professionals in co-living spaces.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
