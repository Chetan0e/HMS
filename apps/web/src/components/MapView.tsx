import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Property } from '../types';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom HTML DivIcon for location pin point markers
const createCustomPin = (price: number, isSelected: boolean) => {
  const formattedPrice = price ? `₹${(price / 1000).toFixed(0)}k` : 'Stay';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'} transition-transform">
        <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-extrabold text-xs shadow-md border-2 ${
          isSelected ? 'bg-brand-600 border-amber-400 ring-2 ring-brand-500/50' : 'bg-slate-900 border-white hover:bg-brand-600'
        }">
          <span>📍</span>
          <span>${formattedPrice}</span>
        </div>
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
    popupAnchor: [0, -15],
  });
};

// Component to handle map sizing recalculation on load/resize
const MapResizer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const triggerInvalidate = () => {
      map.invalidateSize();
    };

    triggerInvalidate();
    const t1 = setTimeout(triggerInvalidate, 100);
    const t2 = setTimeout(triggerInvalidate, 300);
    const t3 = setTimeout(triggerInvalidate, 600);
    const t4 = setTimeout(triggerInvalidate, 1000);

    window.addEventListener('resize', triggerInvalidate);

    let observer: ResizeObserver | null = null;
    const container = map.getContainer();
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        triggerInvalidate();
      });
      observer.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', triggerInvalidate);
      if (observer && container) {
        observer.unobserve(container);
      }
    };
  }, [map]);

  return null;
};

interface MapViewProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  selectedPropertyId?: string | null;
  onSelectProperty?: (propertyId: string) => void;
}

// Component to fit map bounds automatically to show all property markers
const AutoFitBounds: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validPoints = properties
        .filter(p => p.latitude && p.longitude)
        .map(p => [p.latitude, p.longitude] as [number, number]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    } else {
      map.invalidateSize();
    }
  }, [properties, map]);

  return null;
};


export const MapView: React.FC<MapViewProps> = ({
  properties,
  center = [16.7050, 74.2433],
  zoom = 12,
  selectedPropertyId,
  onSelectProperty
}) => {
  const defaultCenter = properties.length > 0 && properties[0].latitude && properties[0].longitude
    ? [properties[0].latitude, properties[0].longitude] as [number, number]
    : center;

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[450px] z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapResizer />
        <AutoFitBounds properties={properties} />

        {properties.map((prop) => {
          const isSelected = selectedPropertyId === prop.id;
          const lat = prop.latitude || center[0];
          const lng = prop.longitude || center[1];
          const pinIcon = createCustomPin(prop.deposit || 0, isSelected);

          return (
            <Marker
              key={prop.id}
              position={[lat, lng]}
              icon={pinIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectProperty) {
                    onSelectProperty(prop.id);
                  }
                }
              }}
            >
              <Popup>
                <div className="p-1 max-w-[220px]">
                  {prop.images && prop.images.length > 0 && (
                    <img
                      src={prop.images[0]}
                      alt={prop.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">
                      {prop.property_type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">{prop.gender_policy}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mb-0.5 leading-snug">{prop.name}</h4>
                  <p className="text-[11px] text-slate-500 mb-1.5">{prop.city}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="font-black text-brand-600 text-xs">
                      ₹{prop.deposit?.toLocaleString()}<span className="text-[10px] font-normal text-slate-400">/mo</span>
                    </span>
                    <Link
                      to={`/property/${prop.slug}`}
                      className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      View Stay
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

