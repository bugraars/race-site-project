'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  getMailInbox,
  getMail,
  sendMail,
  replyMail,
  markMailAsRead,
  deleteMail,
  searchMails,
  getMailFolders,
  getMailHistory,
  testMailConnection,
  getAttachmentDownloadUrl,
  getSentAttachmentDownloadUrl,
  MailSummary,
  MailDetail,
  MailListResult,
  EmailHistory,
  MailHistoryResult,
} from '@/lib/adminApi';

// Icons
const InboxIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const AttachmentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const ReplyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ComposeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

type ViewMode = 'inbox' | 'view' | 'history';

interface MailManagementProps {
  staffId?: number;
  defaultView?: 'inbox' | 'history';
}

interface AttachmentFile {
  file: File;
  name: string;
  size: number;
}

export default function MailManagement({ staffId, defaultView = 'inbox' }: MailManagementProps) {
  const t = useTranslations('AdminDashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Inbox state
  const [mails, setMails] = useState<MailSummary[]>([]);
  const [inboxPage, setInboxPage] = useState(1);
  const [inboxTotal, setInboxTotal] = useState(0);
  const [inboxTotalPages, setInboxTotalPages] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [folders, setFolders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Selected mail state
  const [selectedMail, setSelectedMail] = useState<MailDetail | null>(null);

  // Modal state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMail, setModalMail] = useState<MailDetail | null>(null);
  
  // History detail modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryMail, setSelectedHistoryMail] = useState<EmailHistory | null>(null);

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [replyTo, setReplyTo] = useState<MailDetail | null>(null);
  const [sending, setSending] = useState(false);

  // History state
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [isHistorySearching, setIsHistorySearching] = useState(false);

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Load inbox
  const loadInbox = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMailInbox(page, 20, selectedFolder);
      if (result.success && result.data) {
        // Backend { success, data: MailListResult } döner, fetchAdminApi bunu { success, data: response } yapar
        const apiData = result.data as any;
        const mailData = apiData.data || apiData; // data içinde data varsa al, yoksa direkt kullan
        setMails(mailData.mails || []);
        setInboxTotal(mailData.total || 0);
        setInboxTotalPages(mailData.totalPages || 0);
        setInboxPage(mailData.page || page);
      } else {
        setError(result.error || 'Gelen kutusu yüklenemedi');
      }
    } catch {
      setError('Gelen kutusu yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  // Load folders
  const loadFolders = useCallback(async () => {
    const result = await getMailFolders();
    if (result.success && result.data) {
      const apiData = result.data as any;
      setFolders(apiData.data || apiData || []);
    }
  }, []);

  // Test connection
  const checkConnection = useCallback(async () => {
    setConnectionStatus('checking');
    const result = await testMailConnection();
    if (result.success) {
      const apiData = result.data as any;
      const isConnected = apiData?.success || apiData?.data?.success;
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (defaultView === 'inbox') {
      loadInbox();
      loadFolders();
    }
    checkConnection();
  }, [loadInbox, loadFolders, checkConnection, defaultView]);

  // Update viewMode when defaultView changes
  useEffect(() => {
    setViewMode(defaultView);
  }, [defaultView]);

  // Search mails
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      loadInbox();
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const result = await searchMails(searchQuery, selectedFolder);
      if (result.success && result.data) {
        const apiData = result.data as any;
        setMails(apiData.data || apiData || []);
        setInboxTotal(0);
        setInboxTotalPages(0);
      }
    } catch {
      setError('Arama başarısız');
    } finally {
      setLoading(false);
    }
  };

  // View mail
  const handleViewMail = async (mail: MailSummary) => {
    setLoading(true);
    try {
      const result = await getMail(mail.uid, selectedFolder);
      if (result.success && result.data) {
        const apiData = result.data as any;
        const mailDetail = apiData.data || apiData;
        setModalMail(mailDetail);
        setShowViewModal(true);
        // Mark as read in list
        setMails(prev => prev.map(m => m.uid === mail.uid ? { ...m, isRead: true } : m));
      } else {
        setError('Mail yüklenemedi');
      }
    } catch {
      setError('Mail yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Quick reply from inbox row
  const handleQuickReply = async (e: React.MouseEvent, mail: MailSummary) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const result = await getMail(mail.uid, selectedFolder);
      if (result.success && result.data) {
        const apiData = result.data as any;
        const mailDetail = apiData.data || apiData;
        openReplyModal(mailDetail);
      } else {
        setError('Mail yüklenemedi');
      }
    } catch {
      setError('Mail yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Delete mail
  const handleDeleteMail = async (uid: number) => {
    if (!confirm('Bu maili silmek istediğinize emin misiniz?')) return;

    setLoading(true);
    try {
      const result = await deleteMail(uid, selectedFolder);
      if (result.success) {
        setSuccess('Mail silindi');
        setMails(prev => prev.filter(m => m.uid !== uid));
        setShowViewModal(false);
        setModalMail(null);
      } else {
        setError('Mail silinemedi');
      }
    } catch {
      setError('Mail silinemedi');
    } finally {
      setLoading(false);
    }
  };

  // Open compose modal
  const openComposeModal = () => {
    setComposeTo('');
    setComposeCc('');
    setComposeSubject('');
    setComposeBody('');
    setAttachments([]);
    setReplyTo(null);
    setShowComposeModal(true);
  };

  // Open reply modal
  const openReplyModal = (mail: MailDetail) => {
    setComposeTo(mail.from.address);
    setComposeCc('');
    setComposeSubject(`Re: ${mail.subject.replace(/^Re:\s*/i, '')}`);
    setComposeBody(`\n\n---\n${mail.from.name || mail.from.address} yazdı:\n\n${mail.text || ''}`);
    setAttachments([]);
    setReplyTo(mail);
    setShowViewModal(false);
    setShowReplyModal(true);
  };

  // Close modals
  const closeComposeModal = () => {
    setShowComposeModal(false);
    setComposeTo('');
    setComposeCc('');
    setComposeSubject('');
    setComposeBody('');
    setAttachments([]);
    setReplyTo(null);
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setComposeTo('');
    setComposeCc('');
    setComposeSubject('');
    setComposeBody('');
    setAttachments([]);
    setReplyTo(null);
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments: AttachmentFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Max 10MB per file
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

  // Send mail
  const handleSendMail = async () => {
    if (!composeTo.trim() || !composeSubject.trim()) {
      setError('Alıcı ve konu zorunludur');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Dosya eklerini File array'e dönüştür
      const fileAttachments = attachments.map(a => a.file);
      
      const mailData = {
        to: composeTo,
        cc: composeCc || undefined,
        subject: composeSubject,
        body: composeBody.replace(/\n/g, '<br>'),
        textBody: composeBody,
        staffId,
        attachments: fileAttachments,
      };

      let result;
      if (replyTo) {
        result = await replyMail({
          ...mailData,
          originalUid: replyTo.uid,
          inReplyTo: replyTo.messageId,
          references: replyTo.references,
        });
      } else {
        result = await sendMail(mailData);
      }

      if (result.success) {
        setSuccess('Mail gönderildi');
        closeComposeModal();
        closeReplyModal();
      } else {
        setError(result.error || 'Mail gönderilemedi');
      }
    } catch {
      setError('Mail gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  // Load history
  const loadHistory = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMailHistory(page, 20);
      console.log('History API Result:', result); // Debug
      
      if (result.success && result.data) {
        const apiData = result.data as any;
        // Backend: { success, data: { history, total, ... } }
        // fetchAdminApi returns: { success, data: { success, data: { history, ... } } }
        // So we need to check both levels
        const historyData = apiData.data || apiData;
        
        console.log('History Data:', historyData); // Debug
        
        const historyList = historyData.history || [];
        setHistory(historyList);
        setHistoryTotal(historyData.total || 0);
        setHistoryTotalPages(historyData.totalPages || 0);
        setHistoryPage(historyData.page || page);
      } else {
        setError(result.error || 'Geçmiş yüklenemedi');
      }
    } catch (err) {
      console.error('History load error:', err);
      setError('Geçmiş yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load history on mount if defaultView is history
  useEffect(() => {
    if (defaultView === 'history') {
      loadHistory();
    }
  }, [defaultView, loadHistory]);

  // Switch to history
  const handleShowHistory = () => {
    setViewMode('history');
    loadHistory();
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' });
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
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {viewMode === 'inbox' ? <InboxIcon /> : <HistoryIcon />}
            {viewMode === 'inbox' ? t('mail_inbox') : t('mail_history')}
          </h2>
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
            connectionStatus === 'connected' ? 'bg-green-500 text-white' :
            connectionStatus === 'disconnected' ? 'bg-red-500 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-white' :
              connectionStatus === 'disconnected' ? 'bg-white' :
              'bg-white animate-pulse'
            }`}></span>
            {connectionStatus === 'connected' ? t('mail_connection_ok') : connectionStatus === 'disconnected' ? t('mail_connection_error') : '...'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'inbox' && (
            <>
              <button
                onClick={openComposeModal}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-sm font-semibold transition-colors"
              >
                <ComposeIcon />
                {t('mail_compose')}
              </button>
              <button
                onClick={() => loadInbox(inboxPage)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('mail_refresh')}
              >
                <RefreshIcon />
              </button>
            </>
          )}
          {viewMode === 'history' && (
            <button
              onClick={() => loadHistory(historyPage)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('mail_refresh')}
            >
              <RefreshIcon />
            </button>
          )}
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

      {/* Loading */}
      {loading && (
        <div className="p-12 text-center">
          <div className="animate-spin w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      )}

      {/* Inbox View */}
      {viewMode === 'inbox' && !loading && (
        <div>
          {/* Search & Folder */}
          <div className="p-4 bg-gray-50 border-b flex items-center gap-4">
            <select
              value={selectedFolder}
              onChange={(e) => {
                setSelectedFolder(e.target.value);
                loadInbox(1);
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              {folders.length > 0 ? (
                folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))
              ) : (
                <option value="INBOX">INBOX</option>
              )}
            </select>

            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('mail_search') + '...'}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </span>
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium text-sm"
              >
                {t('search')}
              </button>
              {isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    loadInbox();
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {t('clear_filters')}
                </button>
              )}
            </div>
          </div>

          {/* Compact Mail List */}
          <div className="divide-y divide-gray-100">
            {mails.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <InboxIcon />
                </div>
                <p className="text-gray-500">{t('mail_empty')}</p>
              </div>
            ) : (
              mails.map(mail => (
                <div
                  key={mail.uid}
                  className={`flex items-center gap-2 px-4 py-3 cursor-pointer group transition-all duration-200 ${
                    !mail.isRead 
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500' 
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Unread indicator dot */}
                  <div className="w-2 flex-shrink-0">
                    {!mail.isRead && (
                      <span className="block w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    )}
                  </div>

                  {/* Reply Button - Left */}
                  <button
                    onClick={(e) => handleQuickReply(e, mail)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title={t('mail_reply')}
                  >
                    <ReplyIcon />
                  </button>

                  {/* View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMail(mail);
                    }}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Görüntüle"
                  >
                    <EyeIcon />
                  </button>

                  {/* Mail Content - Clickable */}
                  <div 
                    onClick={() => handleViewMail(mail)}
                    className="flex-1 flex items-center gap-3 min-w-0"
                  >
                    {/* From - Fixed width */}
                    <div className={`w-44 flex-shrink-0 truncate text-sm ${
                      !mail.isRead ? 'font-bold text-indigo-900' : 'text-gray-600 font-medium'
                    }`}>
                      {mail.from.name || mail.from.address}
                    </div>

                    {/* Subject + Snippet */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className={`truncate text-sm ${
                        !mail.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                      }`}>
                        {mail.subject}
                      </span>
                      {mail.snippet && (
                        <span className="text-gray-400 text-sm truncate hidden lg:inline">
                          — {mail.snippet}
                        </span>
                      )}
                    </div>

                    {/* Attachment icon */}
                    {mail.hasAttachments && (
                      <span className="text-amber-500 flex-shrink-0" title={t('mail_attachments')}>
                        <AttachmentIcon />
                      </span>
                    )}

                    {/* Date */}
                    <div className={`text-xs flex-shrink-0 w-20 text-right ${
                      !mail.isRead ? 'text-indigo-600 font-semibold' : 'text-gray-500'
                    }`}>
                      {formatDate(mail.date)}
                    </div>
                  </div>

                  {/* Delete Button - Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMail(mail.uid);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title={t('mail_delete')}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isSearching && inboxTotalPages > 1 && (
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                {inboxTotal} mail
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadInbox(inboxPage - 1)}
                  disabled={inboxPage <= 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('previous')}
                </button>
                <span className="text-sm text-gray-700 font-medium px-2">
                  {inboxPage} / {inboxTotalPages}
                </span>
                <button
                  onClick={() => loadInbox(inboxPage + 1)}
                  disabled={inboxPage >= inboxTotalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History View (Sent Mails) */}
      {viewMode === 'history' && !loading && (
        <div>
          {/* Search Bar - Same style as inbox */}
          <div className="p-4 bg-gray-50 border-b flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (historySearchQuery.trim()) {
                        setIsHistorySearching(true);
                        // Filter history locally
                        const filtered = history.filter(h => 
                          h.toAddress.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                          h.subject.toLowerCase().includes(historySearchQuery.toLowerCase())
                        );
                        setHistory(filtered);
                      } else {
                        setIsHistorySearching(false);
                        loadHistory(1);
                      }
                    }
                  }}
                  placeholder={t('mail_search') + '...'}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </span>
              </div>
              <button
                onClick={() => {
                  if (historySearchQuery.trim()) {
                    setIsHistorySearching(true);
                    loadHistory(1);
                  }
                }}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-medium text-sm"
              >
                {t('search')}
              </button>
              {isHistorySearching && (
                <button
                  onClick={() => {
                    setHistorySearchQuery('');
                    setIsHistorySearching(false);
                    loadHistory(1);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {t('clear_filters')}
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {history.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SendIcon />
                </div>
                <p className="text-gray-500">{t('mail_no_history')}</p>
              </div>
            ) : (
              history.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    setSelectedHistoryMail(item);
                    setShowHistoryModal(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 cursor-pointer group transition-all duration-200 hover:bg-gray-50 border-l-4 ${
                    item.status === 'SENT' ? 'border-l-green-500' :
                    item.status === 'FAILED' ? 'border-l-red-500' :
                    'border-l-yellow-500'
                  }`}
                >
                  {/* Status indicator dot */}
                  <div className="w-2 flex-shrink-0">
                    <span className={`block w-2 h-2 rounded-full ${
                      item.status === 'SENT' ? 'bg-green-500' :
                      item.status === 'FAILED' ? 'bg-red-500' :
                      'bg-yellow-500 animate-pulse'
                    }`}></span>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHistoryMail(item);
                      setShowHistoryModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Görüntüle"
                  >
                    <EyeIcon />
                  </button>

                  {/* Mail Content */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    {/* Status Badge */}
                    <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-semibold ${
                      item.status === 'SENT' ? 'bg-green-100 text-green-700' :
                      item.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status === 'SENT' ? '✓' : item.status === 'FAILED' ? '✗' : '⏳'}
                    </span>

                    {/* Bulk Badge or To Address */}
                    {item.isBulk ? (
                      <div className="w-44 flex-shrink-0 flex items-center gap-1.5">
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-100 text-purple-700">
                          Toplu
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.bulkSent}/{item.bulkTotal} kişi
                        </span>
                      </div>
                    ) : (
                      <div className="w-44 flex-shrink-0 truncate text-sm font-medium text-gray-600">
                        {item.toAddress}
                      </div>
                    )}

                    {/* Subject */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm text-gray-700">
                        {item.subject}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-xs flex-shrink-0 w-20 text-right text-gray-500">
                      {formatDate(item.sentAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isHistorySearching && historyTotalPages > 1 && (
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                {historyTotal} mail
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadHistory(historyPage - 1)}
                  disabled={historyPage <= 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('previous')}
                </button>
                <span className="text-sm text-gray-700 font-medium px-2">
                  {historyPage} / {historyTotalPages}
                </span>
                <button
                  onClick={() => loadHistory(historyPage + 1)}
                  disabled={historyPage >= historyTotalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== VIEW MAIL MODAL ========== */}
      {showViewModal && modalMail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-blue-500 text-white">
              <h3 className="font-semibold truncate pr-4">{modalMail.subject}</h3>
              <button
                onClick={() => { setShowViewModal(false); setModalMail(null); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Mail Info */}
            <div className="flex-shrink-0 px-4 py-3 border-b bg-blue-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-indigo-900">
                    {modalMail.from.name || modalMail.from.address}
                  </div>
                  <div className="text-xs text-indigo-600">{modalMail.from.address}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {t('mail_to')}: {modalMail.to.join(', ')}
                    {modalMail.cc.length > 0 && ` | CC: ${modalMail.cc.join(', ')}`}
                  </div>
                </div>
                <div className="text-xs text-indigo-600 bg-white px-3 py-1.5 rounded-full font-medium">
                  {new Date(modalMail.date).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Mail Body */}
              <div className="p-6">
                {modalMail.html ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: modalMail.html }}
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                    {modalMail.text}
                  </pre>
                )}
              </div>

              {/* Attachments - En altta */}
              {modalMail.attachments.length > 0 && (
                <div className="mx-6 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-600"><AttachmentIcon /></span>
                    <span className="text-sm font-semibold text-amber-800">{t('mail_attachments')} ({modalMail.attachments.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {modalMail.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={getAttachmentDownloadUrl(modalMail.uid, i, selectedFolder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={att.filename}
                        className="text-xs bg-white px-3 py-2 rounded-lg shadow-sm border border-amber-200 text-amber-800 flex items-center gap-2 hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer group"
                      >
                        📎 {att.filename} 
                        <span className="text-amber-500">({Math.round(att.size / 1024)}KB)</span>
                        <svg className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex-shrink-0 flex items-center gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => openReplyModal(modalMail)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-semibold transition-colors"
              >
                <ReplyIcon />
                {t('mail_reply')}
              </button>
              <button
                onClick={() => handleDeleteMail(modalMail.uid)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-semibold shadow-lg shadow-red-200 transition-all"
              >
                <DeleteIcon />
                {t('mail_delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== COMPOSE MAIL MODAL ========== */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-green-500 text-white rounded-t-2xl">
              <h3 className="font-semibold flex items-center gap-2">
                <ComposeIcon />
                {t('mail_compose')}
              </h3>
              <button
                onClick={closeComposeModal}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_to')} *</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_cc')}</label>
                <input
                  type="text"
                  value={composeCc}
                  onChange={(e) => setComposeCc(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="ornek@email.com, diger@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_subject')} *</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Mail konusu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_body')}</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Mail içeriği..."
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_attachments')}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                      <span className="text-emerald-600"><AttachmentIcon /></span>
                      <span className="font-medium text-emerald-800">{att.name}</span>
                      <span className="text-emerald-600">({Math.round(att.size / 1024)}KB)</span>
                      <button
                        onClick={() => removeAttachment(i)}
                        className="ml-1 text-red-500 hover:text-red-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-emerald-300 rounded-xl text-sm text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-medium"
                >
                  <AttachmentIcon />
                  Dosya Ekle
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeComposeModal}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleSendMail}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {sending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <SendIcon />
                    {t('mail_send')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== REPLY MAIL MODAL ========== */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-t-2xl">
              <h3 className="font-semibold flex items-center gap-2">
                <ReplyIcon />
                {t('mail_reply')}
              </h3>
              <button
                onClick={closeReplyModal}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_to')}</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-blue-100 rounded-xl text-sm bg-blue-50/50 text-blue-800 font-medium"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_cc')}</label>
                <input
                  type="text"
                  value={composeCc}
                  onChange={(e) => setComposeCc(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_subject')}</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-blue-100 rounded-xl text-sm bg-blue-50/50 text-blue-800 font-medium"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Yanıtınız</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Yanıtınızı yazın..."
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{t('mail_attachments')}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs">
                      <span className="text-blue-600"><AttachmentIcon /></span>
                      <span className="font-medium text-blue-800">{att.name}</span>
                      <span className="text-blue-600">({Math.round(att.size / 1024)}KB)</span>
                      <button
                        onClick={() => removeAttachment(i)}
                        className="ml-1 text-red-500 hover:text-red-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-sm text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium"
                >
                  <AttachmentIcon />
                  Dosya Ekle
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeReplyModal}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleSendMail}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {sending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <SendIcon />
                    {t('mail_reply')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== HISTORY DETAIL MODAL ========== */}
      {showHistoryModal && selectedHistoryMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header - Inbox ile tutarlı mor gradient */}
            <div className={`flex-shrink-0 ${selectedHistoryMail.isBulk ? 'bg-purple-500' : 'bg-blue-500'} p-4 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-lg">{selectedHistoryMail.subject}</h3>
                  {selectedHistoryMail.isBulk && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white">
                      Toplu Gönderim
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    selectedHistoryMail.status === 'SENT' 
                      ? 'bg-emerald-400 text-white' 
                      : selectedHistoryMail.status === 'FAILED' 
                      ? 'bg-red-400 text-white'
                      : 'bg-amber-400 text-white'
                  }`}>
                    {selectedHistoryMail.status === 'SENT' ? '✓ Gönderildi' : selectedHistoryMail.status === 'FAILED' ? '✗ Başarısız' : '⏳ Beklemede'}
                  </span>
                </div>
                <button
                  onClick={() => { setShowHistoryModal(false); setSelectedHistoryMail(null); }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mail Info Header */}
            <div className={`flex-shrink-0 p-4 ${selectedHistoryMail.isBulk ? 'bg-purple-50' : 'bg-blue-50'} border-b`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Olympos Hard Enduro</p>
                  <p className={`text-sm ${selectedHistoryMail.isBulk ? 'text-purple-600' : 'text-purple-600'}`}>{selectedHistoryMail.fromAddress}</p>
                  {selectedHistoryMail.isBulk ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-700 font-medium">Alıcı Sayısı:</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {selectedHistoryMail.bulkTotal} kişi
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {selectedHistoryMail.bulkSent} başarılı
                        </span>
                        {(selectedHistoryMail.bulkFailed ?? 0) > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            {selectedHistoryMail.bulkFailed} başarısız
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">
                      Alıcı: {selectedHistoryMail.toAddress}
                      {selectedHistoryMail.ccAddress && ` | CC: ${selectedHistoryMail.ccAddress}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-sm ${selectedHistoryMail.isBulk ? 'text-purple-600' : 'text-purple-600'} font-medium`}>
                    {new Date(selectedHistoryMail.sentAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })} {new Date(selectedHistoryMail.sentAt).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                  {selectedHistoryMail.sentBy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Gönderen: {selectedHistoryMail.sentBy.firstName} {selectedHistoryMail.sentBy.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Bulk Recipients List */}
              {selectedHistoryMail.isBulk && selectedHistoryMail.bulkRecipients && (
                <div className="p-5 pb-0">
                  <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-purple-800">Alıcı Listesi</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const recipients = JSON.parse(selectedHistoryMail.bulkRecipients) as {email: string; success: boolean; error?: string}[];
                            return recipients.map((r, i) => (
                              <span 
                                key={i} 
                                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 ${
                                  r.success 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                }`}
                                title={r.error || (r.success ? 'Başarıyla gönderildi' : 'Gönderilemedi')}
                              >
                                {r.success ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                {r.email}
                              </span>
                            ));
                          } catch {
                            return <span className="text-xs text-gray-500">Alıcı listesi yüklenemedi</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mail Content - cid: referanslarını temizle */}
              <div className="p-5">
                <div 
                  className="prose prose-sm max-w-none bg-gray-50 rounded-xl p-6 border border-gray-200"
                  dangerouslySetInnerHTML={{ 
                    __html: (() => {
                      let content = selectedHistoryMail.htmlBody || selectedHistoryMail.textBody?.replace(/\n/g, '<br>') || '<em class="text-gray-400">İçerik yok</em>';
                      // cid: referanslarını logo URL'si ile değiştir
                      content = content.replace(/src="cid:[^"]*"/g, 'src="https://olymposhardenduro.com/img/logo.png"');
                      return content;
                    })()
                  }}
                />

                {/* Error Message if failed */}
                {selectedHistoryMail.status === 'FAILED' && selectedHistoryMail.errorMsg && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <label className="text-xs text-red-500 uppercase tracking-wider font-medium block mb-1">Hata Detayı</label>
                    <p className="text-red-700 font-medium">{selectedHistoryMail.errorMsg}</p>
                  </div>
                )}

                {/* Attachments - En altta */}
                {selectedHistoryMail.attachments && (() => {
                  try {
                    const attachmentList = JSON.parse(selectedHistoryMail.attachments);
                    if (attachmentList && attachmentList.length > 0) {
                      return (
                        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-amber-600"><AttachmentIcon /></span>
                            <span className="text-sm font-semibold text-amber-800">{t('mail_attachments')} ({attachmentList.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {attachmentList.map((att: {filename: string, size: number, dir?: string, storedName?: string}, i: number) => (
                              att.dir ? (
                                <a
                                  key={i}
                                  href={getSentAttachmentDownloadUrl(selectedHistoryMail.id, att.filename)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={att.filename}
                                  className="text-xs bg-white px-3 py-2 rounded-lg shadow-sm border border-amber-200 text-amber-800 flex items-center gap-2 hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer group"
                                >
                                  📎 {att.filename} 
                                  <span className="text-amber-500">({Math.round(att.size / 1024)}KB)</span>
                                  <svg className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                              ) : (
                                <span key={i} className="text-xs bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-600 flex items-center gap-2">
                                  📎 {att.filename} <span className="text-gray-400">({Math.round(att.size / 1024)}KB)</span>
                                  <span className="text-gray-400 text-[10px]">(eski)</span>
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {}
                  return null;
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => { setShowHistoryModal(false); setSelectedHistoryMail(null); }}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 text-sm font-medium transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
