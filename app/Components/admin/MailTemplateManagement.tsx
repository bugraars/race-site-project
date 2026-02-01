'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  getMailTemplates,
  getMailTemplatePreview,
  generateMailTemplatePreview,
  TemplateInfo,
  TemplatePreview,
  TemplateVariable,
} from '@/lib/adminApi';

// Icons
const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

interface MailTemplateManagementProps {
  staffId?: number;
}

export default function MailTemplateManagement({ staffId }: MailTemplateManagementProps) {
  const t = useTranslations('AdminDashboard');

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [showHtmlSource, setShowHtmlSource] = useState(false);

  // Load templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMailTemplates();
      if (result.success && result.data) {
        const apiData = result.data as any;
        setTemplates(apiData.data || apiData || []);
      } else {
        setError(result.error || 'Şablonlar yüklenemedi');
      }
    } catch {
      setError('Şablonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Open preview modal
  const openPreview = async (template: TemplateInfo) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
    setPreviewLoading(true);
    setCustomData({});
    setShowHtmlSource(false);

    try {
      const result = await getMailTemplatePreview(template.id);
      if (result.success && result.data) {
        const apiData = result.data as any;
        const data = apiData.data || apiData;
        setPreviewData(data);
        // Initialize custom data with preview data
        const initialData: Record<string, string> = {};
        if (data.previewData) {
          Object.entries(data.previewData).forEach(([key, value]) => {
            initialData[key] = String(value);
          });
        }
        setCustomData(initialData);
      }
    } catch {
      setError('Önizleme yüklenemedi');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Update preview with custom data
  const updatePreview = async () => {
    if (!selectedTemplate) return;
    
    setPreviewLoading(true);
    try {
      const result = await generateMailTemplatePreview(selectedTemplate.id, customData);
      if (result.success && result.data) {
        const apiData = result.data as any;
        const data = apiData.data || apiData;
        setPreviewData(prev => prev ? { ...prev, html: data.html } : null);
      }
    } catch {
      setError('Önizleme güncellenemedi');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-700';
      case 'notification': return 'bg-amber-100 text-amber-700';
      case 'marketing': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'system': return 'Sistem';
      case 'notification': return 'Bildirim';
      case 'marketing': return 'Pazarlama';
      default: return category;
    }
  };

  // Clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TemplateIcon />
            Mail Şablonları
          </h2>
          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 font-medium">
            {templates.length} Şablon
          </span>
        </div>

        <button
          onClick={loadTemplates}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:opacity-50"
          title="Yenile"
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Şablonlar yükleniyor...</p>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-purple-300 hover:shadow-md transition-all group"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Variable Count */}
                  <div className="flex items-center gap-2 mb-3">
                    <CodeIcon />
                    <span className="text-sm text-gray-600">
                      {template.variableCount || 0} değişken
                    </span>
                  </div>

                  {/* Preview Button */}
                  <button
                    onClick={() => openPreview(template)}
                    className="w-full py-2.5 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center justify-center gap-2 opacity-90 group-hover:opacity-100"
                  >
                    <EyeIcon />
                    Önizle
                  </button>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && !loading && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TemplateIcon />
              </div>
              <p className="text-gray-500">Henüz şablon bulunmuyor</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-purple-500 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-lg">{selectedTemplate.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white`}>
                    {getCategoryLabel(selectedTemplate.category)}
                  </span>
                </div>
                <button
                  onClick={() => { setShowPreviewModal(false); setPreviewData(null); setSelectedTemplate(null); }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left Panel - Variables */}
              <div className="w-80 flex-shrink-0 border-r bg-gray-50 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-white">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CodeIcon />
                    Değişkenler
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Değerleri değiştirip önizlemeyi güncelleyebilirsiniz
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {previewData?.variables?.map((variable) => (
                    <div key={variable.name} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          {variable.name}
                          {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          {variable.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{variable.description}</p>
                      <input
                        type="text"
                        value={customData[variable.name] || ''}
                        onChange={(e) => setCustomData(prev => ({ ...prev, [variable.name]: e.target.value }))}
                        placeholder={variable.example}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t bg-white">
                  <button
                    onClick={updatePreview}
                    disabled={previewLoading}
                    className="w-full py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {previewLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <RefreshIcon />
                        Önizlemeyi Güncelle
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Panel - Preview */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Preview Header */}
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {showHtmlSource ? 'HTML Kaynak Kodu' : 'Önizleme'}
                  </span>
                  <button
                    onClick={() => setShowHtmlSource(!showHtmlSource)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      showHtmlSource 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {showHtmlSource ? '👁️ Önizleme' : '</> HTML'}
                  </button>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-auto bg-white">
                  {previewLoading && !previewData ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Önizleme yükleniyor...</p>
                      </div>
                    </div>
                  ) : showHtmlSource ? (
                    <pre className="p-4 text-xs font-mono text-gray-800 whitespace-pre-wrap break-all bg-gray-50">
                      {previewData?.html || ''}
                    </pre>
                  ) : (
                    <div className="p-4">
                      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <iframe
                          srcDoc={previewData?.html || ''}
                          className="w-full min-h-[500px] bg-white"
                          title="Email Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewData(null); setSelectedTemplate(null); }}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-semibold transition-colors"
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
