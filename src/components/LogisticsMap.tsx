import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Truck, RotateCw, ExternalLink, AlertTriangle, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

// Stable reference to prevent APIProvider from re-triggering loader on every render
const GOOGLE_MAPS_LIBRARIES: ('routes' | 'marker')[] = ['routes', 'marker'];

interface StopLocation {
  id: string;
  name: string;
  role: string;
  crop: string;
  quantity: string;
  coords: { lat: number; lng: number };
  type: 'pickup' | 'destination';
}

const STOPS: StopLocation[] = [
  {
    id: 'agra',
    name: 'Agra Mandi Hub',
    role: 'Farmer: Rajesh Kumar',
    crop: 'Tomato',
    quantity: '450 kg',
    coords: { lat: 27.1767, lng: 78.0081 },
    type: 'pickup',
  },
  {
    id: 'mathura',
    name: 'Mathura Hub',
    role: 'Farmer: Balram Singh',
    crop: 'Potato (Kufri Jyoti)',
    quantity: '380 kg',
    coords: { lat: 27.4924, lng: 77.6737 },
    type: 'pickup',
  },
  {
    id: 'aligarh',
    name: 'Aligarh Hub',
    role: 'Farmer: Hardeep Yadav',
    crop: 'Onion',
    quantity: '520 kg',
    coords: { lat: 27.8974, lng: 78.088 },
    type: 'pickup',
  },
  {
    id: 'delhi',
    name: 'Delhi Azadpur Terminal',
    role: 'Buyer: FreshBasket Supermarket',
    crop: 'Consolidated Produce',
    quantity: '1,350 kg total',
    coords: { lat: 28.7159, lng: 77.1793 },
    type: 'destination',
  },
];

// Actual highway coordinates along NH 19, SH 80, NH 34 and Yamuna Expressway
// connecting Agra -> Mathura -> Aligarh -> Delhi
const HIGHWAY_ROAD_CORRIDOR_OPTIMIZED: google.maps.LatLngLiteral[] = [
  { lat: 27.1767, lng: 78.0081 }, // Agra Mandi
  { lat: 27.1984, lng: 77.9821 }, // Agra bypass / NH 19
  { lat: 27.2285, lng: 77.9250 }, // Sikandra
  { lat: 27.2750, lng: 77.8620 }, // Runakta
  { lat: 27.3241, lng: 77.7785 }, // Farah Toll NH 19
  { lat: 27.4120, lng: 77.7120 }, // Badh
  { lat: 27.4924, lng: 77.6737 }, // Mathura Hub (Stop 2)
  { lat: 27.5250, lng: 77.7210 }, // Mathura Cantt
  { lat: 27.5502, lng: 77.7891 }, // Raya
  { lat: 27.4890, lng: 77.9350 }, // Beswan link
  { lat: 27.4429, lng: 78.0415 }, // Sadabad
  { lat: 27.5920, lng: 78.0210 }, // Gorai
  { lat: 27.7128, lng: 77.9332 }, // Iglas
  { lat: 27.7850, lng: 77.9950 }, // Sasni link
  { lat: 27.8974, lng: 78.0880 }, // Aligarh Hub (Stop 3)
  { lat: 27.9540, lng: 78.0210 }, // Aligarh bypass
  { lat: 28.0215, lng: 77.9250 }, // Somna NH 34
  { lat: 28.1120, lng: 77.8920 }, // Araniya
  { lat: 28.2543, lng: 77.8540 }, // Khurja
  { lat: 28.3820, lng: 77.8010 }, // Bulandshahr bypass
  { lat: 28.4520, lng: 77.6950 }, // Sikandrabad
  { lat: 28.4682, lng: 77.5085 }, // Greater Noida / Pari Chowk
  { lat: 28.5284, lng: 77.3820 }, // Noida Expressway
  { lat: 28.5720, lng: 77.3150 }, // Mayur Vihar
  { lat: 28.6150, lng: 77.2750 }, // Nizamuddin / Ring Road
  { lat: 28.6675, lng: 77.2280 }, // Kashmere Gate
  { lat: 28.7159, lng: 77.1793 }, // Delhi Azadpur Terminal (Stop 4)
];

const HIGHWAY_ROAD_CORRIDOR_UNOPTIMIZED: google.maps.LatLngLiteral[] = [
  { lat: 27.1767, lng: 78.0081 }, // Agra
  { lat: 27.3500, lng: 78.0500 }, // Hathras Road
  { lat: 27.5900, lng: 78.0500 }, // Hathras
  { lat: 27.8974, lng: 78.0880 }, // Aligarh first (unoptimized)
  { lat: 27.7128, lng: 77.9332 }, // Backtrack to Iglas
  { lat: 27.5502, lng: 77.7891 }, // Raya
  { lat: 27.4924, lng: 77.6737 }, // Mathura second (backtrack)
  { lat: 27.7500, lng: 77.5500 }, // Kosi Kalan
  { lat: 28.1500, lng: 77.3300 }, // Palwal
  { lat: 28.4000, lng: 77.3100 }, // Faridabad
  { lat: 28.5500, lng: 77.2500 }, // Ashram
  { lat: 28.7159, lng: 77.1793 }, // Delhi Azadpur
];

// Helper to decode standard Google encoded polylines
function decodePolyline(encoded: string): google.maps.LatLngLiteral[] {
  const points: google.maps.LatLngLiteral[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

// Inner component to handle Google Maps road routing calculation
interface RouteHandlerProps {
  isOptimized: boolean;
  onRouteCalculated: (metrics: {
    distanceKm: number;
    durationMins: number;
    stopOrder: string[];
  }) => void;
}

const RouteHandler: React.FC<RouteHandlerProps> = ({
  isOptimized,
  onRouteCalculated,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const onRouteCalculatedRef = useRef(onRouteCalculated);
  onRouteCalculatedRef.current = onRouteCalculated;

  useEffect(() => {
    if (!map) return;

    let isCancelled = false;

    // Fit bounds to all stops initially
    try {
      const bounds = new google.maps.LatLngBounds();
      STOPS.forEach((s) => bounds.extend(s.coords));
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    } catch (e) {
      console.warn('Initial bounds fit notice:', e);
    }

    // Draw the road corridor polyline
    const drawCorridorPolyline = (path: google.maps.LatLngLiteral[]) => {
      if (isCancelled) return;
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      const line = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: isOptimized ? '#0E3B2B' : '#78716C',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map,
      });
      polylineRef.current = line;
    };

    // Draw high-resolution road path immediately
    const initialPath = isOptimized
      ? HIGHWAY_ROAD_CORRIDOR_OPTIMIZED
      : HIGHWAY_ROAD_CORRIDOR_UNOPTIMIZED;
    drawCorridorPolyline(initialPath);

    // If routes library is loaded, calculate dynamic driving route via Routes API
    if (routesLib) {
      const calculateDynamicRoute = async () => {
        try {
          const origin = STOPS[0].coords; // Agra
          const destination = STOPS[3].coords; // Delhi
          const intermediates = isOptimized
            ? [{ location: STOPS[1].coords }, { location: STOPS[2].coords }]
            : [{ location: STOPS[2].coords }, { location: STOPS[1].coords }];

          const routeClass = (routesLib as any)?.Route;
          if (routeClass && typeof routeClass.computeRoutes === 'function') {
            const request = {
              origin,
              destination,
              intermediates,
              travelMode: 'DRIVING',
              fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
            };

            const response = await routeClass.computeRoutes(request);
            if (isCancelled) return;

            if (response?.routes && response.routes.length > 0) {
              const primaryRoute = response.routes[0];

              if (typeof primaryRoute.createPolylines === 'function') {
                const newPolylines = primaryRoute.createPolylines();
                if (newPolylines && newPolylines.length > 0) {
                  if (polylineRef.current) {
                    polylineRef.current.setMap(null);
                  }
                  newPolylines.forEach((p: google.maps.Polyline) => {
                    p.setOptions({
                      strokeColor: isOptimized ? '#0E3B2B' : '#78716C',
                      strokeWeight: 5,
                      strokeOpacity: 0.95,
                    });
                    p.setMap(map);
                  });
                  polylineRef.current = newPolylines[0];
                }
              } else if (primaryRoute.polyline?.encodedPolyline) {
                const decodedPath = decodePolyline(primaryRoute.polyline.encodedPolyline);
                if (decodedPath.length > 0) {
                  drawCorridorPolyline(decodedPath);
                }
              }

              if (primaryRoute.viewport && map) {
                try {
                  map.fitBounds(primaryRoute.viewport, { top: 60, bottom: 60, left: 60, right: 60 });
                } catch (e) {
                  console.warn('fitBounds error:', e);
                }
              }

              const distKm = Math.round((primaryRoute.distanceMeters || (isOptimized ? 72000 : 87000)) / 1000);
              const durationMillis = primaryRoute.durationMillis || (isOptimized ? 8400000 : 10800000);
              const durationMins = Math.round(durationMillis / 60000);

              if (!isCancelled && onRouteCalculatedRef.current) {
                onRouteCalculatedRef.current({
                  distanceKm: distKm,
                  durationMins,
                  stopOrder: isOptimized
                    ? ['Agra', 'Mathura', 'Aligarh', 'Delhi']
                    : ['Agra', 'Aligarh', 'Mathura', 'Delhi'],
                });
              }
            }
          }
        } catch (err) {
          // Keep highway corridor polyline intact without throwing or crashing
          console.warn('Routes API computeRoutes notice:', err);
        }
      };

      calculateDynamicRoute();
    }

    return () => {
      isCancelled = true;
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, routesLib, isOptimized]);

  return null;
};

export const LogisticsMap: React.FC = () => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const mapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) || 'DEMO_MAP_ID';

  const [isOptimized, setIsOptimized] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedStop, setSelectedStop] = useState<StopLocation | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Catch Google Maps authentication failures (e.g. HTTP Referrer blocked or API not enabled)
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.error('Google Maps gm_authFailure triggered');
      setAuthError('API_KEY_AUTH_OR_REFERRER_ERROR');
      if (typeof prevAuthFailure === 'function') {
        prevAuthFailure();
      }
    };
    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  // Route metrics state
  const [metrics, setMetrics] = useState({
    distanceKm: 72,
    eta: '11:40 AM',
    truckCount: 1,
    savings: 1400,
    currentDistanceKm: 87,
    currentCost: 5800,
    optimizedCost: 4400,
    stopOrder: ['Agra', 'Mathura', 'Aligarh', 'Delhi'],
  });

  const handleOptimizeClick = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsOptimized(true);
      setMetrics((prev) => ({
        ...prev,
        distanceKm: 72,
        eta: '11:40 AM',
        savings: 1400,
        stopOrder: ['Agra', 'Mathura', 'Aligarh', 'Delhi'],
      }));
      setIsCalculating(false);
    }, 400);
  };

  const handleRouteCalculated = useCallback((calculated: {
    distanceKm: number;
    durationMins: number;
    stopOrder: string[];
  }) => {
    setMetrics((prev) => {
      // Guard against infinite re-render loops by verifying changes
      if (
        prev.distanceKm === calculated.distanceKm &&
        prev.stopOrder.length === calculated.stopOrder.length &&
        prev.stopOrder.every((val, index) => val === calculated.stopOrder[index])
      ) {
        return prev;
      }

      const now = new Date();
      now.setMinutes(now.getMinutes() + calculated.durationMins);
      const etaStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        ...prev,
        distanceKm: calculated.distanceKm || (isOptimized ? 72 : 87),
        eta: isOptimized ? '11:40 AM' : etaStr,
        savings: isOptimized ? 1400 : 0,
        stopOrder: calculated.stopOrder,
      };
    });
  }, [isOptimized]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Optimize Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 font-serif">Cold-Chain Route</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real road corridor: Agra ➔ Mathura ➔ Aligarh ➔ Delhi
          </p>
        </div>

        <button
          type="button"
          onClick={handleOptimizeClick}
          disabled={isCalculating}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0E3B2B] hover:bg-[#144E39] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Calculating...' : 'Optimize Route'}</span>
        </button>
      </div>

      {/* Google Cloud Console Diagnostics Notice (only displayed if auth/referrer issue detected) */}
      {authError && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Google Cloud Console API Key Configuration Required</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            The Google Maps API key loaded correctly from <code className="px-1 py-0.5 bg-amber-100/70 rounded font-mono font-bold text-stone-800">VITE_GOOGLE_MAPS_API_KEY</code>, but Google Cloud rejected the connection due to key restrictions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
            <div className="p-2.5 bg-white/80 border border-amber-200/60 rounded-lg">
              <span className="font-semibold text-stone-900 block mb-1">1. HTTP Referrer Restriction</span>
              <span className="text-stone-600 block">In Cloud Console &gt; Credentials, under &quot;Website restrictions&quot;, add:</span>
              <code className="text-[10px] block mt-1 font-mono text-emerald-800 break-all bg-stone-100 p-1 rounded">
                https://*.run.app/*
              </code>
            </div>
            <div className="p-2.5 bg-white/80 border border-amber-200/60 rounded-lg">
              <span className="font-semibold text-stone-900 block mb-1">2. Enabled APIs</span>
              <span className="text-stone-600 block">In Cloud Console &gt; APIs &amp; Services &gt; Library, ensure these are Enabled:</span>
              <span className="font-medium text-stone-800 block mt-1">• Maps JavaScript API<br />• Routes API</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Visual: Interactive Map Canvas */}
      <div className="relative w-full h-[460px] sm:h-[500px] bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {apiKey ? (
          <ErrorBoundary
            fallbackTitle="Interactive Map Recovery"
            fallbackDescription="Map instance recovered safely. The road stops and delivery savings remain active."
          >
            <APIProvider apiKey={apiKey} libraries={GOOGLE_MAPS_LIBRARIES}>
              <Map
                mapId={mapId}
                defaultCenter={{ lat: 27.95, lng: 77.65 }}
                defaultZoom={8}
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={true}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                <RouteHandler
                  isOptimized={isOptimized}
                  onRouteCalculated={handleRouteCalculated}
                />

                {/* Advanced Markers for the 4 Geographic Stops with safe DOM pin elements */}
                {STOPS.map((stop, index) => (
                  <AdvancedMarker
                    key={stop.id}
                    position={stop.coords}
                    title={`${stop.name} (${stop.role})`}
                    onClick={() => setSelectedStop(stop)}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer ${
                        stop.type === 'destination'
                          ? 'bg-[#0E3B2B] text-amber-300 ring-2 ring-emerald-900/30'
                          : 'bg-emerald-700 text-white ring-2 ring-emerald-600/30'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </ErrorBoundary>
        ) : (
          /* Clean Minimal Key Setup Indicator when API Key not yet in environment */
          <div className="w-full h-full bg-[#F7F7F6] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-700 mb-3">
              <MapPin className="w-6 h-6 text-[#0E3B2B]" />
            </div>
            
            <h3 className="text-base font-semibold text-stone-900 font-serif">
              Google Maps Platform Required
            </h3>
            <p className="text-xs text-stone-600 max-w-md mt-1 leading-relaxed">
              To load the real road map and calculate driving distances across Agra, Mathura, Aligarh, and Delhi, configure <code className="px-1.5 py-0.5 bg-stone-200/80 rounded font-mono text-stone-800 text-[11px]">VITE_GOOGLE_MAPS_API_KEY</code>.
            </p>

            {/* Geographic Stops List */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl text-left">
              {STOPS.map((s, idx) => (
                <div key={s.id} className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-[#0E3B2B] font-semibold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{s.name.split(' ')[0]}</span>
                  </div>
                  <div className="text-stone-500 text-[11px] mt-1 truncate">{s.role.split(':')[1] || s.role}</div>
                  <div className="text-stone-400 font-mono text-[10px] mt-0.5">
                    {s.coords.lat.toFixed(2)}°N, {s.coords.lng.toFixed(2)}°E
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 text-xs">
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E3B2B] text-white rounded-lg font-medium hover:bg-[#144E39] transition-colors"
              >
                <span>Get Maps Demo Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-stone-400 text-[11px]">
                Maps JavaScript API &amp; Routes API
              </span>
            </div>
          </div>
        )}

        {/* Floating Selected Stop Callout */}
        {selectedStop && (
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-stone-200 rounded-xl p-3 shadow-md text-xs max-w-xs space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-stone-900">{selectedStop.name}</span>
              <button
                onClick={() => setSelectedStop(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-stone-600">{selectedStop.role}</div>
            <div className="text-stone-500">
              Payload: <span className="font-medium text-stone-800">{selectedStop.quantity} {selectedStop.crop}</span>
            </div>
            <div className="text-[10px] font-mono text-stone-400 pt-0.5">
              {selectedStop.coords.lat.toFixed(4)}° N, {selectedStop.coords.lng.toFixed(4)}° E
            </div>
          </div>
        )}
      </div>

      {/* Small Minimal Panels: Optimized Metrics & Route Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Panel 1: Primary Metrics */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
              Optimized route
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              ₹{metrics.savings.toLocaleString('en-IN')} estimated savings
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <div className="text-[11px] text-stone-400">Distance</div>
              <div className="text-lg font-mono font-bold text-stone-900">
                {metrics.distanceKm} km
              </div>
            </div>
            <div>
              <div className="text-[11px] text-stone-400">ETA</div>
              <div className="text-lg font-mono font-bold text-stone-900">
                {metrics.eta}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-stone-400">Reefer Truck</div>
              <div className="text-lg font-mono font-bold text-stone-900">
                {metrics.truckCount} truck
              </div>
            </div>
          </div>

          {/* Stop Order sequence */}
          <div className="pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs text-stone-600 overflow-x-auto">
            <span className="text-stone-400 shrink-0 font-medium">Stops:</span>
            {metrics.stopOrder.map((stop, i) => (
              <React.Fragment key={stop}>
                <span className="font-semibold text-stone-800 shrink-0">{stop}</span>
                {i < metrics.stopOrder.length - 1 && (
                  <span className="text-stone-300 shrink-0">➔</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Panel 2: Current vs Optimized Comparison */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-stone-400">
            Route comparison
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-500 py-1">
              <span>Current route</span>
              <div className="font-mono text-stone-700">
                <span>{metrics.currentDistanceKm} km</span>
                <span className="mx-2">·</span>
                <span>₹{metrics.currentCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-stone-900 font-semibold py-1">
              <span className="text-[#0E3B2B]">FarmDirect optimized route</span>
              <div className="font-mono text-emerald-800">
                <span>{metrics.distanceKm} km</span>
                <span className="mx-2">·</span>
                <span>₹{metrics.optimizedCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="font-semibold text-stone-800">Savings</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                ₹{metrics.savings.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
