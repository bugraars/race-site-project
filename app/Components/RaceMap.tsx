"use client";
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslations, useLocale } from 'next-intl';

mapboxgl.accessToken = process.env.NEXT_MAPBOX_TOKEN || 'pk.eyJ1IjoiYnVncmFhcnMiLCJhIjoiY21qaWRpaDRzMWhwdjNocXhkOHVjN3YwayJ9.1uR9bKzPv-8zPhyzidNGkQ';

const API_URL = 'https://t8wdcqtmvn.eu-central-1.awsapprunner.com/api';

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
    {/* Map area skeleton */}
    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Harita yükleniyor...</p>
        </div>
      </div>
    </div>
    
    {/* Skeleton markers */}
    <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-zinc-700 rounded-full animate-pulse" />
    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-zinc-700 rounded-full animate-pulse" />
    <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-zinc-700 rounded-full animate-pulse" />
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

  // Seçili rotanın noktaları
  const currentRoute = routes.find(r => r.id === selectedRouteId);
  const checkpoints = currentRoute?.points || [];

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
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

  // Harita oluştur
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [30.5744, 36.6015],
      zoom: 11,
      pitch: 60,
    });

    map.on('style.load', () => {
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
    return () => map.remove();
  }, []);

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