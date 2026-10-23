import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  X, CreditCard, Wrench, BarChart3, Settings, 
  PlusCircle, LogOut, ExternalLink, HelpCircle, ChevronRight, User
} from 'lucide-react';

interface MobileOwnerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileOwnerSheet: React.FC<MobileOwnerSheetProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const moreItems = [
    { label: 'Payments & Revenue', icon: CreditCard, path: '/owner/payments', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Maintenance Requests', icon: Wrench, path: '/owner/maintenance', color: 'bg-amber-50 text-amber-600' },
    { label: 'Occupancy & Analytics', icon: BarChart3, path: '/owner/analytics', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Settings & Profile', icon: Settings, path: '/owner/settings', color: 'bg-slate-100 text-slate-700' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Slide-up Sheet */}
      <div className="relative z-10 bg-white rounded-t-[2rem] shadow-2xl max-h-[85vh] overflow-y-auto w-full border-t border-slate-100 flex flex-col p-5 pb-safe pb-8 animate-in slide-in-from-bottom duration-300">
        
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 shrink-0" />

        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Owner Management Hub</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add Property CTA */}
        <NavLink
          to="/owner/properties/new"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 mb-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-brand-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property</span>
        </NavLink>

        {/* Grid of Owner Options */}
        <div className="space-y-1 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1.5">
            Operations & Reports
          </span>

          {moreItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>
          ))}
        </div>

        {/* Switch Portal or Seeker View */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <NavLink
            to="/app"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Switch to Seeker Portal</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Owner Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
