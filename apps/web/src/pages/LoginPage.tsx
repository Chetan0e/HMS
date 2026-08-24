import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiFetch } from '../lib/api';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

import { Logo } from '../components/ui/Logo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;
    
    if (!loginEmail || !loginPass) return;

    setError('');
    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      setAuth(data.user, data.access_token, data.refresh_token);
      if (data.user.role === 'OWNER' || data.user.role === 'MANAGER') {
        navigate('/owner');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Visual Showcase Panel (Desktop & Tablet) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-navy-950 via-slate-900 to-brand-950 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden sm:flex">
          {/* Subtle background image overlay */}
          <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center"></div>

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-block group">
              <Logo size="lg" textColor="text-white" subtextColor="text-brand-400" />
            </Link>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 my-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Hostel Management</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
              Welcome back to your stay dashboard.
            </h2>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified PGs, Hostels & Co-living spaces</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero brokerage fees & direct owner contact</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time booking status & maintenance logs</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Trusted by 10,000+ residents</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <span>4.9★ Rating</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          
          {/* Header */}
          <div className="mb-6">
            <div className="sm:hidden flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="HMS Logo" className="w-8 h-8 drop-shadow-xs" />
              <div className="flex flex-col">
                <span className="font-black text-lg text-slate-900 leading-none tracking-tight">HMS</span>
                <span className="text-[9px] tracking-wider uppercase font-extrabold text-brand-600 mt-0.5">HOSTEL & STAY</span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to HMS</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seeker@hms.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <a href="#forgot" className="text-xs font-bold text-brand-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl pl-10 pr-10 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-extrabold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
