import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="group">
            <Logo size="sm" />
          </Link>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-semibold">
            <Link to="/#terms" className="hover:text-brand-600 transition-colors">Terms of Service</Link>
            <Link to="/#privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            <Link to="/#cookies" className="hover:text-brand-600 transition-colors">Cookie Preferences</Link>
            <Link to="/#careers" className="hover:text-brand-600 transition-colors">Careers</Link>
            <Link to="/#partners" className="hover:text-brand-600 transition-colors">Partner Network</Link>
          </div>

          <p className="text-xs text-slate-400 font-medium text-center md:text-right">
            © 2026 HMS Global. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
