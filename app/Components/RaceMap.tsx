"use client";
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslations, useLocale } from 'next-intl';

mapboxgl.accessToken = process.env.NEXT_MAPBOX_TOKEN || 'pk.eyJ1IjoiYnVncmFhcnMiLCJhIjoiY21qaWRpaDRzMWhwdjNocXhkOHVjN3YwayJ9.1uR9bKzPv-8zPhyzidNGkQ';


interface Checkpoint {
  id: number;
  coords: [number, number];
  elevation: string;
  difficulty: number;
  img: string;
  title: { tr: string; en: string; de: string; ru: string; };
  desc: { tr: string; en: string; de: string; ru: string; };
}

const RaceMap = () => {
  const locale = useLocale() as "tr" | "en" | "de" | "ru";
  const t = useTranslations('Home');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Checkpoint | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  useEffect(() => {
    fetch('/data/checkpoints.json')
      .then((res) => res.json())
      .then((data) => setCheckpoints(data))
      .catch((err) => console.error("JSON Error:", err));
  }, []);

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

  useEffect(() => {
    if (!mapRef.current || !isStyleLoaded || checkpoints.length === 0) return;
    const map = mapRef.current;

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

    checkpoints.forEach((point) => {
      const el = document.createElement('div');
      el.className = 'checkpoint-marker';
      new mapboxgl.Marker(el)
        .setLngLat(point.coords)
        .addTo(map)
        .getElement()
        .addEventListener('click', () => {
          setSelectedPoint(point);
          map.flyTo({ center: point.coords, zoom: 14, pitch: 70, duration: 2000 });
        });
    });
  }, [checkpoints, isStyleLoaded]);

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl font-sans">
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