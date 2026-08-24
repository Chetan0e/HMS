import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Bell, Heart, MessageSquare, LogOut, ShieldCheck, Menu, X, Building2, MapPin, SlidersHorizontal, User as UserIcon } from 'lucide-react';

import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="group">
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

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              Explore Stays
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              Interactive Map
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              Compare Stays
            </Link>
            <Link
              to="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              About HMS
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); navigate('/login'); }}
                    className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg"
                  >
                    Logout
                  </button>
                </div>

                {user.role === 'OWNER' || user.role === 'MANAGER' ? (
                  <Link
                    to="/owner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center font-bold text-xs text-white bg-brand-600 rounded-xl shadow-sm"
                  >
                    Owner Dashboard
                  </Link>
                ) : user.role === 'ADMIN' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center font-bold text-xs text-white bg-navy-900 rounded-xl shadow-sm"
                  >
                    Admin Portal
                  </Link>
                ) : (
                  <Link
                    to="/app"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center font-bold text-xs text-slate-800 bg-slate-100 rounded-xl"
                  >
                    My Dashboard
                  </Link>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-bold text-xs text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-bold text-xs text-white bg-brand-600 rounded-xl shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
