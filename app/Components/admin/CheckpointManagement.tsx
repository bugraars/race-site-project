'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Checkpoint,
  CreateCheckpointData,
  getEventCheckpoints,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint,
  deleteAllCheckpoints,
  getActiveEvent
} from '@/lib/adminApi';

interface CheckpointManagementProps {
  eventId?: number;
  onError?: (message: string) => void;
}

export default function CheckpointManagement({ eventId, onError }: CheckpointManagementProps) {
  const t = useTranslations('AdminDashboard');
  
  // State
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeEventId, setActiveEventId] = useState<number | null>(eventId || null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Checkpoint | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Checkpoint | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    orderIndex: 0,
    latitude: '',
    longitude: '',
    imageUrl: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      // Eğer eventId prop olarak gelmiş ise onu kullan
      if (eventId) {
        const cpResult = await getEventCheckpoints(eventId);
        if (cpResult.success && cpResult.data) {
          setCheckpoints(cpResult.data);
        }
        setActiveEventId(eventId);
      } else {
        // Önce aktif event'i bul, sonra onun checkpoint'lerini getir
        const eventResult = await getActiveEvent();
        
        if (eventResult.success && eventResult.data) {
          setActiveEventId(eventResult.data.id);
          const cpResult = await getEventCheckpoints(eventResult.data.id);
          if (cpResult.success && cpResult.data) {
            setCheckpoints(cpResult.data);
          }
        } else {
          setCheckpoints([]);
        }
      }
    } catch (error) {
      onError?.('Failed to load checkpoints');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  // Generate next CP code
  const generateNextCode = () => {
    if (checkpoints.length === 0) return 'CP 000';
    const maxIndex = Math.max(...checkpoints.map(cp => cp.orderIndex));
    const nextIndex = String(maxIndex + 1).padStart(3, '0');
    return `CP ${nextIndex}`;
  };

  // Open create modal
  const openCreateModal = () => {
    const nextCode = generateNextCode();
    const nextOrderIndex = checkpoints.length > 0 
      ? Math.max(...checkpoints.map(cp => cp.orderIndex)) + 1 
      : 0;
    
    setFormData({
      code: nextCode,
      name: '',
      orderIndex: nextOrderIndex,
      latitude: '',
      longitude: '',
      imageUrl: ''
    });
    setFormError('');
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (checkpoint: Checkpoint) => {
    setFormData({
      code: checkpoint.code,
      name: checkpoint.name,
      orderIndex: checkpoint.orderIndex,
      latitude: checkpoint.latitude?.toString() || '',
      longitude: checkpoint.longitude?.toString() || '',
      imageUrl: checkpoint.imageUrl || ''
    });
    setFormError('');
    setShowEditModal(checkpoint);
  };

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventId) {
      setFormError(t('cp_no_active_event'));
      return;
    }
    
    if (!formData.code.trim() || !formData.name.trim()) {
      setFormError(t('cp_form_required'));
      return;
    }

    setFormLoading(true);
    setFormError('');

    const createData: CreateCheckpointData = {
      eventId: activeEventId,
      code: formData.code.trim(),
      name: formData.name.trim(),
      orderIndex: formData.orderIndex,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      imageUrl: formData.imageUrl.trim() || undefined
    };

    const result = await createCheckpoint(createData);

    if (result.success) {
      setShowCreateModal(false);
      loadData();
    } else {
      setFormError(result.error || t('cp_create_error'));
    }
    setFormLoading(false);
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    if (!formData.code.trim() || !formData.name.trim()) {
      setFormError(t('cp_form_required'));
      return;
    }

    setFormLoading(true);
    setFormError('');

    const result = await updateCheckpoint(showEditModal.id, {
      code: formData.code.trim(),
      name: formData.name.trim(),
      orderIndex: formData.orderIndex,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      imageUrl: formData.imageUrl.trim() || null
    });

    if (result.success) {
      setShowEditModal(null);
      loadData();
    } else {
      setFormError(result.error || t('cp_update_error'));
    }
    setFormLoading(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!showDeleteModal) return;

    setActionLoading(showDeleteModal.id);
    const result = await deleteCheckpoint(showDeleteModal.id);

    if (result.success) {
      setShowDeleteModal(null);
      loadData();
    } else {
      onError?.(result.error || t('cp_delete_error'));
    }
    setActionLoading(null);
  };

  // Handle delete all checkpoints
  const handleDeleteAll = async () => {
    if (!activeEventId) return;

    setDeleteAllLoading(true);
    const result = await deleteAllCheckpoints(activeEventId);

    if (result.success) {
      setShowDeleteAllModal(false);
      loadData();
    } else {
      onError?.(result.error || t('cp_delete_all_error'));
    }
    setDeleteAllLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('menu_race_checkpoints')}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {t('cp_total')}: <span className="font-semibold text-gray-900">{checkpoints.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('cp_add_new')}
          </button>
          {checkpoints.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="inline-flex items-center justify-center p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
              title={t('cp_delete_all')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Checkpoint Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checkpoints.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t('cp_empty')}
          </div>
        ) : (
          checkpoints.map((checkpoint) => (
            <div
              key={checkpoint.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {checkpoint.imageUrl ? (
                  <img
                    src={checkpoint.imageUrl}
                    alt={checkpoint.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                {/* Code Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 text-white text-xs font-mono font-bold rounded-lg">
                  {checkpoint.code}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg">{checkpoint.name}</h3>
                
                {/* Coordinates */}
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {checkpoint.latitude && checkpoint.longitude ? (
                    <span className="font-mono text-xs">
                      {checkpoint.latitude.toFixed(6)}, {checkpoint.longitude.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-gray-400">{t('cp_no_coordinates')}</span>
                  )}
                </div>

                {/* Assigned Staff */}
                {checkpoint.staffMembers && checkpoint.staffMembers.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">{t('cp_assigned_staff')}:</span>
                    <div className="flex -space-x-2">
                      {checkpoint.staffMembers.slice(0, 3).map((staff) => (
                        <div
                          key={staff.id}
                          className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-white"
                          title={`${staff.firstName} ${staff.lastName}`}
                        >
                          {staff.firstName[0]}
                        </div>
                      ))}
                      {checkpoint.staffMembers.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center border-2 border-white">
                          +{checkpoint.staffMembers.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">#{checkpoint.orderIndex}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(checkpoint)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(checkpoint)}
                      disabled={actionLoading === checkpoint.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('delete')}
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
                {showEditModal ? t('cp_edit') : t('cp_add_new')}
              </h3>
            </div>

            <form onSubmit={showEditModal ? handleUpdate : handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cp_code')} *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CP 000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                  />
                </div>

                {/* Order Index */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cp_order')} *
                  </label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cp_name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Start, Marina, Finish..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cp_latitude')}
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="41.015137"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cp_longitude')}
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="28.979530"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cp_image_url')}
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">{t('cp_image_hint')}</p>
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
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
                  ) : showEditModal ? t('save') : t('cp_create')}
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
                {t('cp_delete')}
              </h3>
              <p className="text-gray-600 mb-1">
                <span className="font-mono font-semibold">{showDeleteModal.code}</span> - {showDeleteModal.name}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t('cp_delete_warning')}
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

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('cp_delete_all')}
              </h3>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold text-red-600">{checkpoints.length}</span> {t('cp_delete_all_count')}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t('cp_delete_all_warning')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleteAllLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteAllLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </span>
                  ) : t('delete_all')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
