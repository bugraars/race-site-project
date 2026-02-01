"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AdminMenuBar from '@/app/Components/AdminMenuBar';
import StaffManagement from '@/app/Components/admin/StaffManagement';
import RacerManagement from '@/app/Components/admin/RacerManagement';
import EventManagement from '@/app/Components/admin/EventManagement';
import LogManagement from '@/app/Components/admin/LogManagement';
import MailManagement from '@/app/Components/admin/MailManagement';
import BulkMailManagement from '@/app/Components/admin/BulkMailManagement';
import MailTemplateManagement from '@/app/Components/admin/MailTemplateManagement';
import RouteManagement from '@/app/Components/admin/RouteManagement';
import { Event, getEvents, getActiveEvent } from '@/lib/adminApi';

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
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | undefined>('staff-list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Event listesini yükle
  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const result = await getEvents();
      if (result.success && result.data) {
        setEvents(result.data);
        
        // Eğer henüz event seçilmemişse, ilk aktif olanı seç
        if (!selectedEvent) {
          const activeEvents = result.data.filter(e => e.isActive);
          if (activeEvents.length > 0) {
            setSelectedEvent(activeEvents[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
    setEventsLoading(false);
  };

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

  // Race menüsüne geçince event'leri yükle
  useEffect(() => {
    if (selectedMenu === 'race' && events.length === 0) {
      loadEvents();
    }
  }, [selectedMenu]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_staff');
    router.push('/admin');
  };

  const handleMenuSelect = (key: string, subKey?: string) => {
    setSelectedMenu(key);
    
    // Eğer subKey verilmemişse, varsayılan alt menüyü seç
    if (!subKey) {
      const defaultSubMenus: Record<string, string> = {
        'staff': 'staff-list',
        'racers': 'racers-list',
        'race': 'race-routes',
        'logs': 'logs-system',
        'mail': 'mail-inbox',
      };
      setSelectedSubMenu(defaultSubMenus[key]);
    } else {
      setSelectedSubMenu(subKey);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleEventChange = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  // Event selector component - sadece aktif event'leri gösterir
  const EventSelector = () => {
    const activeEvents = events.filter(e => e.isActive);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1">
            <label className="block text-sm text-gray-500 mb-1">{t('selected_event')}</label>
            <select
              value={selectedEvent?.id || ''}
              onChange={(e) => handleEventChange(Number(e.target.value))}
              disabled={eventsLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white font-semibold text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              {activeEvents.length === 0 ? (
                <option value="">{t('no_active_events')}</option>
              ) : (
                activeEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // İçerik render'ı
  const renderContent = () => {
    // Staff Yönetimi
    if (selectedMenu === 'staff') {
      if (selectedSubMenu === 'staff-list' || !selectedSubMenu) {
        return <StaffManagement />;
      }
    }

    // Yarışçı Yönetimi
    if (selectedMenu === 'racers') {
      // racers-list veya submenu yok ise (varsayılan)
      if (selectedSubMenu === 'racers-list' || !selectedSubMenu) {
        return <RacerManagement />;
      }
    }

    // Event Yönetimi
    if (selectedMenu === 'race') {
      // Event listesi
      if (selectedSubMenu === 'race-events') {
        return <EventManagement onEventSelect={handleEventSelect} onEventsChange={loadEvents} />;
      }
      
      // Rota yönetimi (checkpoint'ler de dahil)
      if (selectedSubMenu === 'race-routes' || !selectedSubMenu) {
        return <RouteManagement />;
      }
    }

    // Log Yönetimi
    if (selectedMenu === 'logs') {
      if (selectedSubMenu === 'logs-nfc') {
        return <LogManagement defaultCategory="NFC_SCAN" />;
      }
      // Varsayılan: sistem logları (logs-system veya submenu yok)
      return <LogManagement defaultCategory="SYSTEM" />;
    }

    // Mail Yönetimi
    if (selectedMenu === 'mail') {
      if (selectedSubMenu === 'mail-sent') {
        return <MailManagement staffId={staff?.id} defaultView="history" />;
      }
      if (selectedSubMenu === 'mail-bulk') {
        return <BulkMailManagement staffId={staff?.id} />;
      }
      if (selectedSubMenu === 'mail-templates') {
        return <MailTemplateManagement staffId={staff?.id} />;
      }
      // Varsayılan: gelen kutusu (mail-inbox veya submenu yok)
      return <MailManagement staffId={staff?.id} defaultView="inbox" />;
    }

    // Diğer modüller için placeholder
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {selectedSubMenu ? `${t(`menu_${selectedMenu.replace('-', '_')}`)} › ${t(`menu_${selectedSubMenu.replace(/-/g, '_')}`)}` : t('admin_panel')}
        </h2>
        <p className="text-gray-500">
          {t('module_coming_soon')}
        </p>
      </div>
    );
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
        {renderContent()}
      </main>
    </div>
  );
}
