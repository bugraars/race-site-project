'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  getSubscribers,
  getSubscriberStats,
  createSubscriber,
  deleteSubscriber,
  toggleSubscriber,
  importSubscribersFromVerifications,
  sendBulkMail,
  getBulkMailJobStatus,
  cancelBulkMailJob,
  BulkMailJobStatus,
  MailSubscriber,
  SubscriberStats,
  SubscriberSource,
} from '@/lib/adminApi';

// Icons
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ImportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AttachmentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

interface BulkMailManagementProps {
  staffId?: number;
}

interface AttachmentFile {
  file: File;
  name: string;
  size: number;
}

export default function BulkMailManagement({ staffId }: BulkMailManagementProps) {
  const t = useTranslations('AdminDashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<MailSubscriber[]>([]);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [subscribersTotal, setSubscribersTotal] = useState(0);
  const [subscribersTotalPages, setSubscribersTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SubscriberSource | ''>('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // Stats state
  const [stats, setStats] = useState<SubscriberStats | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Compose state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [sending, setSending] = useState(false);
  
  // Queue progress state
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<BulkMailJobStatus | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Add subscriber modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Load subscribers
  const loadSubscribers = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getSubscribers(
        page,
        50,
        searchQuery || undefined,
        sourceFilter || undefined,
        activeFilter
      );
      
      if (result.success && result.data) {
        const apiData = result.data as any;
        const data = apiData.data || apiData;
        setSubscribers(data.subscribers || []);
        setSubscribersTotal(data.total || 0);
        setSubscribersTotalPages(data.totalPages || 0);
        setSubscribersPage(data.page || page);
      } else {
        setError(result.error || 'Aboneler yüklenemedi');
      }
    } catch {
      setError('Aboneler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sourceFilter, activeFilter]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const result = await getSubscriberStats();
      if (result.success && result.data) {
        const apiData = result.data as any;
        setStats(apiData.data || apiData);
      }
    } catch {
      console.error('Stats yüklenemedi');
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSubscribers();
    loadStats();
  }, [loadSubscribers, loadStats]);

  // Handle search
  const handleSearch = () => {
    setSubscribersPage(1);
    loadSubscribers(1);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      const activeIds = subscribers.filter(s => s.isActive).map(s => s.id);
      setSelectedIds(new Set(activeIds));
    }
    setSelectAll(!selectAll);
  };

  // Handle single select
  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === subscribers.filter(s => s.isActive).length);
  };

  // Handle toggle active
  const handleToggleActive = async (subscriber: MailSubscriber) => {
    try {
      const result = await toggleSubscriber(subscriber.id, !subscriber.isActive);
      if (result.success) {
        setSubscribers(prev => prev.map(s => 
          s.id === subscriber.id ? { ...s, isActive: !s.isActive } : s
        ));
        loadStats();
      } else {
        setError(result.error || 'İşlem başarısız');
      }
    } catch {
      setError('İşlem başarısız');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Bu aboneyi silmek istediğinize emin misiniz?')) return;

    try {
      const result = await deleteSubscriber(id);
      if (result.success) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        loadStats();
        setSuccess('Abone silindi');
      } else {
        setError(result.error || 'Silme başarısız');
      }
    } catch {
      setError('Silme başarısız');
    }
  };

  // Handle import from verifications
  const handleImport = async () => {
    if (!confirm('Doğrulama kodlarından aboneler import edilecek. Devam etmek istiyor musunuz?')) return;

    setLoading(true);
    try {
      const result = await importSubscribersFromVerifications();
      if (result.success && result.data) {
        const apiData = result.data as any;
        const data = apiData.data || apiData;
        setSuccess(`${data.imported || 0} abone import edildi, ${data.skipped || 0} atlandı`);
        loadSubscribers();
        loadStats();
      } else {
        setError(result.error || 'Import başarısız');
      }
    } catch {
      setError('Import başarısız');
    } finally {
      setLoading(false);
    }
  };

  // Handle add subscriber
  const handleAddSubscriber = async () => {
    if (!newEmail.trim()) {
      setError('E-posta adresi zorunludur');
      return;
    }

    setLoading(true);
    try {
      const result = await createSubscriber({
        email: newEmail,
        firstName: newFirstName || undefined,
        lastName: newLastName || undefined,
        phone: newPhone || undefined,
        source: 'MANUAL',
      });

      if (result.success) {
        setSuccess('Abone eklendi');
        setShowAddModal(false);
        setNewEmail('');
        setNewFirstName('');
        setNewLastName('');
        setNewPhone('');
        loadSubscribers();
        loadStats();
      } else {
        setError(result.error || 'Ekleme başarısız');
      }
    } catch {
      setError('Ekleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments: AttachmentFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} çok büyük (max 10MB)`);
        continue;
      }
      newAttachments.push({
        file,
        name: file.name,
        size: file.size,
      });
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Open compose modal
  const openComposeModal = () => {
    if (selectedIds.size === 0) {
      setError('Lütfen en az bir abone seçin');
      return;
    }
    setComposeSubject('');
    setComposeBody('');
    setAttachments([]);
    setShowComposeModal(true);
  };

  // Send bulk mail
  const handleSendBulkMail = async () => {
    if (!composeSubject.trim()) {
      setError('Konu zorunludur');
      return;
    }
    if (!composeBody.trim()) {
      setError('İçerik zorunludur');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = await sendBulkMail({
        subject: composeSubject,
        body: composeBody.replace(/\n/g, '<br>'),
        textBody: composeBody,
        subscriberIds: Array.from(selectedIds),
        staffId,
        attachments: attachments.map(a => a.file),
      });

      if (result.success && result.data) {
        const apiData = result.data as any;
        const data = apiData.data || apiData;
        
        // Job ID'yi kaydet ve ilerleme modalını aç
        setCurrentJobId(data.jobId);
        setShowComposeModal(false);
        setShowProgressModal(true);
        
        // İlerleme takibini başlat
        startJobPolling(data.jobId);
        
        setSuccess(`Toplu mail kuyruğa eklendi (${data.totalRecipients} alıcı)`);
        setSelectedIds(new Set());
        setSelectAll(false);
      } else {
        setError(result.error || 'Gönderim başarısız');
      }
    } catch {
      setError('Gönderim başarısız');
    } finally {
      setSending(false);
    }
  };

  // Job durumunu polling ile takip et
  const startJobPolling = useCallback((jobId: number) => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await getBulkMailJobStatus(jobId);
        if (result.success && result.data) {
          const apiData = result.data as any;
          const status = apiData.data || apiData;
          setJobStatus(status);
          
          // İş tamamlandıysa polling'i durdur
          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status.status)) {
            clearInterval(pollInterval);
            loadSubscribers(); // Subscriber stats'ları güncelle
          }
        }
      } catch (error) {
        console.error('Job status polling error:', error);
      }
    }, 1500); // Her 1.5 saniyede bir kontrol et

    // Component unmount olduğunda temizle
    return () => clearInterval(pollInterval);
  }, [loadSubscribers]);

  // Job'ı iptal et
  const handleCancelJob = async () => {
    if (!currentJobId) return;
    
    if (!confirm('Toplu mail gönderimini iptal etmek istediğinize emin misiniz?')) return;
    
    try {
      const result = await cancelBulkMailJob(currentJobId);
      if (result.success) {
        setSuccess('Toplu mail gönderimi iptal edildi');
      } else {
        setError(result.error || 'İptal başarısız');
      }
    } catch {
      setError('İptal başarısız');
    }
  };

  // İlerleme modalını kapat
  const closeProgressModal = () => {
    setShowProgressModal(false);
    setCurrentJobId(null);
    setJobStatus(null);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
  };

  // Get source label
  const getSourceLabel = (source: SubscriberSource) => {
    switch (source) {
      case 'VERIFICATION': return 'Doğrulama';
      case 'REGISTRATION': return 'Kayıt';
      case 'NEWSLETTER': return 'Bülten';
      case 'MANUAL': return 'Manuel';
      default: return source;
    }
  };

  // Clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.rar"
      />

      {/* Header */}
      <div className="p-3 sm:p-4 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UsersIcon />
              <span className="hidden xs:inline">Toplu Mail</span>
            </h2>
            {stats && (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
                  {stats.active} <span className="hidden sm:inline">Aktif</span>
                </span>
                <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                  {stats.total} <span className="hidden sm:inline">Toplam</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleImport}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg sm:rounded-xl hover:bg-blue-600 text-xs sm:text-sm font-medium transition-colors"
              title="Doğrulama kodlarından import et"
            >
              <ImportIcon />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg sm:rounded-xl hover:bg-green-600 text-xs sm:text-sm font-medium transition-colors"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Abone Ekle</span>
            </button>
            <button
              onClick={() => { loadSubscribers(); loadStats(); }}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className={`mx-4 mt-4 p-4 rounded-xl text-sm font-medium ${
          error 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {error ? '❌ ' : '✓ '}{error || success}
        </div>
      )}

      {/* Filters & Search */}
      <div className="p-3 sm:p-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value as SubscriberSource | '');
                setSubscribersPage(1);
              }}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="">Tüm Kaynaklar</option>
              <option value="VERIFICATION">Doğrulama</option>
              <option value="REGISTRATION">Kayıt</option>
              <option value="NEWSLETTER">Bülten</option>
              <option value="MANUAL">Manuel</option>
            </select>

            <select
              value={activeFilter === undefined ? '' : String(activeFilter)}
              onChange={(e) => {
                setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true');
                setSubscribersPage(1);
              }}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="">Tüm Durumlar</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="E-posta veya isim ara..."
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
            </div>
            <button
              onClick={handleSearch}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-500 text-white rounded-lg sm:rounded-xl hover:bg-indigo-600 transition-all font-medium text-xs sm:text-sm"
            >
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-indigo-50 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-700">
            {selectedIds.size} abone seçildi
          </span>
          <button
            onClick={openComposeModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-sm font-semibold transition-colors"
          >
            <SendIcon />
            Toplu Mail Gönder
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-12 text-center">
          <div className="animate-spin w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      )}

      {/* Subscribers List */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider w-10 sm:w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 sm:w-16">
                  DURUM
                </th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  E-POSTA
                </th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İSİM
                </th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  KAYNAK
                </th>
                <th className="text-center px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GÖNDERİM
                </th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  TARİH
                </th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İŞLEMLER
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <UsersIcon />
                    </div>
                    <p className="text-gray-500 text-sm">Henüz abone yok</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Import veya manuel ekleme yapabilirsiniz</p>
                  </td>
                </tr>
              ) : (
                subscribers.map(subscriber => (
                  <tr
                    key={subscriber.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !subscriber.isActive ? 'opacity-60' : ''
                    } ${selectedIds.has(subscriber.id) ? 'bg-indigo-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(subscriber.id)}
                        onChange={() => handleSelect(subscriber.id)}
                        disabled={!subscriber.isActive}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(subscriber)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          subscriber.isActive 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={subscriber.isActive ? 'Pasif yap' : 'Aktif yap'}
                      >
                        {subscriber.isActive ? '✓' : '✗'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{subscriber.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {subscriber.firstName || subscriber.lastName 
                          ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        subscriber.source === 'VERIFICATION' ? 'bg-blue-100 text-blue-700' :
                        subscriber.source === 'REGISTRATION' ? 'bg-purple-100 text-purple-700' :
                        subscriber.source === 'NEWSLETTER' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getSourceLabel(subscriber.source)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{subscriber.mailCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{formatDate(subscriber.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {subscribersTotalPages > 1 && (
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                {subscribersTotal} abone
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSubscribers(subscribersPage - 1)}
                  disabled={subscribersPage <= 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('previous')}
                </button>
                <span className="text-sm text-gray-700 font-medium px-2">
                  {subscribersPage} / {subscribersTotalPages}
                </span>
                <button
                  onClick={() => loadSubscribers(subscribersPage + 1)}
                  disabled={subscribersPage >= subscribersTotalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== ADD SUBSCRIBER MODAL ========== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-green-500 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <PlusIcon />
                Yeni Abone Ekle
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="ornek@email.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder="Ad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder="Soyad"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddSubscriber}
                disabled={loading || !newEmail.trim()}
                className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold transition-colors disabled:opacity-50"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== COMPOSE BULK MAIL MODAL ========== */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-green-500 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <SendIcon />
                Toplu Mail Gönder ({selectedIds.size} alıcı)
              </h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konu *</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Mail konusu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İçerik *</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                  placeholder="Mail içeriği..."
                />
              </div>

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Ekler</label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <AttachmentIcon />
                    Dosya Ekle
                  </button>
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm"
                      >
                        <span>📎 {att.name}</span>
                        <span className="text-gray-500">({Math.round(att.size / 1024)}KB)</span>
                        <button
                          onClick={() => removeAttachment(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Not:</strong> Mailler kuyruk sistemi ile arka planda gönderilecek. 
                  İlerlemeyi takip edebilirsiniz.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowComposeModal(false)}
                disabled={sending}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleSendBulkMail}
                disabled={sending || !composeSubject.trim() || !composeBody.trim()}
                className="px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kuyruğa Ekleniyor...
                  </>
                ) : (
                  <>
                    <SendIcon />
                    Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`p-4 ${
              jobStatus?.status === 'COMPLETED' ? 'bg-green-500' :
              jobStatus?.status === 'FAILED' ? 'bg-red-500' :
              jobStatus?.status === 'CANCELLED' ? 'bg-gray-500' :
              'bg-purple-500'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  {jobStatus?.status === 'COMPLETED' && '✓ '}
                  {jobStatus?.status === 'FAILED' && '✗ '}
                  {jobStatus?.status === 'CANCELLED' && '⊘ '}
                  {jobStatus?.status === 'PROCESSING' && '⟳ '}
                  Toplu Mail Gönderimi
                </h3>
                {['COMPLETED', 'FAILED', 'CANCELLED'].includes(jobStatus?.status || '') && (
                  <button
                    onClick={closeProgressModal}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <p className="text-sm text-gray-500">Konu</p>
                <p className="font-medium text-gray-900">{jobStatus?.subject || composeSubject}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
                  jobStatus?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  jobStatus?.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                  jobStatus?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  jobStatus?.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {jobStatus?.status === 'PENDING' && '⏳ Beklemede'}
                  {jobStatus?.status === 'PROCESSING' && '⟳ Gönderiliyor'}
                  {jobStatus?.status === 'COMPLETED' && '✓ Tamamlandı'}
                  {jobStatus?.status === 'FAILED' && '✗ Başarısız'}
                  {jobStatus?.status === 'CANCELLED' && '⊘ İptal Edildi'}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">İlerleme</span>
                  <span className="text-sm text-gray-600">
                    {jobStatus?.processedCount || 0} / {jobStatus?.totalRecipients || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      jobStatus?.status === 'COMPLETED' ? 'bg-green-500' :
                      jobStatus?.status === 'FAILED' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${jobStatus?.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              {jobStatus && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{jobStatus.totalRecipients}</p>
                    <p className="text-xs text-gray-500">Toplam</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">{jobStatus.sentCount}</p>
                    <p className="text-xs text-green-600">Başarılı</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-xl text-center">
                    <p className="text-2xl font-bold text-red-600">{jobStatus.failedCount}</p>
                    <p className="text-xs text-red-600">Başarısız</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {jobStatus?.errorMessage && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                  <p className="text-sm text-red-700">{jobStatus.errorMessage}</p>
                </div>
              )}

              {/* Processing animation */}
              {jobStatus?.status === 'PROCESSING' && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-purple-600">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Mailler gönderiliyor...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              {['PENDING', 'PROCESSING'].includes(jobStatus?.status || '') && (
                <button
                  onClick={handleCancelJob}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                >
                  İptal Et
                </button>
              )}
              {['COMPLETED', 'FAILED', 'CANCELLED'].includes(jobStatus?.status || '') && (
                <button
                  onClick={closeProgressModal}
                  className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-semibold transition-colors"
                >
                  Kapat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
