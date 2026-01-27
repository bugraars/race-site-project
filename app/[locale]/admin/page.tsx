"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AdminLoginPage() {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [staffCode, setStaffCode] = useState('');

  // Sadece 3 rakam girilebilen ve başında S- olan format
  const formatStaffCode = (text: string) => {
    let numericOnly = text.replace(/[^0-9]/g, '');
    return 'S-' + numericOnly.substring(0, 3);
  };
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('https://t8wdcqtmvn.eu-central-1.awsapprunner.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffCode: staffCode.toUpperCase(),
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('login_failed'));
      }

      // Admin kontrolü
      if (data.staff.role !== 'ADMIN') {
        throw new Error(t('admin_access_only'));
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_staff', JSON.stringify(data.staff));

      // Admin paneline yönlendir (şimdilik boş sayfa)
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="staffCode" className="block text-sm font-medium text-gray-700 mb-2">
                {t('staff_code')}
              </label>
              <input
                id="staffCode"
                type="text"
                value={staffCode}
                onChange={(e) => setStaffCode(formatStaffCode(e.target.value))}
                placeholder="S-000"
                maxLength={5}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                {t('pin')}
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN"
                required
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('logging_in') : t('login')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-500">
              {t('admin_only')}
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('go_home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
