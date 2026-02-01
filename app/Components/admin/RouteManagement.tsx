'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Route,
  RoutePoint,
  Event,
  getEvents,
  getRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  getRoutePoints,
  createRoutePoint,
  updateRoutePoint,
  deleteRoutePoint,
  reorderRoutePoints,
  uploadRouteImage,
} from '@/lib/adminApi';

interface RouteManagementProps {
  onError?: (message: string) => void;
}

interface LocalizedText {
  tr: string;
  en: string;
  de: string;
  ru: string;
}

interface RouteForm {
  name: string;
  description: string;
}

interface PointForm {
  longitude: string;
  latitude: string;
  elevation: string;
  difficulty: number;
  imageUrl: string;
  title: LocalizedText;
  description: LocalizedText;
  isCheckpoint: boolean;
  checkpointCode: string;
  checkpointOrder: string;
}

const EMPTY_LOCALIZED: LocalizedText = { tr: '', en: '', de: '', ru: '' };

const EMPTY_POINT_FORM: PointForm = {
  longitude: '',
  latitude: '',
  elevation: '',
  difficulty: 1,
  imageUrl: '',
  title: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  isCheckpoint: false,
  checkpointCode: '',
  checkpointOrder: '',
};

const DIFFICULTY_LABELS = ['Kolay', 'Orta', 'Zor'];
const LANGUAGES = ['tr', 'en', 'de', 'ru'] as const;

export default function RouteManagement({ onError }: RouteManagementProps) {
  const t = useTranslations('AdminDashboard');
  
  // Event state
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  // Route state
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [routesLoading, setRoutesLoading] = useState(false);
  
  // Route points state
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  
  // Modal states
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showPointModal, setShowPointModal] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [editingPointId, setEditingPointId] = useState<number | null>(null);
  
  // Form states
  const [routeForm, setRouteForm] = useState<RouteForm>({ name: '', description: '' });
  const [pointForm, setPointForm] = useState<PointForm>(EMPTY_POINT_FORM);
  const [activeLang, setActiveLang] = useState<'tr' | 'en' | 'de' | 'ru'>('tr');
  
  // Loading states
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load routes when event changes
  useEffect(() => {
    if (selectedEventId) {
      loadRoutes(selectedEventId);
      setSelectedRouteId(null);
      setPoints([]);
    }
  }, [selectedEventId]);

  // Load points when route changes
  useEffect(() => {
    if (selectedRouteId) {
      loadPoints(selectedRouteId);
    } else {
      setPoints([]);
    }
  }, [selectedRouteId]);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const result = await getEvents();
      if (result.success && result.data) {
        setEvents(result.data);
        // Aktif event'i seç
        const activeEvent = result.data.find(e => e.isActive);
        if (activeEvent) {
          setSelectedEventId(activeEvent.id);
        } else if (result.data.length > 0) {
          setSelectedEventId(result.data[0].id);
        }
      }
    } catch (error) {
      onError?.('Event\'ler yüklenemedi');
    }
    setEventsLoading(false);
  };

  const loadRoutes = async (eventId: number) => {
    setRoutesLoading(true);
    try {
      const result = await getRoutes(eventId);
      if (result.success && result.data) {
        setRoutes(result.data);
      }
    } catch (error) {
      onError?.('Rotalar yüklenemedi');
    }
    setRoutesLoading(false);
  };

  const loadPoints = async (routeId: number) => {
    setPointsLoading(true);
    try {
      const result = await getRoutePoints(routeId);
      if (result.success && result.data) {
        setPoints(result.data);
      }
    } catch (error) {
      onError?.('Rota noktaları yüklenemedi');
    }
    setPointsLoading(false);
  };

  // ==================== ROUTE HANDLERS ====================

  const handleCreateRoute = () => {
    setEditingRouteId(null);
    setRouteForm({ name: '', description: '' });
    setShowRouteModal(true);
  };

  const handleEditRoute = (route: Route) => {
    setEditingRouteId(route.id);
    setRouteForm({ name: route.name, description: route.description || '' });
    setShowRouteModal(true);
  };

  const handleSaveRoute = async () => {
    if (!selectedEventId || !routeForm.name.trim()) {
      onError?.('Rota adı zorunludur');
      return;
    }

    setSaving(true);
    try {
      if (editingRouteId) {
        const result = await updateRoute(editingRouteId, {
          name: routeForm.name,
          description: routeForm.description || undefined,
        });
        if (!result.success) {
          onError?.(result.error || 'Rota güncellenemedi');
          setSaving(false);
          return;
        }
      } else {
        const result = await createRoute({
          eventId: selectedEventId,
          name: routeForm.name,
          description: routeForm.description || undefined,
        });
        if (!result.success) {
          onError?.(result.error || 'Rota oluşturulamadı');
          setSaving(false);
          return;
        }
      }
      setShowRouteModal(false);
      loadRoutes(selectedEventId);
    } catch (error) {
      onError?.('Kaydetme hatası');
    }
    setSaving(false);
  };

  const handleDeleteRoute = async (id: number) => {
    if (!confirm('Bu rotayı ve tüm noktalarını silmek istediğinize emin misiniz?')) return;
    
    try {
      const result = await deleteRoute(id);
      if (result.success && selectedEventId) {
        if (selectedRouteId === id) {
          setSelectedRouteId(null);
        }
        loadRoutes(selectedEventId);
      } else {
        onError?.(result.error || 'Silme başarısız');
      }
    } catch (error) {
      onError?.('Silme hatası');
    }
  };

  // ==================== POINT HANDLERS ====================

  const handleCreatePoint = () => {
    setEditingPointId(null);
    setPointForm({
      ...EMPTY_POINT_FORM,
      checkpointOrder: String(points.filter(p => p.isCheckpoint).length),
    });
    setActiveLang('tr');
    setShowPointModal(true);
  };

  const handleEditPoint = (point: RoutePoint) => {
    setEditingPointId(point.id);
    setPointForm({
      longitude: point.longitude.toString(),
      latitude: point.latitude.toString(),
      elevation: point.elevation,
      difficulty: point.difficulty,
      imageUrl: point.imageUrl || '',
      title: JSON.parse(point.title),
      description: JSON.parse(point.description),
      isCheckpoint: point.isCheckpoint,
      checkpointCode: point.checkpointCode || '',
      checkpointOrder: point.checkpointOrder?.toString() || '',
    });
    setActiveLang('tr');
    setShowPointModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadRouteImage(file);
      if (result.success && result.data) {
        setPointForm(prev => ({ ...prev, imageUrl: result.data!.url }));
      } else {
        onError?.(result.error || 'Görsel yüklenemedi');
      }
    } catch (error) {
      onError?.('Görsel yükleme hatası');
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSavePoint = async () => {
    if (!selectedRouteId) return;
    
    if (!pointForm.longitude || !pointForm.latitude || !pointForm.elevation) {
      onError?.('Koordinatlar ve yükseklik zorunludur');
      return;
    }
    if (!pointForm.title.tr || !pointForm.title.en) {
      onError?.('Başlık (TR ve EN) zorunludur');
      return;
    }
    if (pointForm.isCheckpoint && (!pointForm.checkpointCode || pointForm.checkpointOrder === '')) {
      onError?.('Checkpoint için kod ve sıra zorunludur');
      return;
    }

    setSaving(true);
    try {
      const data = {
        routeId: selectedRouteId,
        longitude: parseFloat(pointForm.longitude),
        latitude: parseFloat(pointForm.latitude),
        elevation: pointForm.elevation,
        difficulty: pointForm.difficulty,
        imageUrl: pointForm.imageUrl || undefined,
        title: pointForm.title,
        description: pointForm.description,
        isCheckpoint: pointForm.isCheckpoint,
        checkpointCode: pointForm.isCheckpoint ? pointForm.checkpointCode : undefined,
        checkpointOrder: pointForm.isCheckpoint ? parseInt(pointForm.checkpointOrder) : undefined,
      };

      if (editingPointId) {
        const result = await updateRoutePoint(editingPointId, data);
        if (!result.success) {
          onError?.(result.error || 'Güncelleme başarısız');
          setSaving(false);
          return;
        }
      } else {
        const result = await createRoutePoint(data);
        if (!result.success) {
          onError?.(result.error || 'Oluşturma başarısız');
          setSaving(false);
          return;
        }
      }

      setShowPointModal(false);
      loadPoints(selectedRouteId);
    } catch (error) {
      onError?.('Kaydetme hatası');
    }
    setSaving(false);
  };

  const handleDeletePoint = async (id: number) => {
    if (!confirm('Bu noktayı silmek istediğinize emin misiniz?')) return;

    try {
      const result = await deleteRoutePoint(id);
      if (result.success && selectedRouteId) {
        loadPoints(selectedRouteId);
      } else {
        onError?.(result.error || 'Silme başarısız');
      }
    } catch (error) {
      onError?.('Silme hatası');
    }
  };

  const handleMovePoint = async (id: number, direction: 'up' | 'down') => {
    const index = points.findIndex(p => p.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= points.length) return;

    const newPoints = [...points];
    [newPoints[index], newPoints[newIndex]] = [newPoints[newIndex], newPoints[index]];
    
    const orders = newPoints.map((p, i) => ({ id: p.id, orderIndex: i }));
    
    try {
      const result = await reorderRoutePoints(orders);
      if (result.success && selectedRouteId) {
        loadPoints(selectedRouteId);
      }
    } catch (error) {
      onError?.('Sıralama hatası');
    }
  };

  const handleToggleActive = async (point: RoutePoint) => {
    try {
      const result = await updateRoutePoint(point.id, { isActive: !point.isActive });
      if (result.success && selectedRouteId) {
        loadPoints(selectedRouteId);
      }
    } catch (error) {
      onError?.('Güncelleme hatası');
    }
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('selected_event')}</label>
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(e.target.value ? parseInt(e.target.value) : null)}
              disabled={eventsLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white font-semibold text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              {eventsLoading ? (
                <option>Yükleniyor...</option>
              ) : events.length === 0 ? (
                <option value="">Event bulunamadı</option>
              ) : (
                events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} {event.isActive && '✓'}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {selectedEventId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Routes Panel */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t('route_routes')}</h3>
              <button
                onClick={handleCreateRoute}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('route_add_route')}
              </button>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {routesLoading ? (
                <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
              ) : routes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>{t('route_empty')}</p>
                </div>
              ) : (
                routes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRouteId === route.id ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{route.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {route._count?.routePoints || 0} nokta
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditRoute(route); }}
                          className="p-1.5 text-gray-400 hover:text-blue-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Route Points Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedRoute ? `${selectedRoute.name} - ${t('route_points')}` : t('route_select_route')}
                </h3>
                {selectedRoute && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {points.length} nokta, {points.filter(p => p.isCheckpoint).length} checkpoint
                  </p>
                )}
              </div>
              {selectedRouteId && (
                <button
                  onClick={handleCreatePoint}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('route_add_point')}
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {!selectedRouteId ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p>{t('route_select_route')}</p>
                </div>
              ) : pointsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : points.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>{t('route_no_points')}</p>
                </div>
              ) : (
                points.map((point, index) => {
                  const title = JSON.parse(point.title);
                  return (
                    <div
                      key={point.id}
                      className={`p-2 sm:p-4 hover:bg-gray-50 transition-colors ${!point.isActive ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Order & Checkpoint Badge */}
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <span className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold rounded-full text-xs sm:text-sm ${
                            point.isCheckpoint 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          {point.isCheckpoint && (
                            <span className="text-[8px] sm:text-[10px] font-bold text-red-500">
                              {point.checkpointCode}
                            </span>
                          )}
                        </div>

                        {/* Image */}
                        {point.imageUrl ? (
                          <img
                            src={point.imageUrl}
                            alt={title.tr}
                            className="w-10 h-8 sm:w-16 sm:h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-8 sm:w-16 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{title.tr}</h4>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 text-[10px] sm:text-xs text-gray-400">
                            <span>{point.elevation}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{point.longitude.toFixed(4)}, {point.latitude.toFixed(4)}</span>
                            <span>•</span>
                            <span className={`px-1 sm:px-1.5 py-0.5 rounded ${
                              point.difficulty === 1 ? 'bg-green-100 text-green-700' :
                              point.difficulty === 2 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {DIFFICULTY_LABELS[point.difficulty - 1]}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleMovePoint(point.id, 'up')}
                            disabled={index === 0}
                            className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMovePoint(point.id, 'down')}
                            disabled={index === points.length - 1}
                            className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleActive(point)}
                            className={`p-1 sm:p-1.5 ${point.isActive ? 'text-green-500' : 'text-gray-400'}`}
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditPoint(point)}
                            className="p-1 sm:p-1.5 text-blue-500 hover:text-blue-600"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePoint(point.id)}
                            className="p-1 sm:p-1.5 text-red-500 hover:text-red-600"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRouteId ? t('route_edit_route') : t('route_add_route')}
              </h3>
              <button onClick={() => setShowRouteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_name')}</label>
                <input
                  type="text"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Gün 1, Pro Rota, vb."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_description_field')}</label>
                <textarea
                  value={routeForm.description}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Rota açıklaması (opsiyonel)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowRouteModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveRoute}
                disabled={saving}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? '...' : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Point Modal */}
      {showPointModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPointId ? t('route_edit_point') : t('route_add_point')}
              </h3>
              <button onClick={() => setShowPointModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('route_image')}</label>
                <div className="flex items-start gap-4">
                  {pointForm.imageUrl ? (
                    <div className="relative">
                      <img src={pointForm.imageUrl} alt="Preview" className="w-24 h-18 object-cover rounded-lg border" />
                      <button
                        onClick={() => setPointForm(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-18 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <input
                    type="text"
                    value={pointForm.imageUrl}
                    onChange={(e) => setPointForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="veya URL girin..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_longitude')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={pointForm.longitude}
                    onChange={(e) => setPointForm(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="30.5744"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_latitude')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={pointForm.latitude}
                    onChange={(e) => setPointForm(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="36.6015"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Elevation & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_elevation')}</label>
                  <input
                    type="text"
                    value={pointForm.elevation}
                    onChange={(e) => setPointForm(prev => ({ ...prev, elevation: e.target.value }))}
                    placeholder="2365m"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_difficulty')}</label>
                  <select
                    value={pointForm.difficulty}
                    onChange={(e) => setPointForm(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value={1}>⭐ Kolay</option>
                    <option value={2}>⭐⭐ Orta</option>
                    <option value={3}>⭐⭐⭐ Zor</option>
                  </select>
                </div>
              </div>

              {/* Checkpoint Toggle */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pointForm.isCheckpoint}
                    onChange={(e) => setPointForm(prev => ({ ...prev, isCheckpoint: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="font-medium text-gray-900">{t('route_is_checkpoint')}</span>
                </label>

                {pointForm.isCheckpoint && (
                  <div className="grid grid-cols-2 gap-4 pl-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_cp_code')}</label>
                      <input
                        type="text"
                        value={pointForm.checkpointCode}
                        onChange={(e) => setPointForm(prev => ({ ...prev, checkpointCode: e.target.value.toUpperCase() }))}
                        placeholder="CP-001"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('route_cp_order')}</label>
                      <input
                        type="number"
                        min="0"
                        value={pointForm.checkpointOrder}
                        onChange={(e) => setPointForm(prev => ({ ...prev, checkpointOrder: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Language Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-1">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeLang === lang
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('route_title_label')} ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={pointForm.title[activeLang]}
                  onChange={(e) => setPointForm(prev => ({
                    ...prev,
                    title: { ...prev.title, [activeLang]: e.target.value }
                  }))}
                  placeholder={`Başlık (${activeLang.toUpperCase()})`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('route_description_label')} ({activeLang.toUpperCase()})
                </label>
                <textarea
                  value={pointForm.description[activeLang]}
                  onChange={(e) => setPointForm(prev => ({
                    ...prev,
                    description: { ...prev.description, [activeLang]: e.target.value }
                  }))}
                  placeholder={`Açıklama (${activeLang.toUpperCase()})`}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPointModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSavePoint}
                disabled={saving}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? '...' : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
