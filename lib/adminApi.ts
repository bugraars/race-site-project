/**
 * Admin API Client
 * Portfolio (Next.js) → Core/Server (Node.js) Admin bağlantısı
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Generic authenticated API fetch wrapper
 */
async function fetchAdminApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Bir hata oluştu',
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error('Admin API Error:', error);
    return {
      success: false,
      error: 'Sunucuya bağlanılamadı',
    };
  }
}

// ==================== STAFF TYPES ====================

export interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  staffCode: string;
}

// ==================== EVENT TYPES ====================

export interface Event {
  id: number;
  name: string;
  date: string;
  isActive: boolean;
  checkpoints?: Checkpoint[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventData {
  name: string;
  date: string;
  isActive?: boolean;
  createDefaultCheckpoints?: boolean;
  checkpointCount?: number;
}

export interface UpdateEventData {
  name?: string;
  date?: string;
  isActive?: boolean;
}

// ==================== CHECKPOINT TYPES ====================

export interface Checkpoint {
  id: number;
  code: string;
  name: string;
  orderIndex: number;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null;
  eventId: number;
  event?: {
    id: number;
    name: string;
    isActive: boolean;
  };
  staffMembers?: StaffMember[];
  createdAt?: string;
}

export interface Staff {
  id: number;
  staffCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  checkpointId?: number | null;
  checkpoint?: Checkpoint | null;
  createdAt: string;
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  pin: string;
  role?: 'ADMIN' | 'STAFF';
  phone?: string;
  email?: string;
  checkpointId?: number;
}

// ==================== STAFF API ====================

/**
 * Tüm staff listesini getir
 */
export async function getStaffList(): Promise<ApiResponse<Staff[]>> {
  return fetchAdminApi<Staff[]>('/auth/staff');
}

/**
 * Yeni staff oluştur
 */
export async function createStaff(data: CreateStaffData): Promise<ApiResponse<Staff>> {
  return fetchAdminApi<Staff>('/auth/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Staff rolünü güncelle
 */
export async function updateStaffRole(staffId: number, role: 'ADMIN' | 'STAFF'): Promise<ApiResponse<Staff>> {
  return fetchAdminApi<Staff>(`/auth/staff/${staffId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

/**
 * Staff bilgilerini güncelle
 */
export interface UpdateStaffData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export async function updateStaff(staffId: number, data: UpdateStaffData): Promise<ApiResponse<Staff>> {
  return fetchAdminApi<Staff>(`/auth/staff/${staffId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Staff aktif/pasif durumunu değiştir
 */
export async function toggleStaffActive(staffId: number, isActive: boolean): Promise<ApiResponse<{ message: string; staff: Staff }>> {
  return fetchAdminApi<{ message: string; staff: Staff }>(`/auth/staff/${staffId}/toggle`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });
}

/**
 * Staff checkpoint ataması
 */
export async function assignStaffCheckpoint(staffId: number, checkpointId: number | null): Promise<ApiResponse<{ message: string; staff: Staff }>> {
  return fetchAdminApi<{ message: string; staff: Staff }>(`/auth/staff/${staffId}/checkpoint`, {
    method: 'PUT',
    body: JSON.stringify({ checkpointId }),
  });
}

/**
 * Staff sil
 */
export async function deleteStaff(staffId: number): Promise<ApiResponse<{ message: string }>> {
  return fetchAdminApi<{ message: string }>(`/auth/staff/${staffId}`, {
    method: 'DELETE',
  });
}

/**
 * PIN değiştir
 */
export async function changeStaffPin(staffId: number, newPin: string): Promise<ApiResponse<{ message: string }>> {
  return fetchAdminApi<{ message: string }>(`/auth/staff/${staffId}/pin`, {
    method: 'PUT',
    body: JSON.stringify({ newPin }),
  });
}

// ==================== LOG TYPES ====================

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
export type LogCategory = 'AUTH' | 'NFC_SCAN' | 'SYNC' | 'API' | 'SYSTEM' | 'ERROR';

export interface Log {
  id: number;
  traceId: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  message: string;
  staffId?: number | null;
  racerId?: number | null;
  checkpointId?: number | null;
  metadata?: Record<string, any> | null;
  errorStack?: string | null;
  duration?: number | null;
  createdAt: string;
  staff?: { staffCode: string; firstName: string; lastName: string } | null;
  racer?: { bibNumber: string; firstName: string; lastName: string } | null;
  checkpoint?: { name: string } | null;
}

export interface LogFilter {
  traceId?: string;
  level?: LogLevel;
  category?: LogCategory;
  action?: string;
  staffId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface LogsResponse {
  logs: Log[];
  total: number;
}

// ==================== LOG API ====================

/**
 * Logları listele (pagination + filter)
 */
export async function getLogs(filter: LogFilter): Promise<ApiResponse<LogsResponse>> {
  const params = new URLSearchParams();
  
  if (filter.traceId) params.append('traceId', filter.traceId);
  if (filter.level) params.append('level', filter.level);
  if (filter.category) params.append('category', filter.category);
  if (filter.action) params.append('action', filter.action);
  if (filter.staffId) params.append('staffId', filter.staffId.toString());
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.limit) params.append('limit', filter.limit.toString());
  if (filter.offset) params.append('offset', filter.offset.toString());
  
  return fetchAdminApi<LogsResponse>(`/logs?${params.toString()}`);
}

/**
 * TraceID ile log zincirini getir
 */
export async function getLogsByTraceId(traceId: string): Promise<ApiResponse<Log[]>> {
  return fetchAdminApi<Log[]>(`/logs/trace/${traceId}`);
}

/**
 * Log istatistiklerini getir
 */
export async function getLogStats(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return fetchAdminApi<any>(`/logs/stats?${params.toString()}`);
}

/**
 * Aktif event bilgisini getir
 */
export async function getActiveEvent(): Promise<ApiResponse<Event>> {
  return fetchAdminApi<Event>('/events/active');
}

// ==================== EVENT API ====================

/**
 * Tüm event listesini getir
 */
export async function getEvents(): Promise<ApiResponse<Event[]>> {
  return fetchAdminApi<Event[]>('/events');
}

/**
 * Event detayını getir
 */
export async function getEventById(id: number): Promise<ApiResponse<Event>> {
  return fetchAdminApi<Event>(`/events/${id}`);
}

/**
 * Yeni event oluştur
 */
export async function createEvent(data: CreateEventData): Promise<ApiResponse<Event>> {
  return fetchAdminApi<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Event güncelle
 */
export async function updateEvent(id: number, data: UpdateEventData): Promise<ApiResponse<Event>> {
  return fetchAdminApi<Event>(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Event sil
 */
export async function deleteEvent(id: number): Promise<ApiResponse<{ message: string }>> {
  return fetchAdminApi<{ message: string }>(`/events/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Event'i aktif yap
 */
export async function setActiveEvent(id: number): Promise<ApiResponse<Event>> {
  return fetchAdminApi<Event>(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ isActive: true }),
  });
}

/**
 * Event'e ait checkpoint'leri getir
 */
export async function getEventCheckpoints(eventId: number): Promise<ApiResponse<Checkpoint[]>> {
  return fetchAdminApi<Checkpoint[]>(`/events/${eventId}/checkpoints`);
}

// ==================== MAIL TYPES ====================

export interface MailSummary {
  uid: number;
  messageId: string;
  subject: string;
  from: {
    name: string;
    address: string;
  };
  to: string[];
  date: string;
  isRead: boolean;
  hasAttachments: boolean;
  snippet: string;
}

export interface MailDetail extends MailSummary {
  html: string | null;
  text: string | null;
  cc: string[];
  inReplyTo: string | null;
  references: string[];
  attachments: {
    filename: string;
    contentType: string;
    size: number;
  }[];
}

export interface MailListResult {
  mails: MailSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmailHistory {
  id: number;
  messageId: string;
  inReplyTo?: string | null;
  fromAddress: string;
  toAddress: string;
  ccAddress?: string | null;
  bccAddress?: string | null;
  subject: string;
  htmlBody?: string | null;
  textBody?: string | null;
  attachments?: string | null;  // JSON: [{filename, size}]
  status: 'SENT' | 'FAILED' | 'PENDING';
  errorMsg?: string | null;
  sentAt: string;
  sentBy?: {
    id: number;
    staffCode: string;
    firstName?: string;
    lastName?: string;
  } | null;
  // Bulk mail fields
  isBulk?: boolean;
  bulkRecipients?: string | null;  // JSON: [{email, success, error?}]
  bulkTotal?: number | null;
  bulkSent?: number | null;
  bulkFailed?: number | null;
}

export interface MailHistoryResult {
  history: EmailHistory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SendMailData {
  to: string;
  cc?: string;
  subject: string;
  body: string;        // HTML veya plain text içerik
  htmlBody?: string;   // Opsiyonel HTML içerik
  textBody?: string;
  staffId?: number;
  attachments?: File[];  // Dosya ekleri
}

export interface ReplyMailData extends SendMailData {
  originalUid?: number;
  inReplyTo?: string;
  references?: string[];
}

// ==================== MAIL API ====================

/**
 * Mail gelen kutusunu listele
 */
export async function getMailInbox(page: number = 1, pageSize: number = 20, folder: string = 'INBOX'): Promise<ApiResponse<MailListResult>> {
  return fetchAdminApi<MailListResult>(`/mail/inbox?page=${page}&pageSize=${pageSize}&folder=${encodeURIComponent(folder)}`);
}

/**
 * Tek bir maili getir
 */
export async function getMail(uid: number, folder: string = 'INBOX'): Promise<ApiResponse<MailDetail>> {
  return fetchAdminApi<MailDetail>(`/mail/message/${uid}?folder=${encodeURIComponent(folder)}`);
}

/**
 * Attachment indir (gelen mailler için)
 */
export function getAttachmentDownloadUrl(uid: number, attachmentIndex: number, folder: string = 'INBOX'): string {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  return `${API_BASE_URL}/mail/attachment/${uid}/${attachmentIndex}?folder=${encodeURIComponent(folder)}`;
}

/**
 * Gönderilen mailin attachment'ını indir
 */
export function getSentAttachmentDownloadUrl(historyId: number, filename: string): string {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  return `${API_BASE_URL}/mail/sent-attachment/${historyId}/${encodeURIComponent(filename)}`;
}

/**
 * Yeni mail gönder (FormData ile attachment destekli)
 */
export async function sendMail(data: SendMailData): Promise<ApiResponse<{ messageId: string; historyId: number }>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  
  try {
    const formData = new FormData();
    formData.append('to', data.to);
    if (data.cc) formData.append('cc', data.cc);
    formData.append('subject', data.subject);
    formData.append('body', data.body);
    if (data.htmlBody) formData.append('htmlBody', data.htmlBody);
    if (data.textBody) formData.append('textBody', data.textBody);
    if (data.staffId) formData.append('staffId', data.staffId.toString());
    
    // Dosya eklerini ekle
    if (data.attachments && data.attachments.length > 0) {
      for (const file of data.attachments) {
        formData.append('attachments', file);
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/mail/send`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        // Content-Type header'ı FormData için otomatik ayarlanır
      },
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.message || result.error || 'Mail gönderilemedi' };
    }
    
    return { success: true, data: result.data || result };
  } catch (error) {
    console.error('Send mail error:', error);
    return { success: false, error: 'Mail gönderilemedi' };
  }
}

/**
 * Maile yanıt gönder (FormData ile attachment destekli)
 */
export async function replyMail(data: ReplyMailData): Promise<ApiResponse<{ messageId: string; historyId: number }>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  
  try {
    const formData = new FormData();
    formData.append('to', data.to);
    if (data.cc) formData.append('cc', data.cc);
    formData.append('subject', data.subject);
    formData.append('body', data.body);
    if (data.htmlBody) formData.append('htmlBody', data.htmlBody);
    if (data.textBody) formData.append('textBody', data.textBody);
    if (data.staffId) formData.append('staffId', data.staffId.toString());
    if (data.originalUid) formData.append('originalUid', data.originalUid.toString());
    if (data.inReplyTo) formData.append('inReplyTo', data.inReplyTo);
    if (data.references) formData.append('references', JSON.stringify(data.references));
    
    // Dosya eklerini ekle
    if (data.attachments && data.attachments.length > 0) {
      for (const file of data.attachments) {
        formData.append('attachments', file);
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/mail/reply`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.message || result.error || 'Mail gönderilemedi' };
    }
    
    return { success: true, data: result.data || result };
  } catch (error) {
    console.error('Reply mail error:', error);
    return { success: false, error: 'Mail gönderilemedi' };
  }
}

/**
 * Maili okundu/okunmadı işaretle
 */
export async function markMailAsRead(uid: number, read: boolean = true, folder: string = 'INBOX'): Promise<ApiResponse<{ success: boolean }>> {
  return fetchAdminApi<{ success: boolean }>('/mail/mark-read', {
    method: 'POST',
    body: JSON.stringify({ uid, read, folder }),
  });
}

/**
 * Maili sil
 */
export async function deleteMail(uid: number, folder: string = 'INBOX'): Promise<ApiResponse<{ success: boolean }>> {
  return fetchAdminApi<{ success: boolean }>(`/mail/message/${uid}?folder=${encodeURIComponent(folder)}`, {
    method: 'DELETE',
  });
}

/**
 * Mail ara
 */
export async function searchMails(query: string, folder: string = 'INBOX', limit: number = 50): Promise<ApiResponse<MailSummary[]>> {
  return fetchAdminApi<MailSummary[]>(`/mail/search?q=${encodeURIComponent(query)}&folder=${encodeURIComponent(folder)}&limit=${limit}`);
}

/**
 * Mail klasörlerini getir
 */
export async function getMailFolders(): Promise<ApiResponse<string[]>> {
  return fetchAdminApi<string[]>('/mail/folders');
}

/**
 * Gönderim geçmişini getir
 */
export async function getMailHistory(page: number = 1, pageSize: number = 20, status?: string): Promise<ApiResponse<MailHistoryResult>> {
  let url = `/mail/history?page=${page}&pageSize=${pageSize}`;
  if (status) url += `&status=${status}`;
  return fetchAdminApi<MailHistoryResult>(url);
}

/**
 * Gmail bağlantı testi
 */
export async function testMailConnection(): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return fetchAdminApi<{ success: boolean; message: string }>('/mail/test-connection');
}

// ==================== RACER TYPES ====================

export interface Racer {
  id: number;
  bibNumber: string | null;
  email: string;
  firstName: string;
  lastName: string;
  nationality: string | null;
  bloodType: string | null;
  phone: string | null;
  emergencyPhone: string | null;
  idNumber: string | null;
  birthDate: string | null;
  tshirtSize: string | null;
  paymentMethod: string | null;
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  nfcTagsWritten: number;
  createdAt: string;
  updatedAt: string;
}

export interface RacerStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  withBibNumber: number;
  withoutBibNumber: number;
  totalNfcTags: number;
}

export interface CreateRacerData {
  email: string;
  firstName: string;
  lastName: string;
  bibNumber?: string;
  nationality?: string;
  bloodType?: string;
  phone?: string;
  emergencyPhone?: string;
  idNumber?: string;
  birthDate?: string;
  tshirtSize?: string;
  paymentStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface UpdateRacerData {
  email?: string;
  firstName?: string;
  lastName?: string;
  bibNumber?: string;
  nationality?: string;
  bloodType?: string;
  phone?: string;
  emergencyPhone?: string;
  idNumber?: string;
  birthDate?: string;
  tshirtSize?: string;
  paymentStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

// ==================== RACER API FUNCTIONS ====================

/**
 * Tüm yarışçıları getir
 */
export async function getRacers(): Promise<ApiResponse<Racer[]>> {
  return fetchAdminApi<Racer[]>('/racers');
}

/**
 * Yarışçı istatistiklerini getir
 */
export async function getRacerStats(): Promise<ApiResponse<RacerStats>> {
  return fetchAdminApi<RacerStats>('/racers/stats');
}

/**
 * Onay bekleyen yarışçıları getir
 */
export async function getPendingRacers(): Promise<ApiResponse<Racer[]>> {
  return fetchAdminApi<Racer[]>('/racers/pending');
}

/**
 * Onaylanmış yarışçıları getir
 */
export async function getConfirmedRacers(): Promise<ApiResponse<Racer[]>> {
  return fetchAdminApi<Racer[]>('/racers/confirmed');
}

/**
 * Ödeme durumuna göre yarışçıları getir
 */
export async function getRacersByStatus(status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<ApiResponse<Racer[]>> {
  return fetchAdminApi<Racer[]>(`/racers/by-status/${status}`);
}

/**
 * Yarışçı detayını getir
 */
export async function getRacerById(id: number): Promise<ApiResponse<Racer>> {
  return fetchAdminApi<Racer>(`/racers/${id}`);
}

/**
 * Bib numarası ile yarışçı bul
 */
export async function getRacerByBib(bibNumber: string): Promise<ApiResponse<Racer>> {
  return fetchAdminApi<Racer>(`/racers/bib/${bibNumber}`);
}

/**
 * Yeni yarışçı ekle (Admin)
 */
export async function createRacer(data: CreateRacerData): Promise<ApiResponse<Racer>> {
  return fetchAdminApi<Racer>('/racers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Yarışçıyı güncelle
 */
export async function updateRacer(id: number, data: UpdateRacerData): Promise<ApiResponse<Racer>> {
  return fetchAdminApi<Racer>(`/racers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Yarışçıyı sil
 */
export async function deleteRacer(id: number): Promise<ApiResponse<{ message: string }>> {
  return fetchAdminApi<{ message: string }>(`/racers/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Ödeme durumunu güncelle
 */
export async function updateRacerPaymentStatus(id: number, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<ApiResponse<{ message: string; racer: Racer }>> {
  return fetchAdminApi<{ message: string; racer: Racer }>(`/racers/${id}/payment-status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Bib numarası ata
 */
export async function assignBibNumber(id: number, bibNumber: string): Promise<ApiResponse<{ message: string; racer: Racer }>> {
  return fetchAdminApi<{ message: string; racer: Racer }>(`/racers/${id}/assign-bib`, {
    method: 'PUT',
    body: JSON.stringify({ bibNumber }),
  });
}

/**
 * Müsait bib numaralarını getir
 */
export async function getAvailableBibNumbers(): Promise<ApiResponse<string[]>> {
  return fetchAdminApi<string[]>('/racers/available-bib-numbers');
}

// ==================== MAIL SUBSCRIBER TYPES ====================

export type SubscriberSource = 'VERIFICATION' | 'REGISTRATION' | 'NEWSLETTER' | 'MANUAL';

export interface MailSubscriber {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source: SubscriberSource;
  isActive: boolean;
  lastMailAt?: string;
  mailCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberStats {
  total: number;
  active: number;
  inactive: number;
  bySource: Record<SubscriberSource, number>;
}

// ==================== MAIL SUBSCRIBER API FUNCTIONS ====================

/**
 * Aboneleri getir
 */
export async function getSubscribers(
  page: number = 1, 
  pageSize: number = 50, 
  search?: string, 
  source?: SubscriberSource,
  isActive?: boolean
): Promise<ApiResponse<{ subscribers: MailSubscriber[]; total: number; page: number; totalPages: number }>> {
  const params = new URLSearchParams({ 
    page: String(page), 
    pageSize: String(pageSize) 
  });
  if (search) params.append('search', search);
  if (source) params.append('source', source);
  if (isActive !== undefined) params.append('isActive', String(isActive));
  
  return fetchAdminApi(`/mail/subscribers?${params}`);
}

/**
 * Abone istatistiklerini getir
 */
export async function getSubscriberStats(): Promise<ApiResponse<SubscriberStats>> {
  return fetchAdminApi<SubscriberStats>('/mail/subscribers/stats');
}

/**
 * Yeni abone ekle
 */
export async function createSubscriber(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: SubscriberSource;
}): Promise<ApiResponse<MailSubscriber>> {
  return fetchAdminApi<MailSubscriber>('/mail/subscribers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Aboneyi sil
 */
export async function deleteSubscriber(id: number): Promise<ApiResponse<void>> {
  return fetchAdminApi<void>(`/mail/subscribers/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Abone durumunu değiştir
 */
export async function toggleSubscriber(id: number, isActive: boolean): Promise<ApiResponse<MailSubscriber>> {
  return fetchAdminApi<MailSubscriber>(`/mail/subscribers/${id}/toggle`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });
}

/**
 * Doğrulama kodlarından aboneleri import et
 */
export async function importSubscribersFromVerifications(): Promise<ApiResponse<{ total: number; imported: number; skipped: number }>> {
  return fetchAdminApi('/mail/import-from-verifications', {
    method: 'POST',
  });
}

// ==================== BULK MAIL JOB TYPES ====================

export interface BulkMailJobStatus {
  id: number;
  subject: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalRecipients: number;
  processedCount: number;
  sentCount: number;
  failedCount: number;
  progress: number;
  results?: { email: string; success: boolean; error?: string; sentAt?: string }[] | null;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  createdBy?: {
    id: number;
    staffCode: string;
    firstName?: string;
    lastName?: string;
  } | null;
  emailHistoryId?: number | null;
}

export interface BulkMailJobListResult {
  jobs: Omit<BulkMailJobStatus, 'results'>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Toplu mail gönder (Kuyruk mekanizması ile)
 * Hemen döner, arka planda gönderim yapılır
 */
export async function sendBulkMail(data: {
  subject: string;
  body: string;
  textBody?: string;
  subscriberIds: number[];
  staffId?: number;
  attachments?: File[];
}): Promise<ApiResponse<{ jobId: number; totalRecipients: number; message: string }>> {
  const formData = new FormData();
  formData.append('subject', data.subject);
  formData.append('body', data.body);
  if (data.textBody) formData.append('textBody', data.textBody);
  formData.append('subscriberIds', JSON.stringify(data.subscriberIds));
  if (data.staffId) formData.append('staffId', String(data.staffId));
  
  if (data.attachments) {
    data.attachments.forEach(file => {
      formData.append('attachments', file);
    });
  }
  
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const response = await fetch(`${API_BASE_URL}/mail/bulk-send`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Toplu mail kuyruğa eklenemedi' };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Bulk mail error:', error);
    return { success: false, error: 'Sunucuya bağlanılamadı' };
  }
}

/**
 * Bulk mail job durumunu getir
 */
export async function getBulkMailJobStatus(jobId: number): Promise<ApiResponse<BulkMailJobStatus>> {
  return fetchAdminApi<BulkMailJobStatus>(`/mail/bulk-job/${jobId}`);
}

/**
 * Tüm bulk mail job'larını listele
 */
export async function listBulkMailJobs(page: number = 1, pageSize: number = 20): Promise<ApiResponse<BulkMailJobListResult>> {
  return fetchAdminApi<BulkMailJobListResult>(`/mail/bulk-jobs?page=${page}&pageSize=${pageSize}`);
}

/**
 * Bulk mail job'ı iptal et
 */
export async function cancelBulkMailJob(jobId: number): Promise<ApiResponse<{ message: string }>> {
  return fetchAdminApi<{ message: string }>(`/mail/bulk-job/${jobId}/cancel`, {
    method: 'POST',
  });
}

/**
 * Otomatik yanıt maili gönder
 */
export async function sendAutoReply(data: {
  to: string;
  originalSubject: string;
  senderName?: string;
  staffId?: number;
}): Promise<ApiResponse<{ messageId: string; to: string; subject: string }>> {
  return fetchAdminApi('/mail/auto-reply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== MAIL TEMPLATES ====================

export interface TemplateVariable {
  name: string;
  type: string;
  description: string;
  required: boolean;
  example: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'notification' | 'marketing';
  variableCount?: number;
  variables?: TemplateVariable[];
  previewData?: Record<string, any>;
}

export interface TemplatePreview {
  id: string;
  name: string;
  html: string;
  variables: TemplateVariable[];
  previewData: Record<string, any>;
}

/**
 * Tüm template'leri listele
 */
export async function getMailTemplates(): Promise<ApiResponse<TemplateInfo[]>> {
  return fetchAdminApi<TemplateInfo[]>('/templates');
}

/**
 * Tek bir template'in detayını getir
 */
export async function getMailTemplate(id: string): Promise<ApiResponse<TemplateInfo>> {
  return fetchAdminApi<TemplateInfo>(`/templates/${id}`);
}

/**
 * Template preview'ını getir
 */
export async function getMailTemplatePreview(id: string): Promise<ApiResponse<TemplatePreview>> {
  return fetchAdminApi<TemplatePreview>(`/templates/${id}/preview`);
}

/**
 * Custom data ile template preview oluştur
 */
export async function generateMailTemplatePreview(id: string, data: Record<string, any>): Promise<ApiResponse<{ id: string; name: string; html: string; usedData: Record<string, any> }>> {
  return fetchAdminApi(`/templates/${id}/preview`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== ROUTE TYPES ====================

export interface Route {
  id: number;
  eventId: number;
  event?: Event;
  name: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
  routePoints?: RoutePoint[];
  _count?: { routePoints: number };
  createdAt: string;
  updatedAt: string;
}

export interface RoutePoint {
  id: number;
  routeId: number;
  route?: { id: number; name: string };
  orderIndex: number;
  longitude: number;
  latitude: number;
  elevation: string;
  difficulty: number;
  imageUrl: string | null;
  title: string; // JSON string
  description: string; // JSON string
  isCheckpoint: boolean;
  checkpointCode: string | null;
  checkpointOrder: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteCreate {
  eventId: number;
  name: string;
  description?: string;
  orderIndex?: number;
}

export interface RouteUpdate {
  name?: string;
  description?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface RoutePointCreate {
  routeId: number;
  orderIndex?: number;
  longitude: number;
  latitude: number;
  elevation: string;
  difficulty?: number;
  imageUrl?: string;
  title: { tr: string; en: string; de: string; ru: string };
  description: { tr: string; en: string; de: string; ru: string };
  isCheckpoint?: boolean;
  checkpointCode?: string;
  checkpointOrder?: number;
}

export interface RoutePointUpdate {
  orderIndex?: number;
  longitude?: number;
  latitude?: number;
  elevation?: string;
  difficulty?: number;
  imageUrl?: string | null;
  title?: { tr: string; en: string; de: string; ru: string };
  description?: { tr: string; en: string; de: string; ru: string };
  isCheckpoint?: boolean;
  checkpointCode?: string;
  checkpointOrder?: number;
  isActive?: boolean;
}

// ==================== ROUTE API ====================

/**
 * Tüm rotaları getir (event'e göre filtreleme opsiyonel)
 */
export async function getRoutes(eventId?: number): Promise<ApiResponse<Route[]>> {
  const query = eventId ? `?eventId=${eventId}` : '';
  return fetchAdminApi<Route[]>(`/route/admin/routes${query}`);
}

/**
 * Tek rota detayı (noktalarıyla birlikte)
 */
export async function getRoute(id: number): Promise<ApiResponse<Route>> {
  return fetchAdminApi<Route>(`/route/admin/routes/${id}`);
}

/**
 * Yeni rota oluştur
 */
export async function createRoute(data: RouteCreate): Promise<ApiResponse<Route>> {
  return fetchAdminApi<Route>('/route/admin/routes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Rota güncelle
 */
export async function updateRoute(id: number, data: RouteUpdate): Promise<ApiResponse<Route>> {
  return fetchAdminApi<Route>(`/route/admin/routes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Rota sil
 */
export async function deleteRoute(id: number): Promise<ApiResponse<void>> {
  return fetchAdminApi<void>(`/route/admin/routes/${id}`, {
    method: 'DELETE',
  });
}

// ==================== ROUTE POINT API ====================

/**
 * Rotaya ait noktaları getir
 */
export async function getRoutePoints(routeId: number): Promise<ApiResponse<RoutePoint[]>> {
  return fetchAdminApi<RoutePoint[]>(`/route/admin/points?routeId=${routeId}`);
}

/**
 * Yeni rota noktası oluştur
 */
export async function createRoutePoint(data: RoutePointCreate): Promise<ApiResponse<RoutePoint>> {
  return fetchAdminApi<RoutePoint>('/route/admin/points', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Rota noktası güncelle
 */
export async function updateRoutePoint(id: number, data: RoutePointUpdate): Promise<ApiResponse<RoutePoint>> {
  return fetchAdminApi<RoutePoint>(`/route/admin/points/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Rota noktası sil
 */
export async function deleteRoutePoint(id: number): Promise<ApiResponse<void>> {
  return fetchAdminApi<void>(`/route/admin/points/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Rota noktası sıralamasını güncelle
 */
export async function reorderRoutePoints(orders: { id: number; orderIndex: number }[]): Promise<ApiResponse<void>> {
  return fetchAdminApi<void>('/route/admin/points/reorder', {
    method: 'POST',
    body: JSON.stringify({ orders }),
  });
}

/**
 * Event'e ait checkpoint'leri getir (staff atama için)
 */
export async function getRouteCheckpointsByEvent(eventId: number): Promise<ApiResponse<RoutePoint[]>> {
  return fetchAdminApi<RoutePoint[]>(`/route/admin/checkpoints?eventId=${eventId}`);
}

/**
 * Görsel yükle
 */
export async function uploadRouteImage(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/route/admin/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Görsel yüklenemedi' };
    }

    return { success: true, data: { url: data.url, filename: data.filename } };
  } catch (error) {
    return { success: false, error: 'Görsel yükleme hatası' };
  }
}