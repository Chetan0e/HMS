import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, BedDouble, Users, CreditCard, Wrench, BarChart3, Settings, HelpCircle, LogOut, PlusCircle, X, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Logo } from './Logo';

interface OwnerSidebarProps {
  onCloseMobile?: () => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/owner' },
    { label: 'Properties', icon: Building2, path: '/owner/properties' },
    { label: 'Rooms & Beds', icon: BedDouble, path: '/owner/rooms' },
    { label: 'Residents', icon: Users, path: '/owner/residents' },
    { label: 'Payments', icon: CreditCard, path: '/owner/payments' },
    { label: 'Maintenance', icon: Wrench, path: '/owner/maintenance' },
    { label: 'Analytics', icon: BarChart3, path: '/owner/analytics' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-full min-h-screen flex flex-col justify-between p-4 sticky top-0 overflow-y-auto border-r border-slate-800/80 shadow-xl">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3.5 mb-5 border-b border-slate-800">
          <div>
            <NavLink to="/" className="group inline-block">
              <Logo size="md" textColor="text-white" subtextColor="text-brand-400" />
            </NavLink>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-400">OWNER PORTAL</span>
            </div>
          </div>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Add Unit Button */}
        <NavLink
          to="/owner/properties/new"
          onClick={onCloseMobile}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-6 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20 group"
        >
          <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>Add New Property</span>
        </NavLink>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/owner'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User & Settings */}
      <div className="pt-4 border-t border-slate-800 space-y-1">
        <NavLink
          to="/owner/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              isActive
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        <a
          href="#help"
          className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help & Support</span>
        </a>

        {/* User Profile Footer Card */}
        <div className="mt-4 pt-3 flex items-center justify-between px-2 bg-slate-800/40 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 absolute bottom-0 right-0"></span>
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Property Owner'}</p>
              <p className="text-[10px] text-slate-400 capitalize font-semibold">{user?.role?.toLowerCase() || 'Owner'}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
