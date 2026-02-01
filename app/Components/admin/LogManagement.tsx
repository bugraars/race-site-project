'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Log,
  LogFilter,
  LogLevel,
  LogCategory,
  getLogs,
  getLogsByTraceId
} from '@/lib/adminApi';

interface LogManagementProps {
  onError?: (message: string) => void;
  defaultCategory?: LogCategory;
}

const LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
const LOG_CATEGORIES: LogCategory[] = ['AUTH', 'NFC_SCAN', 'SYNC', 'API', 'SYSTEM', 'ERROR'];

// Yaygın action tipleri
const LOG_ACTIONS: string[] = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'ADMIN_LOGIN_EMAIL_SENT',
  'API_REQUEST',
  'TOKEN_VALIDATE',
  'STAFF_CREATE',
  'STAFF_UPDATE',
  'RACER_CREATE',
  'RACER_UPDATE',
  'NFC_SCAN',
  'SYNC_PRERACE',
  'SYNC_RACE',
  'EMAIL_SENT',
  'EMAIL_FAILED',
];

const LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: 'bg-gray-100 text-gray-600',
  INFO: 'bg-blue-100 text-blue-700',
  WARN: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-red-100 text-red-700',
  FATAL: 'bg-red-200 text-red-800'
};

const CATEGORY_COLORS: Record<LogCategory, string> = {
  AUTH: 'bg-purple-100 text-purple-700',
  NFC_SCAN: 'bg-green-100 text-green-700',
  SYNC: 'bg-cyan-100 text-cyan-700',
  API: 'bg-indigo-100 text-indigo-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
  ERROR: 'bg-red-100 text-red-700'
};

export default function LogManagement({ onError, defaultCategory }: LogManagementProps) {
  const t = useTranslations('AdminDashboard');
  
  // State
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  
  // Filter state
  const [traceIdFilter, setTraceIdFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | ''>(defaultCategory || '');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);
  
  // TraceID detail modal
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [traceIdLogs, setTraceIdLogs] = useState<Log[]>([]);
  const [traceIdLoading, setTraceIdLoading] = useState(false);

  // Load logs
  const loadLogs = async (resetPage = false, clearFilters = false) => {
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    
    setLoading(true);
    try {
      const filter: LogFilter = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize
      };
      
      // clearFilters true ise filtreleri uygulamıyoruz, sadece defaultCategory varsa onu kullan
      if (!clearFilters) {
        if (levelFilter) filter.level = levelFilter;
        if (categoryFilter) filter.category = categoryFilter;
        if (actionFilter) filter.action = actionFilter;
        if (startDate) filter.startDate = new Date(startDate).toISOString();
        if (endDate) filter.endDate = new Date(endDate + 'T23:59:59').toISOString();
      } else {
        // clearFilters modunda sadece defaultCategory varsa onu uygula
        if (defaultCategory) filter.category = defaultCategory;
      }
      
      const result = await getLogs(filter);
      if (result.success && result.data) {
        setLogs(result.data.logs);
        setTotal(result.data.total);
      }
    } catch (error) {
      onError?.('Failed to load logs');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  // Handle search
  const handleSearch = () => {
    setSearchApplied(true);
    loadLogs(true);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setTraceIdFilter('');
    setLevelFilter('');
    setCategoryFilter(defaultCategory || '');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    setSearchApplied(false);
    setPage(1);
    loadLogs(true, true); // resetPage=true, clearFilters=true
  };

  // Load TraceID details
  const loadTraceIdDetails = async (traceId: string) => {
    setSelectedTraceId(traceId);
    setTraceIdLoading(true);
    try {
      const result = await getLogsByTraceId(traceId);
      if (result.success && result.data) {
        setTraceIdLogs(result.data);
      }
    } catch (error) {
      onError?.('Failed to load trace details');
    }
    setTraceIdLoading(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('logs_title')}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {t('logs_total')}: <span className="font-semibold text-gray-900">{total}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* TraceID Search - Ayrı Kart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="font-semibold text-gray-900">{t('logs_trace_search')}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">{t('logs_trace_search_hint')}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={traceIdFilter}
              onChange={(e) => setTraceIdFilter(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <button
              onClick={() => {
                if (traceIdFilter.trim()) {
                  loadTraceIdDetails(traceIdFilter.trim());
                }
              }}
              disabled={!traceIdFilter.trim() || traceIdLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {traceIdLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* General Filters - Ana Kart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="font-semibold text-gray-900">{t('logs_filters')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Level Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('logs_level')}
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as LogLevel | '')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">{t('all')}</option>
                {LOG_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('logs_category')}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as LogCategory | '')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">{t('all')}</option>
                {LOG_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('logs_action')}
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">{t('all')}</option>
                {LOG_ACTIONS.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('logs_start_date')}
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('logs_end_date')}
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {t('search')}
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t('clear_filters')}
            </button>
            {searchApplied && (
              <span className="text-sm text-gray-500">
                {t('logs_filtered_results', { count: total })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('logs_empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logs_time')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logs_level')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logs_category')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logs_action')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logs_message')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logs_staff')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logs_trace_id')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-600 font-mono text-[10px] sm:text-xs">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${LEVEL_COLORS[log.level]}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${CATEGORY_COLORS[log.category]}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-md truncate" title={log.message}>
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {log.staff ? (
                        <span className="flex items-center gap-1">
                          <span className="font-mono text-xs">{log.staff.staffCode}</span>
                          <span className="text-gray-400">•</span>
                          <span>{log.staff.firstName}</span>
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => loadTraceIdDetails(log.traceId)}
                        className="text-blue-600 hover:text-blue-800 font-mono text-xs truncate max-w-[100px] block"
                        title={log.traceId}
                      >
                        {log.traceId.substring(0, 8)}...
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {t('logs_showing', { 
                from: ((page - 1) * pageSize) + 1, 
                to: Math.min(page * pageSize, total), 
                total 
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('previous')}
              </button>
              <span className="text-xs sm:text-sm text-gray-600 min-w-[60px] text-center">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TraceID Detail Modal */}
      {selectedTraceId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('logs_trace_details')}</h3>
                <p className="text-sm text-gray-500 font-mono">{selectedTraceId}</p>
              </div>
              <button
                onClick={() => setSelectedTraceId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {traceIdLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : traceIdLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {t('logs_empty')}
                </div>
              ) : (
                <div className="space-y-3">
                  {traceIdLogs.map((log, index) => (
                    <div key={log.id} className="relative pl-6 pb-3">
                      {/* Timeline line */}
                      {index < traceIdLogs.length - 1 && (
                        <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${
                        log.level === 'ERROR' || log.level === 'FATAL' 
                          ? 'border-red-500 bg-red-100' 
                          : log.level === 'WARN' 
                          ? 'border-yellow-500 bg-yellow-100'
                          : 'border-blue-500 bg-blue-100'
                      }`}></div>
                      
                      {/* Log content */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 font-mono">{formatDate(log.createdAt)}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[log.level]}`}>
                            {log.level}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[log.category]}`}>
                            {log.category}
                          </span>
                          {log.duration && (
                            <span className="text-xs text-gray-500">{log.duration}ms</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.message}</p>
                        {log.errorStack && (
                          <pre className="mt-2 text-xs bg-red-50 text-red-800 p-2 rounded overflow-x-auto">
                            {log.errorStack}
                          </pre>
                        )}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              Metadata
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
