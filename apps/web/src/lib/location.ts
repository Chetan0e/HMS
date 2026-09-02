import { apiFetch } from './api';

export interface LocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  source: 'gps' | 'ip' | 'fallback';
}

/**
 * Robustly requests user location with multi-stage fallback:
 * 1. Low accuracy HTML5 Geolocation (WiFi/IP positioning - fast & reliable on Windows/Mac/Laptops)
 * 2. High accuracy HTML5 Geolocation
 * 3. Free IP Geolocation API fallback
 * 4. Default city coordinates fallback (Kolhapur)
 */
export async function getUserLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      fallbackToIpOrCity(resolve);
      return;
    }

    let resolved = false;

    // Stage 1: Try low-accuracy positioning (works reliably on desktops & laptops without GPS)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          source: 'gps',
        });
      },
      (err) => {
        console.warn('Low accuracy geolocation failed:', err.message);
        // Stage 2: Retry with high accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (resolved) return;
            resolved = true;
            resolve({
              latitude: Number(pos.coords.latitude.toFixed(6)),
              longitude: Number(pos.coords.longitude.toFixed(6)),
              source: 'gps',
            });
          },
          () => {
            if (resolved) return;
            resolved = true;
            fallbackToIpOrCity(resolve);
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 300000 }
    );

    // Timeout safety net (in case browser prompt hangs)
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        fallbackToIpOrCity(resolve);
      }
    }, 7000);
  });
}

async function fallbackToIpOrCity(resolve: (res: LocationResult) => void) {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        resolve({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city || 'Kolhapur',
          source: 'ip',
        });
        return;
      }
    }
  } catch (e) {
    console.warn('IP Geolocation fallback failed:', e);
  }

  // Final fallback to Kolhapur default coordinates
  resolve({
    latitude: 16.7050,
    longitude: 74.2433,
    city: 'Kolhapur',
    source: 'fallback',
  });
}

/**
 * Reverse geocode lat/lng into a human readable city name via backend or fallback nominatim API
 */
export async function reverseGeocodeCity(lat: number, lng: number): Promise<string> {
  try {
    const res = await apiFetch<{ city: string }>(`/search/reverse-geocode?lat=${lat}&lng=${lng}`);
    if (res && res.city && res.city !== 'Current Location') {
      return res.city;
    }
  } catch (e) {
    console.warn('Backend reverse geocode failed, trying client Nominatim:', e);
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.suburb || addr.county || addr.state;
      if (city) return city;
    }
  } catch (e) {
    console.warn('Client reverse geocode failed:', e);
  }

  return 'Kolhapur';
}
