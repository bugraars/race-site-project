"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AdminMenuBar from '@/app/Components/AdminMenuBar';

interface AdminStaff {
  id: number;
  staffCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const t = useTranslations('AdminDashboard');
  const [staff, setStaff] = useState<AdminStaff | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('staff');
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Token kontrolü
    const token = localStorage.getItem('admin_token');
    const staffData = localStorage.getItem('admin_staff');

    if (!token || !staffData) {
      router.push('/admin');
      return;
    }

    try {
      const parsedStaff = JSON.parse(staffData);
      if (parsedStaff.role !== 'ADMIN') {
        router.push('/admin');
        return;
      }
      setStaff(parsedStaff);
    } catch (e) {
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_staff');
    router.push('/admin');
  };

  const handleMenuSelect = (key: string, subKey?: string) => {
    setSelectedMenu(key);
    setSelectedSubMenu(subKey);
    console.log("Selected:", key, subKey);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  if (!staff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Scrollable Menu */}
      <AdminMenuBar 
        onSelect={handleMenuSelect} 
        selectedKey={selectedMenu} 
        selectedSubKey={selectedSubMenu}
        onLogout={handleLogout}
        staffName={staff.fullName}
        staffCode={staff.staffCode}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedSubMenu ? `${selectedMenu} > ${selectedSubMenu}` : t('admin_panel')}
          </h2>
          <p className="text-gray-600">
            {selectedSubMenu 
              ? `${t('selected_module')}: ${selectedSubMenu}` 
              : t('select_module')
            }
          </p>
        </div>
      </main>
    </div>
  );
}
