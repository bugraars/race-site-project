'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Event,
  CreateEventData,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  setActiveEvent
} from '@/lib/adminApi';

interface EventManagementProps {
  onError?: (message: string) => void;
  onEventSelect?: (event: Event) => void;
  onEventsChange?: () => void;
}

export default function EventManagement({ onError, onEventSelect, onEventsChange }: EventManagementProps) {
  const t = useTranslations('AdminDashboard');
  
  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Event | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    isActive: false,
    createDefaultCheckpoints: true,
    checkpointCount: 6
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getEvents();
      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      onError?.('Failed to load events');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Open create modal
  const openCreateModal = () => {
    const currentYear = new Date().getFullYear();
    setFormData({
      name: '',
      date: `${currentYear}-01-01`,
      isActive: false,
      createDefaultCheckpoints: true,
      checkpointCount: 6
    });
    setFormError('');
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (event: Event) => {
    setFormData({
      name: event.name,
      date: event.date.split('T')[0],
      isActive: event.isActive,
      createDefaultCheckpoints: false,
      checkpointCount: 6
    });
    setFormError('');
    setShowEditModal(event);
  };

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.date) {
      setFormError(t('event_form_required'));
      return;
    }

    setFormLoading(true);
    setFormError('');

    const createData: CreateEventData = {
      name: formData.name.trim(),
      date: formData.date,
      isActive: formData.isActive,
      createDefaultCheckpoints: formData.createDefaultCheckpoints,
      checkpointCount: formData.checkpointCount
    };

    const result = await createEvent(createData);

    if (result.success) {
      setShowCreateModal(false);
      loadEvents();
      onEventsChange?.();
    } else {
      setFormError(result.error || t('event_create_error'));
    }
    setFormLoading(false);
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    if (!formData.name.trim() || !formData.date) {
      setFormError(t('event_form_required'));
      return;
    }

    setFormLoading(true);
    setFormError('');

    const result = await updateEvent(showEditModal.id, {
      name: formData.name.trim(),
      date: formData.date,
      isActive: formData.isActive
    });

    if (result.success) {
      setShowEditModal(null);
      loadEvents();
      onEventsChange?.();
    } else {
      setFormError(result.error || t('event_update_error'));
    }
    setFormLoading(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!showDeleteModal) return;

    setActionLoading(showDeleteModal.id);
    const result = await deleteEvent(showDeleteModal.id);

    if (result.success) {
      setShowDeleteModal(null);
      loadEvents();
      onEventsChange?.();
    } else {
      onError?.(result.error || t('event_delete_error'));
    }
    setActionLoading(null);
  };

  // Handle set active
  const handleSetActive = async (event: Event) => {
    if (event.isActive) return;

    setActionLoading(event.id);
    const result = await setActiveEvent(event.id);

    if (result.success) {
      loadEvents();
      onEventsChange?.();
    } else {
      onError?.(result.error || t('event_activate_error'));
    }
    setActionLoading(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('event_list')}</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {t('event_total')}: <span className="font-semibold text-gray-900">{events.length}</span>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="truncate">{t('event_add_new')}</span>
        </button>
      </div>

      {/* Event Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t('event_empty')}
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                event.isActive ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'
              }`}
              onClick={() => onEventSelect?.(event)}
            >
              {/* Header with status */}
              <div className={`px-4 py-3 ${event.isActive ? 'bg-green-50' : 'bg-gray-50'} border-b border-gray-100`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    event.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {event.isActive ? t('event_active') : t('event_inactive')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {event.checkpoints?.length || 0} CP
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{event.name}</h3>
                
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(event.date)}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {!event.isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetActive(event);
                      }}
                      disabled={actionLoading === event.id}
                      className="text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {actionLoading === event.id ? '...' : t('event_set_active')}
                    </button>
                  )}
                  {event.isActive && <span></span>}
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(event);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(event);
                      }}
                      disabled={actionLoading === event.id || event.isActive}
                      className={`p-2 rounded-lg transition-colors ${
                        event.isActive 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={event.isActive ? t('event_cannot_delete_active') : t('delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {showEditModal ? t('event_edit') : t('event_add_new')}
              </h3>
            </div>

            <form onSubmit={showEditModal ? handleUpdate : handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('event_name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Olympos Hard Enduro 2026"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('event_date')} *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Active Status */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">
                      {t('event_active')}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('event_active_hint')}
                    </p>
                  </div>
                </label>
              </div>

              {/* Default Checkpoints (only for create) */}
              {!showEditModal && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.createDefaultCheckpoints}
                      onChange={(e) => setFormData({ ...formData, createDefaultCheckpoints: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('event_create_default_cp')}
                    </span>
                  </label>

                  {formData.createDefaultCheckpoints && (
                    <div className="ml-8">
                      <label className="block text-sm text-gray-600 mb-1">
                        {t('event_cp_count')}
                      </label>
                      <select
                        value={formData.checkpointCount}
                        onChange={(e) => setFormData({ ...formData, checkpointCount: parseInt(e.target.value) })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        {[4, 5, 6, 7, 8, 10, 12].map(n => (
                          <option key={n} value={n}>{n} checkpoint (+ Start + Finish)</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {formLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </span>
                  ) : showEditModal ? t('save') : t('event_create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('event_delete')}
              </h3>
              <p className="text-gray-600 mb-1 font-semibold">
                {showDeleteModal.name}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t('event_delete_warning')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === showDeleteModal.id}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading === showDeleteModal.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </span>
                  ) : t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
