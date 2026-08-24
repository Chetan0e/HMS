import React from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { useCompareStore } from '../stores/compareStore';
import { Link } from 'react-router-dom';
import { Trash2, Check, X } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { items, removeItem, clear } = useCompareStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Compare Properties</h1>
            <p className="text-xs text-slate-500 font-medium">Compare up to 4 stays side by side</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-sm font-medium mb-4">No properties selected for comparison.</p>
            <Link to="/explore" className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm">
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 w-48 font-bold text-slate-500 uppercase tracking-wider">Features</th>
                  {items.map(p => (
                    <th key={p.id} className="p-4 min-w-[220px]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                        <button onClick={() => removeItem(p.id)} className="text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-brand-600 font-extrabold text-base block">₹{p.deposit?.toLocaleString()}/mo</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="p-4 font-bold bg-slate-50">Type</td>
                  {items.map(p => <td key={p.id} className="p-4">{p.property_type}</td>)}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-50">Gender Policy</td>
                  {items.map(p => <td key={p.id} className="p-4">{p.gender_policy}</td>)}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-50">Rating</td>
                  {items.map(p => <td key={p.id} className="p-4">⭐ {p.rating} ({p.review_count})</td>)}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-50">City</td>
                  {items.map(p => <td key={p.id} className="p-4">{p.city}</td>)}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-50">WiFi</td>
                  {items.map(p => (
                    <td key={p.id} className="p-4">
                      {p.amenities.includes('High-Speed WiFi') ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-slate-300" />}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-slate-50">Food Included</td>
                  {items.map(p => (
                    <td key={p.id} className="p-4">
                      {p.amenities.includes('Nutritious Meals') ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-slate-300" />}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
