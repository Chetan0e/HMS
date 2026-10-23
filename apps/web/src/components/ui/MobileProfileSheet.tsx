import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCompareStore } from '../../stores/compareStore';
import { 
  X, Compass, MapPin, SlidersHorizontal, Info, 
  Heart, Calendar, Wrench, ShieldCheck, 
  Building2, LogOut, ChevronRight, User as UserIcon,
  HelpCircle, ExternalLink
} from 'lucide-react';

interface MobileProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileProfileSheet: React.FC<MobileProfileSheetProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const { items: compareItems } = useCompareStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Slide-up Sheet */}
      <div className="relative bg-white rounded-t-[2rem] shadow-2xl max-h-[85vh] overflow-y-auto w-full border-t border-slate-100 flex flex-col p-5 pb-8 animate-in slide-in-from-bottom duration-300">
        
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 shrink-0" />

        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Account & Menu</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card or Sign In Banner */}
        {user ? (
          <div className="bg-gradient-to-r from-brand-50 to-blue-50/60 border border-brand-100 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-brand-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-extrabold text-slate-900 text-sm truncate">{user.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate max-w-[130px]">{user.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors shrink-0"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 text-white rounded-2xl p-4 mb-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="font-extrabold text-sm">Welcome to HMS</p>
              <p className="text-xs text-slate-300">Sign in to manage bookings and stays</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Portal Switching Cards if applicable */}
        {user && (
          <div className="mb-4">
            {user.role === 'OWNER' || user.role === 'MANAGER' ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/owner"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center justify-between shadow-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Owner Portal
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-200" />
                </Link>
                <Link
                  to="/app"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between hover:bg-slate-200"
                >
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4" /> Seeker View
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            ) : user.role === 'ADMIN' ? (
              <Link
                to="/admin"
                onClick={onClose}
                className="w-full p-3 rounded-xl bg-navy-900 text-white font-bold text-xs flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-400" /> Open Admin Portal
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ) : null}
          </div>
        )}

        {/* Navigation Section */}
        <div className="space-y-1 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1.5">
            Quick Discovery
          </span>

          <Link
            to="/explore"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <span>Explore Stays</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/map"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Interactive Map</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/compare"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span>Compare Properties</span>
            </div>
            {compareItems.length > 0 ? (
              <span className="bg-brand-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {compareItems.length}
              </span>
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </Link>
        </div>

        {/* Seeker Management Shortcuts */}
        {user && user.role === 'SEEKER' && (
          <div className="space-y-1 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1.5">
              My Seeker Portal
            </span>

            <Link
              to="/app?tab=bookings"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>My Bookings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/app?tab=saved"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <span>Saved Properties</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/app?tab=maintenance"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <span>Maintenance Requests</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        )}

        {/* Footer Links & Version */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 px-2">
          <span>HMS Mobile v2.4</span>
          <Link to="/#about" onClick={onClose} className="hover:text-brand-600 transition-colors">
            About HMS
          </Link>
        </div>
      </div>
    </div>
  );
};
