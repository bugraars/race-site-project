"use client";
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslations, useLocale } from 'next-intl';

// Mapbox token - NEXT_PUBLIC_ prefix required for client-side access
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoib2x5bXBvc2hhcmRlbmR1cm8iLCJhIjoiY21rYmhzZjdxMDBqZTNlcXo0Z3Z2dGVraiJ9.AwtRaRMIws_YlTSrnBqmig';

// API URL - use NEXT_PUBLIC for client-side access
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Checkpoint {
  id: number;
  coords: [number, number];
  elevation: string;
  difficulty: number;
  img: string;
  title: { tr: string; en: string; de: string; ru: string; };
  desc: { tr: string; en: string; de: string; ru: string; };
}

interface Route {
  id: number;
  name: string;
  description?: string;
  points: Checkpoint[];
}

interface EventData {
  id: number;
  name: string;
  date?: string;
}

// Skeleton Loading Component
const MapSkeleton = () => (
  <div className="relative w-full h-[600px] overflow-hidden bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl font-sans">
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800 animate-pulse" />
    
    {/* Shimmer effect */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent skew-x-12" />
    </div>
    
    {/* Content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Map icon with pulse */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        {/* Ping animation */}
        <div className="absolute -inset-1 rounded-2xl bg-red-500/20 animate-ping" />
      </div>
      
      <span className="text-zinc-400 text-sm font-medium">Harita yükleniyor</span>
    </div>
    
    {/* Bottom gradient fade */}
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent" />
  </div>
);

const RaceMap = () => {
  const locale = useLocale() as "tr" | "en" | "de" | "ru";
  const t = useTranslations('Home');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Checkpoint | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debug: Component mount
  useEffect(() => {
    console.log('[RaceMap] Component mounted');
    console.log('[RaceMap] API_URL:', API_URL);
    console.log('[RaceMap] Mapbox Token:', mapboxgl.accessToken ? 'SET' : 'NOT SET');
  }, []);

  // Seçili rotanın noktaları
  const currentRoute = routes.find(r => r.id === selectedRouteId);
  const checkpoints = currentRoute?.points || [];

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      console.log('[RaceMap] Fetching routes from:', `${API_URL}/route/active`);
      try {
        const res = await fetch(`${API_URL}/route/active`);
        
        if (res.status === 404) {
          console.log("No active event found, using fallback data");
          throw new Error('No active event');
        }
        
        if (!res.ok) {
          console.error(`API Error: ${res.status} ${res.statusText}`);
          throw new Error('API Error');
        }
        
        const data = await res.json();
        
        // Event bilgisi
        if (data.event) {
          setEventData(data.event);
        }
        
        // Rotaları parse et
        const parsedRoutes: Route[] = [];
        if (data.routes && Array.isArray(data.routes)) {
          data.routes.forEach((route: any) => {
            const points: Checkpoint[] = [];
            if (route.points && Array.isArray(route.points)) {
              route.points.forEach((point: any) => {
                points.push({
                  id: point.id,
                  coords: point.coords as [number, number],
                  elevation: point.elevation || '0m',
                  difficulty: point.difficulty || 1,
                  img: point.img || '/img/default-checkpoint.jpg',
                  title: point.title || { tr: '', en: '', de: '', ru: '' },
                  desc: point.desc || { tr: '', en: '', de: '', ru: '' },
                });
              });
            }
            parsedRoutes.push({
              id: route.id,
              name: route.name,
              description: route.description,
              points,
            });
          });
        }
        
        if (parsedRoutes.length === 0) {
          console.log("No routes found, using fallback data");
          throw new Error('No routes');
        }
        
        setRoutes(parsedRoutes);
        // İlk rotayı seç
        setSelectedRouteId(parsedRoutes[0].id);
        
      } catch (err) {
        console.log("Using fallback checkpoint data");
        // Fallback: static JSON
        try {
          const fallbackRes = await fetch('/data/checkpoints.json');
          const fallbackData = await fallbackRes.json();
          // Fallback veriyi tek rota olarak sar
          setRoutes([{
            id: 0,
            name: 'Rota',
            points: fallbackData,
          }]);
          setSelectedRouteId(0);
        } catch (fallbackErr) {
          console.error("Fallback JSON Error:", fallbackErr);
          setRoutes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // Harita oluştur - loading false olunca container DOM'da olur
  useEffect(() => {
    // Loading durumunda container henüz yok
    if (loading) {
      console.log('[RaceMap] Still loading, skipping map init');
      return;
    }
    
    if (!mapContainerRef.current) {
      console.log('[RaceMap] Container ref not ready');
      return;
    }
    
    // Zaten map varsa tekrar oluşturma
    if (mapRef.current) {
      console.log('[RaceMap] Map already exists');
      return;
    }
    
    console.log('[RaceMap] Initializing map with token:', mapboxgl.accessToken?.substring(0, 20) + '...');
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [30.5744, 36.6015],
      zoom: 11,
      pitch: 60,
    });

    map.on('error', (e) => {
      console.error('[RaceMap] Map error:', e.error);
    });

    map.on('load', () => {
      console.log('[RaceMap] Map loaded successfully');
    });

    map.on('style.load', () => {
      console.log('[RaceMap] Style loaded, adding terrain');
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      setIsStyleLoaded(true);
    });

    mapRef.current = map;
    return () => {
      console.log('[RaceMap] Cleaning up map');
      map.remove();
      mapRef.current = null;
    };
  }, [loading]); // loading false olunca çalışsın

  // Rota değiştiğinde haritayı güncelle
  useEffect(() => {
    if (!mapRef.current || !isStyleLoaded || checkpoints.length === 0) return;
    const map = mapRef.current;

    // Eski marker'ları temizle
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Rota çizgisi
    const routeData: any = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: checkpoints.map(p => p.coords)
      }
    };

    if (map.getSource('route')) {
      (map.getSource('route') as mapboxgl.GeoJSONSource).setData(routeData);
    } else {
      map.addSource('route', { type: 'geojson', data: routeData });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#dc2626', 'line-width': 5 }
      });
    }

    // Yeni marker'ları ekle
    checkpoints.forEach((point) => {
      const el = document.createElement('div');
      el.className = 'checkpoint-marker';
      const marker = new mapboxgl.Marker(el)
        .setLngLat(point.coords)
        .addTo(map);
      
      marker.getElement().addEventListener('click', () => {
        setSelectedPoint(point);
        map.flyTo({ center: point.coords, zoom: 14, pitch: 70, duration: 2000 });
      });
      
      markersRef.current.push(marker);
    });

    // İlk noktaya zoom
    if (checkpoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      checkpoints.forEach(p => bounds.extend(p.coords));
      map.fitBounds(bounds, { padding: 50, maxZoom: 13 });
    }
  }, [checkpoints, isStyleLoaded, selectedRouteId]);

  // Loading durumunda skeleton göster
  if (loading) {
    return <MapSkeleton />;
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl font-sans">
      {/* Rota Seçici - Üst kısımda */}
      {routes.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/70 backdrop-blur-md rounded-full p-1.5 border border-zinc-700/50">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRouteId(route.id);
                setSelectedPoint(null);
              }}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                selectedRouteId === route.id
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {route.name}
            </button>
          ))}
        </div>
      )}

      {/* Event Adı - Sol üst */}
      {eventData && (
        <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{t('event')}</p>
          <p className="text-white font-bold">{eventData.name}</p>
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-full" />

      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute bottom-0 inset-x-0 bg-[#121212]/95 backdrop-blur-md border-t border-red-500/20 p-6 md:p-10 z-50 rounded-t-[2.5rem] text-white"
          >
            <div className="max-w-6xl mx-auto relative">
              
              <button 
                onClick={() => setSelectedPoint(null)}
                className="absolute -top-4 -right-2 md:top-0 md:right-0 bg-red-500 text-white p-2.5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 z-[70] border-2 border-[#121212]"
              >
                <span className="text-xl w-6 h-6 flex items-center justify-center font-bold">✕</span>
              </button>

              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start relative z-10">
                
                <div className="w-full md:w-1/2 relative z-20">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-xl">
                    <img 
                      src={selectedPoint.img} 
                      className="object-cover w-full h-full" 
                      alt={selectedPoint.title[locale]} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="w-full md:w-1/2 space-y-6 relative z-20">
                  <h3 className="text-3xl md:text-4xl font-black text-red-500 italic uppercase tracking-tighter leading-none">
                    {selectedPoint.title[locale]}
                  </h3>

                  <div className="flex gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl min-w-[110px]">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold mb-1 tracking-widest italic">{t('elevation')}</span>
                      <span className="text-red-500 font-mono text-lg font-bold">{selectedPoint.elevation}</span>
                    </div>
                    
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl min-w-[110px]">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold mb-1 tracking-widest italic">{t('difficulty')}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((star) => (
                          <span 
                            key={star} 
                            className={`text-lg ${star <= selectedPoint.difficulty ? 'text-red-500' : 'text-zinc-700'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/50">
                    <p className="text-zinc-400 text-lg md:text-xl leading-relaxed italic font-medium">
                      {selectedPoint.desc[locale]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RaceMap;