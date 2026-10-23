import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCompareStore } from '../../stores/compareStore';
import { 
  Home, Compass, MapPin, Heart, Calendar, 
  User, LayoutDashboard, Building2, BedDouble, 
  Users, Menu, SlidersHorizontal, ShieldCheck, Grid
} from 'lucide-react';
import { MobileOwnerSheet } from './MobileOwnerSheet';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuthStore();
  const { items: compareItems } = useCompareStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOwnerSheetOpen, setIsOwnerSheetOpen] = useState(false);

  const pathname = location.pathname;
  const search = location.search;

  // Hide on auth pages or property details (which has its own floating booking bar)
  if (
    pathname === '/login' || 
    pathname === '/register' || 
    pathname.startsWith('/property/')
  ) {
    return null;
  }

  const isOwnerRoute = pathname.startsWith('/owner');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. OWNER TABS
  if (isOwnerRoute || (user && (user.role === 'OWNER' || user.role === 'MANAGER') && !pathname.startsWith('/app') && pathname !== '/explore' && pathname !== '/map')) {
    return (
      <>
        <nav 
          aria-label="Mobile Owner Navigation"
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all"
        >
          <div className="grid grid-cols-5 items-center max-w-md mx-auto px-1">
            
            {/* Dashboard */}
            <NavLink
              to="/owner"
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all group ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                  <span className="text-[10px] mt-1 tracking-tight leading-none">Overview</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
                </>
              )}
            </NavLink>

            {/* Properties */}
            <NavLink
              to="/owner/properties"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all group ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Building2 className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                  <span className="text-[10px] mt-1 tracking-tight leading-none">Properties</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
                </>
              )}
            </NavLink>

            {/* Rooms */}
            <NavLink
              to="/owner/rooms"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all group ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <BedDouble className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                  <span className="text-[10px] mt-1 tracking-tight leading-none">Rooms</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
                </>
              )}
            </NavLink>

            {/* Residents */}
            <NavLink
              to="/owner/residents"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all group ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Users className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                  <span className="text-[10px] mt-1 tracking-tight leading-none">Residents</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
                </>
              )}
            </NavLink>

            {/* More / Menu */}
            <button
              onClick={() => setIsOwnerSheetOpen(true)}
              className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-700 font-medium transition-all group cursor-pointer"
            >
              <Grid className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] mt-1 tracking-tight leading-none">More</span>
              <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
            </button>

          </div>
        </nav>

        <MobileOwnerSheet 
          isOpen={isOwnerSheetOpen} 
          onClose={() => setIsOwnerSheetOpen(false)} 
        />
      </>
    );
  }

  // 2. ADMIN TABS
  if (isAdminRoute || (user && user.role === 'ADMIN')) {
    return (
      <nav 
        aria-label="Mobile Admin Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all"
      >
        <div className="grid grid-cols-4 items-center max-w-md mx-auto px-1">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-navy-900 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ShieldCheck className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                <span className="text-[10px] mt-1 tracking-tight leading-none">Admin</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
              </>
            )}
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Compass className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                <span className="text-[10px] mt-1 tracking-tight leading-none">Explore</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
              </>
            )}
          </NavLink>

          <NavLink
            to="/map"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <MapPin className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                <span className="text-[10px] mt-1 tracking-tight leading-none">Map</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
              </>
            )}
          </NavLink>

          <NavLink
            to="/app"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                <span className="text-[10px] mt-1 tracking-tight leading-none">Profile</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
              </>
            )}
          </NavLink>
        </div>
      </nav>
    );
  }

  // 3. LOGGED-IN SEEKER TABS
  if (user) {
    const isSavedTab = pathname === '/app' && search.includes('tab=saved');
    const isBookingsTab = pathname === '/app' && search.includes('tab=bookings');
    const isProfileTab = pathname === '/app' && !isSavedTab && !isBookingsTab;

    return (
      <nav 
        aria-label="Mobile Seeker Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all"
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto px-1">
          
          {/* Explore */}
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all group ${
                isActive && pathname !== '/app' ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => {
              const active = isActive && pathname !== '/app';
              return (
                <>
                  <Compass className={`w-5 h-5 transition-transform ${active ? 'scale-110 text-brand-600' : ''}`} />
                  <span className="text-[10px] mt-1 tracking-tight leading-none">Explore</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
                </>
              );
            }}
          </NavLink>

          {/* Map */}
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <MapPin className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                <span className="text-[10px] mt-1 tracking-tight leading-none">Map</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
              </>
            )}
          </NavLink>

          {/* Saved */}
          <button
            onClick={() => navigate('/app?tab=saved')}
            className={`flex flex-col items-center justify-center py-1 transition-all group relative ${
              isSavedTab ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className="relative">
              <Heart className={`w-5 h-5 transition-transform ${isSavedTab ? 'scale-110 text-rose-600 fill-rose-600' : ''}`} />
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">Saved</span>
            {isSavedTab && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1" />}
          </button>

          {/* Bookings */}
          <button
            onClick={() => navigate('/app?tab=bookings')}
            className={`flex flex-col items-center justify-center py-1 transition-all group relative ${
              isBookingsTab ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className="relative">
              <Calendar className={`w-5 h-5 transition-transform ${isBookingsTab ? 'scale-110 text-brand-600' : ''}`} />
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">Bookings</span>
            {isBookingsTab && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
          </button>

          {/* Profile / My Stay */}
          <button
            onClick={() => navigate('/app')}
            className={`flex flex-col items-center justify-center py-1 transition-all group ${
              isProfileTab ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className="relative">
              <User className={`w-5 h-5 transition-transform ${isProfileTab ? 'scale-110 text-brand-600' : ''}`} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">Portal</span>
            {isProfileTab && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
          </button>

        </div>
      </nav>
    );
  }

  // 4. PUBLIC / GUEST TABS
  return (
    <nav 
      aria-label="Mobile Guest Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto px-1">
        
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all group ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight leading-none">Home</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
            </>
          )}
        </NavLink>

        {/* Explore */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all group ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Compass className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight leading-none">Explore</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
            </>
          )}
        </NavLink>

        {/* Map */}
        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all group ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <MapPin className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight leading-none">Map</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
            </>
          )}
        </NavLink>

        {/* Compare */}
        <NavLink
          to="/compare"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all group relative ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <SlidersHorizontal className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
                {compareItems.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {compareItems.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">Compare</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
            </>
          )}
        </NavLink>

        {/* Sign In */}
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-all group ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight leading-none">Sign In</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1" />}
            </>
          )}
        </NavLink>

      </div>
    </nav>
  );
};
