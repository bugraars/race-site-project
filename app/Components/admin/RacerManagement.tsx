'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getRacers,
  getRacerStats,
  createRacer,
  updateRacer,
  deleteRacer,
  updateRacerPaymentStatus,
  assignBibNumber,
  Racer,
  RacerStats,
  CreateRacerData,
  UpdateRacerData,
} from '@/lib/adminApi';

type FilterStatus = 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export default function RacerManagement() {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [stats, setStats] = useState<RacerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBibModal, setShowBibModal] = useState(false);
  const [selectedRacer, setSelectedRacer] = useState<Racer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState<CreateRacerData>({
    email: '',
    firstName: '',
    lastName: '',
    bibNumber: '',
    nationality: '',
    bloodType: '',
    phone: '',
    emergencyPhone: '',
    idNumber: '',
    birthDate: '',
    tshirtSize: '',
    paymentStatus: 'PENDING',
  });

  const [bibNumberInput, setBibNumberInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [racersRes, statsRes] = await Promise.all([
        getRacers(),
        getRacerStats(),
      ]);

      if (racersRes.success && racersRes.data) {
        setRacers(racersRes.data);
      } else {
        setError(racersRes.error || 'Yarışçılar yüklenemedi');
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      setError('Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRacers = racers.filter((racer) => {
    // Status filter
    if (filterStatus !== 'all' && racer.paymentStatus !== filterStatus) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        racer.firstName.toLowerCase().includes(query) ||
        racer.lastName.toLowerCase().includes(query) ||
        racer.email.toLowerCase().includes(query) ||
        (racer.bibNumber && racer.bibNumber.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const handleAddRacer = async () => {
    setActionLoading(true);
    const res = await createRacer(formData);
    if (res.success) {
      setShowAddModal(false);
      resetForm();
      loadData();
    } else {
      alert(res.error || 'Yarışçı eklenemedi');
    }
    setActionLoading(false);
  };

  const handleEditRacer = async () => {
    if (!selectedRacer) return;
    setActionLoading(true);
    
    const updateData: UpdateRacerData = { ...formData };
    const res = await updateRacer(selectedRacer.id, updateData);
    
    if (res.success) {
      setShowEditModal(false);
      setSelectedRacer(null);
      resetForm();
      loadData();
    } else {
      alert(res.error || 'Yarışçı güncellenemedi');
    }
    setActionLoading(false);
  };

  const handleDeleteRacer = async () => {
    if (!selectedRacer) return;
    setActionLoading(true);
    
    const res = await deleteRacer(selectedRacer.id);
    if (res.success) {
      setShowDeleteModal(false);
      setSelectedRacer(null);
      loadData();
    } else {
      alert(res.error || 'Yarışçı silinemedi');
    }
    setActionLoading(false);
  };

  const handlePaymentStatusChange = async (racer: Racer, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    const res = await updateRacerPaymentStatus(racer.id, status);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Ödeme durumu güncellenemedi');
    }
  };

  const handleAssignBib = async () => {
    if (!selectedRacer || !bibNumberInput) return;
    setActionLoading(true);
    
    const res = await assignBibNumber(selectedRacer.id, bibNumberInput);
    if (res.success) {
      setShowBibModal(false);
      setSelectedRacer(null);
      setBibNumberInput('');
      loadData();
    } else {
      alert(res.error || 'Bib numarası atanamadı');
    }
    setActionLoading(false);
  };

  const openEditModal = (racer: Racer) => {
    setSelectedRacer(racer);
    setFormData({
      email: racer.email,
      firstName: racer.firstName,
      lastName: racer.lastName,
      bibNumber: racer.bibNumber || '',
      nationality: racer.nationality || '',
      bloodType: racer.bloodType || '',
      phone: racer.phone || '',
      emergencyPhone: racer.emergencyPhone || '',
      idNumber: racer.idNumber || '',
      birthDate: racer.birthDate ? racer.birthDate.split('T')[0] : '',
      tshirtSize: racer.tshirtSize || '',
      paymentStatus: racer.paymentStatus,
    });
    setShowEditModal(true);
  };

  const openBibModal = (racer: Racer) => {
    setSelectedRacer(racer);
    setBibNumberInput(racer.bibNumber || '');
    setShowBibModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      bibNumber: '',
      nationality: '',
      bloodType: '',
      phone: '',
      emergencyPhone: '',
      idNumber: '',
      birthDate: '',
      tshirtSize: '',
      paymentStatus: 'PENDING',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">Onaylandı</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-full">Bekliyor</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">İptal</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-gray-500 text-white rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={loadData} className="mt-2 text-red-600 underline">
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Toplam</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-500">Onaylı</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Bekleyen</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-500">İptal</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.withBibNumber}</div>
            <div className="text-sm text-gray-500">Bib Atanmış</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.withoutBibNumber}</div>
            <div className="text-sm text-gray-500">Bib Yok</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalNfcTags}</div>
            <div className="text-sm text-gray-500">NFC Tags</div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="İsim, email veya bib numarası ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white pr-8"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="PENDING">Bekleyen</option>
              <option value="CONFIRMED">Onaylı</option>
              <option value="CANCELLED">İptal</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Yarışçı
          </button>
        </div>
      </div>

      {/* Racers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">BİB</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">İSİM</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-POSTA</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">TELEFON</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ÖDEME</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NFC</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KAYIT</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRacers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || filterStatus !== 'all' ? 'Kriterlere uygun yarışçı bulunamadı' : 'Henüz yarışçı kaydı yok'}
                  </td>
                </tr>
              ) : (
                filteredRacers.map((racer) => (
                  <tr key={racer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {racer.bibNumber ? (
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{racer.bibNumber}</span>
                      ) : (
                        <button
                          onClick={() => openBibModal(racer)}
                          className="text-xs text-gray-400 hover:text-blue-600 underline"
                        >
                          Ata
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{racer.firstName} {racer.lastName}</div>
                      {racer.nationality && <div className="text-xs text-gray-500">{racer.nationality}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{racer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{racer.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(racer.paymentStatus)}
                        <select
                          value={racer.paymentStatus}
                          onChange={(e) => handlePaymentStatusChange(racer, e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none pr-6"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                        >
                          <option value="PENDING">Bekliyor</option>
                          <option value="CONFIRMED">Onayla</option>
                          <option value="CANCELLED">İptal</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {racer.nfcTagsWritten > 0 ? (
                        <span className="text-green-600 font-medium">{racer.nfcTagsWritten}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(racer.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(racer)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRacer(racer);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
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

      {/* Add Racer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Yeni Yarışçı Ekle</h2>
              </div>
            </div>
            <div className="p-6">
              <RacerForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddRacer}
                onCancel={() => setShowAddModal(false)}
                loading={actionLoading}
                submitText="Ekle"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Racer Modal */}
      {showEditModal && selectedRacer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Yarışçı Düzenle</h2>
                  <p className="text-sm text-gray-500">{selectedRacer.firstName} {selectedRacer.lastName}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <RacerForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleEditRacer}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedRacer(null);
                }}
                loading={actionLoading}
                submitText="Güncelle"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRacer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Yarışçıyı Sil</h2>
            </div>
            <p className="text-gray-600 mb-6">
              <strong>{selectedRacer.firstName} {selectedRacer.lastName}</strong> adlı yarışçıyı silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRacer(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
                disabled={actionLoading}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteRacer}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Bib Modal */}
      {showBibModal && selectedRacer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Bib Numarası Ata</h2>
            </div>
            <p className="text-gray-600 mb-4">
              <strong>{selectedRacer.firstName} {selectedRacer.lastName}</strong> için bib numarası atayın.
            </p>
            <input
              type="text"
              value={bibNumberInput}
              onChange={(e) => setBibNumberInput(e.target.value)}
              placeholder="Örn: 001"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBibModal(false);
                  setSelectedRacer(null);
                  setBibNumberInput('');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
                disabled={actionLoading}
              >
                İptal
              </button>
              <button
                onClick={handleAssignBib}
                disabled={actionLoading || !bibNumberInput}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Racer Form Component
function RacerForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  submitText,
}: {
  formData: CreateRacerData;
  setFormData: (data: CreateRacerData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  submitText: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Bib Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bib Numarası</label>
          <input
            type="text"
            value={formData.bibNumber}
            onChange={(e) => setFormData({ ...formData, bibNumber: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Örn: 001"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Emergency Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Acil Durum Telefonu</label>
          <input
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Uyruk</label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Örn: TR"
          />
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kimlik Numarası</label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Blood Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kan Grubu</label>
          <select
            value={formData.bloodType}
            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="">Seçiniz</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="0+">0+</option>
            <option value="0-">0-</option>
          </select>
        </div>

        {/* T-Shirt Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tişört Bedeni</label>
          <select
            value={formData.tshirtSize}
            onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="">Seçiniz</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Durumu</label>
          <select
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'PENDING' | 'CONFIRMED' | 'CANCELLED' })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="PENDING">Bekliyor</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="CANCELLED">İptal</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
          disabled={loading}
        >
          İptal
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !formData.email || !formData.firstName || !formData.lastName}
          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {submitText}
        </button>
      </div>
    </div>
  );
}
