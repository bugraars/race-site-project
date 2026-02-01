"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  getStaffList, 
  createStaff, 
  deleteStaff, 
  toggleStaffActive, 
  updateStaffRole,
  assignStaffCheckpoint,
  getEvents,
  getEventCheckpoints,
  updateStaff,
  Staff, 
  CreateStaffData,
  UpdateStaffData,
  Checkpoint,
  Event
} from '@/lib/adminApi';

interface StaffManagementProps {
  onError?: (message: string) => void;
}

export default function StaffManagement({ onError }: StaffManagementProps) {
  const t = useTranslations('AdminDashboard');
  
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkpointsLoading, setCheckpointsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Staff | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Staff | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateStaffData>({
    firstName: '',
    lastName: '',
    pin: '',
    role: 'STAFF',
    phone: '',
    email: '',
  });
  const [editFormData, setEditFormData] = useState<UpdateStaffData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Staff ve event listesini yükle
  const loadData = async () => {
    setLoading(true);
    
    const [staffResult, eventsResult] = await Promise.all([
      getStaffList(),
      getEvents()
    ]);
    
    if (staffResult.success && staffResult.data) {
      setStaffList(staffResult.data);
    } else {
      onError?.(staffResult.error || 'Staff listesi yüklenemedi');
    }
    
    if (eventsResult.success && eventsResult.data) {
      setEvents(eventsResult.data);
      // Aktif event'i varsayılan olarak seç
      const activeEvent = eventsResult.data.find(e => e.isActive);
      if (activeEvent && !selectedEventId) {
        setSelectedEventId(activeEvent.id);
      }
    }
    
    setLoading(false);
  };

  // Event değiştiğinde checkpoint'leri yükle
  const loadCheckpoints = async (eventId: number) => {
    setCheckpointsLoading(true);
    const result = await getEventCheckpoints(eventId);
    if (result.success && result.data) {
      setCheckpoints(result.data);
    } else {
      setCheckpoints([]);
    }
    setCheckpointsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Event seçildiğinde checkpoint'leri yükle
  useEffect(() => {
    if (selectedEventId) {
      loadCheckpoints(selectedEventId);
    } else {
      setCheckpoints([]);
    }
  }, [selectedEventId]);

  // Staff oluştur
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.firstName || !formData.lastName || !formData.pin) {
      setFormError(t('staff_form_required'));
      return;
    }

    if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
      setFormError(t('staff_pin_invalid'));
      return;
    }

    setFormLoading(true);
    const result = await createStaff(formData);
    
    if (result.success) {
      setShowCreateModal(false);
      setFormData({ firstName: '', lastName: '', pin: '', role: 'STAFF', phone: '', email: '' });
      loadData();
    } else {
      setFormError(result.error || t('staff_create_error'));
    }
    setFormLoading(false);
  };

  // Staff sil
  const handleDelete = async () => {
    if (!showDeleteModal) return;
    
    setActionLoading(showDeleteModal.id);
    const result = await deleteStaff(showDeleteModal.id);
    
    if (result.success) {
      setShowDeleteModal(null);
      loadData();
    } else {
      onError?.(result.error || t('staff_delete_error'));
    }
    setActionLoading(null);
  };

  // Staff düzenle
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    
    setFormError('');
    setFormLoading(true);
    
    const result = await updateStaff(showEditModal.id, editFormData);
    
    if (result.success) {
      setShowEditModal(null);
      loadData();
    } else {
      setFormError(result.error || t('staff_edit_error'));
    }
    setFormLoading(false);
  };

  // Edit modal aç
  const openEditModal = (staff: Staff) => {
    setEditFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email || '',
      phone: staff.phone || '',
    });
    setFormError('');
    setShowEditModal(staff);
  };

  // Aktif/Pasif toggle
  const handleToggleActive = async (staff: Staff) => {
    setActionLoading(staff.id);
    const result = await toggleStaffActive(staff.id, !staff.isActive);
    
    if (result.success) {
      loadData();
    } else {
      onError?.(result.error || t('staff_toggle_error'));
    }
    setActionLoading(null);
  };

  // Checkpoint değiştir
  const handleCheckpointChange = async (staff: Staff, checkpointId: number | null) => {
    setActionLoading(staff.id);
    const result = await assignStaffCheckpoint(staff.id, checkpointId);
    
    if (result.success) {
      loadData();
    } else {
      onError?.(result.error || t('staff_checkpoint_error'));
    }
    setActionLoading(null);
  };

  // Rol değiştir
  const handleRoleChange = async (staff: Staff, newRole: 'ADMIN' | 'STAFF') => {
    setActionLoading(staff.id);
    const result = await updateStaffRole(staff.id, newRole);
    
    if (result.success) {
      loadData();
    } else {
      onError?.(result.error || t('staff_role_error'));
    }
    setActionLoading(null);
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('menu_staff_list')}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {t('staff_total')}: {staffList.length}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('staff_add_new')}
        </button>
      </div>

      {/* Event Seçici - Checkpoint atama için */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {t('staff_select_event_for_checkpoint')}:
          </label>
          <select
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">{t('staff_select_event')}</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} {event.isActive ? '(Aktif)' : ''}
              </option>
            ))}
          </select>
          {checkpointsLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
          )}
          {selectedEventId && !checkpointsLoading && (
            <span className="text-sm text-gray-500">
              {checkpoints.length} checkpoint
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('staff_code')}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('staff_name')}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('staff_contact')}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('staff_status')}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('staff_role')}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('staff_checkpoint')}
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('staff_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {t('staff_empty')}
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr 
                    key={staff.id} 
                    className={`hover:bg-gray-50 transition-colors ${!staff.isActive ? 'opacity-50' : ''}`}
                  >
                    {/* Staff Code */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {staff.staffCode}
                      </span>
                    </td>
                    
                    {/* Name */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{staff.firstName} {staff.lastName}</p>
                    </td>
                    
                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {staff.email && (
                          <p className="text-gray-600">{staff.email}</p>
                        )}
                        {staff.phone && (
                          <p className="text-gray-500">{staff.phone}</p>
                        )}
                        {!staff.email && !staff.phone && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(staff)}
                        disabled={actionLoading === staff.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          staff.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${staff.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {staff.isActive ? t('staff_active') : t('staff_inactive')}
                      </button>
                    </td>
                    
                    {/* Role */}
                    <td className="px-6 py-4">
                      <select
                        value={staff.role}
                        onChange={(e) => handleRoleChange(staff, e.target.value as 'ADMIN' | 'STAFF')}
                        disabled={actionLoading === staff.id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer transition-colors ${
                          staff.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="STAFF">STAFF</option>
                      </select>
                    </td>
                    
                    {/* Checkpoint */}
                    <td className="px-6 py-4">
                      <select
                        value={staff.checkpointId || ''}
                        onChange={(e) => handleCheckpointChange(staff, e.target.value ? Number(e.target.value) : null)}
                        disabled={actionLoading === staff.id || !selectedEventId}
                        className={`text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer transition-colors hover:border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none min-w-[180px] ${!selectedEventId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={!selectedEventId ? t('staff_select_event_first') : ''}
                      >
                        <option value="">{t('staff_no_checkpoint')}</option>
                        {checkpoints.map((checkpoint) => (
                          <option key={checkpoint.id} value={checkpoint.id}>
                            {checkpoint.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          disabled={actionLoading === staff.id}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('staff_edit')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(staff)}
                          disabled={actionLoading === staff.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('staff_delete')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="relative inline-block w-full max-w-md bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8">
              <form onSubmit={handleCreate}>
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('staff_add_new')}</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Ad Soyad */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_first_name')} *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          placeholder="Ahmet"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_last_name')} *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          placeholder="Yılmaz"
                          required
                        />
                      </div>
                    </div>

                    {/* PIN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_pin')} *</label>
                      <input
                        type="password"
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition font-mono tracking-widest text-center text-lg"
                        placeholder="● ● ● ●"
                        maxLength={4}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">{t('staff_pin_hint')}</p>
                    </div>

                    {/* Rol */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_role')}</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'STAFF' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      >
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_email')}</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        placeholder="ahmet@example.com"
                      />
                    </div>

                    {/* Telefon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_phone')}</label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>

                    {/* Error */}
                    {formError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{formError}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {t('staff_create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(null)}></div>
            
            <div className="relative inline-block w-full max-w-md bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8">
              <form onSubmit={handleEdit}>
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('staff_edit')}</h3>
                      <p className="text-sm text-gray-500">{showEditModal.staffCode}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Ad Soyad */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_first_name')} *</label>
                        <input
                          type="text"
                          value={editFormData.firstName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_last_name')} *</label>
                        <input
                          type="text"
                          value={editFormData.lastName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          required
                        />
                      </div>
                    </div>

                    {/* E-posta */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_email')}</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="ornek@email.com"
                      />
                    </div>

                    {/* Telefon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('staff_phone')}</label>
                      <input
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>

                    {/* Error */}
                    {formError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{formError}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {t('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(null)}></div>
            
            <div className="relative inline-block w-full max-w-sm bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('staff_delete_confirm')}</h3>
                </div>
                
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">{showDeleteModal.firstName} {showDeleteModal.lastName}</span> ({showDeleteModal.staffCode}) {t('staff_delete_warning')}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === showDeleteModal.id}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === showDeleteModal.id && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {t('staff_delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
