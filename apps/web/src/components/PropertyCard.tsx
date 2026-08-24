import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { Heart, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { useCompareStore } from '../stores/compareStore';

interface PropertyCardProps {
  property: Property;
  onToggleSave?: (id: string) => void;
  isSaved?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onToggleSave, isSaved }) => {
  const { addItem, items } = useCompareStore();
  const isCompared = items.some((p: Property) => p.id === property.id);

  const fallbackImage = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";
  const coverImage = property.images && property.images.length > 0 ? property.images[0] : fallbackImage;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Image Banner */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={coverImage}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Verification Badge matching Stitch */}
          {property.verification_status === 'Verified' && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-900 flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 fill-brand-600/20" />
              <span>HMS Verified</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={() => onToggleSave?.(property.id)}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              isSaved ? 'bg-red-50 text-red-500' : 'bg-black/30 text-white hover:bg-white/80 hover:text-slate-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{property.rating > 0 ? property.rating.toFixed(1) : 'New'}</span>
            </div>
          </div>

          {/* Location info */}
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{property.address}, {property.city}</span>
          </p>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              {property.gender_policy}
            </span>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              {property.property_type}
            </span>
            {property.amenities.slice(0, 2).map((a: string, i: number) => (
              <span key={i} className="text-[11px] font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Price & Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900">
              ₹{property.pricing_starting_from ? property.pricing_starting_from.toLocaleString() : property.deposit.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-normal">/mo</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block">1 bed available</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addItem(property)}
            title={isCompared ? "In Comparison" : "Add to Compare"}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
              isCompared ? 'bg-brand-50 border-brand-200 text-brand-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {isCompared ? 'Comparing' : 'Compare'}
          </button>

          <Link
            to={`/property/${property.slug}`}
            className="text-xs font-semibold px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-sm"
          >
            View Property
          </Link>
        </div>
      </div>
    </div>
  );
};
