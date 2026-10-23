import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Bell, Heart, MessageSquare, LogOut, ShieldCheck, Menu, X, User as UserIcon, Search } from 'lucide-react';

import { Logo } from './Logo';
import { MobileProfileSheet } from './MobileProfileSheet';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link to="/explore" className="hover:text-brand-600 transition-colors">Explore</Link>
          <Link to="/map" className="hover:text-brand-600 transition-colors">Map</Link>
          <Link to="/#about" className="hover:text-brand-600 transition-colors">About</Link>
          <Link to="/compare" className="hover:text-brand-600 transition-colors">Comparison</Link>
          <Link to="/#support" className="hover:text-brand-600 transition-colors">Support</Link>
        </nav>

        {/* Desktop Actions & User State */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'SEEKER' && (
                <>
                  <Link to="/app" className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-full transition-all" title="Saved Stays">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link to="/app" className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-full transition-all" title="Messages">
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                  <Link to="/app" className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-full transition-all" title="Notifications">
                    <Bell className="w-5 h-5" />
                  </Link>
                </>
              )}

              <div className="h-6 w-px bg-slate-200"></div>

              {user.role === 'OWNER' || user.role === 'MANAGER' ? (
                <Link to="/owner" className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm">
                  Owner Dashboard
                </Link>
              ) : user.role === 'ADMIN' ? (
                <Link to="/admin" className="px-4 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400" /> Admin Portal
                </Link>
              ) : (
                <Link to="/app" className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  My Dashboard
                </Link>
              )}

              <button
                onClick={() => { logout(); navigate('/login'); }}
                title="Logout"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/register?role=OWNER" className="hidden lg:block text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors">
                List your property
              </Link>
              <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link to="/register" className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all hover:shadow-brand-500/20">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile App Bar Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/explore"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                aria-label="Search stays"
              >
                <Search className="w-4 h-4" />
              </Link>

              {/* User Avatar Chip that opens native mobile sheet */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200/80 cursor-pointer"
                aria-label="Open user menu"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Menu className="w-4 h-4 text-slate-600 mr-1" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-xl hover:bg-brand-100 transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Native-feeling Mobile Profile & Menu Bottom Sheet */}
      <MobileProfileSheet 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </header>
  );
};
