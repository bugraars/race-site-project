"use client";
import { useRef, useState, useEffect } from "react";

interface SubMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  subItems: SubMenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: "staff",
    label: "Staff Yönetimi",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    subItems: [
      { key: "staff-list", label: "Staff Listesi" },
      { key: "staff-add", label: "Yeni Staff Ekle" },
      { key: "staff-roles", label: "Rol Yönetimi" },
    ],
  },
  {
    key: "racers",
    label: "Yarışçılar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    subItems: [
      { key: "racers-list", label: "Yarışçı Listesi" },
      { key: "racers-add", label: "Yarışçı Ekle" },
      { key: "racers-bib", label: "Bib Atama" },
      { key: "racers-categories", label: "Kategoriler" },
    ],
  },
  {
    key: "race",
    label: "Yarış Yönetimi",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    subItems: [
      { key: "race-start", label: "Yarışı Başlat" },
      { key: "race-checkpoints", label: "Checkpoint'ler" },
      { key: "race-results", label: "Sonuçlar" },
      { key: "race-live", label: "Canlı Takip" },
    ],
  },
  {
    key: "logs",
    label: "Loglar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    subItems: [
      { key: "logs-nfc", label: "NFC Okuma Logları" },
      { key: "logs-system", label: "Sistem Logları" },
      { key: "logs-errors", label: "Hata Logları" },
    ],
  },
  {
    key: "souvenir",
    label: "Hatıra Bileti",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    subItems: [
      { key: "souvenir-generate", label: "Bilet Oluştur" },
      { key: "souvenir-templates", label: "Şablonlar" },
      { key: "souvenir-history", label: "Geçmiş" },
    ],
  },
  {
    key: "settings",
    label: "Ayarlar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    subItems: [
      { key: "settings-general", label: "Genel Ayarlar" },
      { key: "settings-race", label: "Yarış Ayarları" },
      { key: "settings-nfc", label: "NFC Ayarları" },
    ],
  },
  {
    key: "sponsors",
    label: "Sponsorlar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subItems: [
      { key: "sponsors-list", label: "Sponsor Listesi" },
      { key: "sponsors-add", label: "Sponsor Ekle" },
      { key: "sponsors-contracts", label: "Sözleşmeler" },
    ],
  },
  {
    key: "media",
    label: "Medya",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    subItems: [
      { key: "media-photos", label: "Fotoğraflar" },
      { key: "media-videos", label: "Videolar" },
      { key: "media-upload", label: "Yükle" },
    ],
  },
  {
    key: "reports",
    label: "Raporlar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    subItems: [
      { key: "reports-race", label: "Yarış Raporları" },
      { key: "reports-finance", label: "Finansal Raporlar" },
      { key: "reports-participants", label: "Katılımcı İstatistikleri" },
    ],
  },
  {
    key: "notifications",
    label: "Bildirimler",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    subItems: [
      { key: "notifications-send", label: "Bildirim Gönder" },
      { key: "notifications-templates", label: "Şablonlar" },
      { key: "notifications-history", label: "Gönderim Geçmişi" },
    ],
  },
];

interface AdminMenuBarProps {
  onSelect: (key: string, subKey?: string) => void;
  selectedKey: string;
  selectedSubKey?: string;
  onLogout?: () => void;
  staffName?: string;
  staffCode?: string;
}

export default function AdminMenuBar({ onSelect, selectedKey, selectedSubKey, onLogout, staffName, staffCode }: AdminMenuBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklanınca dropdown'u kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (itemKey: string) => {
    onSelect(itemKey);
  };

  const handleSubItemClick = (menuKey: string, subKey: string) => {
    onSelect(menuKey, subKey);
  };

  const selectedMenuItem = MENU_ITEMS.find(item => item.key === selectedKey);

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ana Menü */}
        <div className="flex items-center gap-4 py-2">
          {/* Logo - Sadece Desktop'ta görünür */}
          <a href="/" className="flex-shrink-0 hidden sm:block">
            <img 
              src="/img/logo.png" 
              alt="Logo" 
              className="h-28 w-auto" 
            />
          </a>
          
          {/* Menü ve Alt Menü Container */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            {/* Ana Menü Satırı - Scrollable Menu + Profil Butonu */}
            <div className="flex items-center gap-2">
              <div
                ref={scrollRef}
                className="flex-1 flex overflow-x-auto scrollbar-hide gap-1"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    className={`
                      flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl whitespace-nowrap font-medium 
                      transition-all duration-200 ease-out flex-shrink-0 text-sm sm:text-base
                      ${selectedKey === item.key 
                        ? "bg-red-500 text-white shadow-md" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                    onClick={() => handleMenuClick(item.key)}
                  >
                    <span className="hidden sm:inline">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Profil Butonu - Scrollable itemlar ile aynı hizada */}
              <div ref={profileRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-xl
                    transition-all duration-200 ease-out
                    ${isProfileOpen 
                      ? "bg-blue-500 text-white" 
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }
                  `}
                  title="Profil"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                
                {/* Profil Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{staffName}</p>
                      <p className="text-sm text-gray-500">{staffCode}</p>
                    </div>
                    <div className="p-2">
                      {onLogout && (
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Çıkış Yap
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Alt Menü - Seçilen ana menünün alt öğeleri */}
            {selectedMenuItem && selectedMenuItem.subItems.length > 0 && (
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pt-2 mt-2 border-t border-gray-100">
                {selectedMenuItem.subItems.map((subItem) => (
                  <button
                    key={subItem.key}
                    type="button"
                    className={`
                      px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors duration-150 flex-shrink-0
                      ${selectedSubKey === subItem.key 
                        ? "bg-red-100 text-red-600 font-medium" 
                        : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                    onClick={() => handleSubItemClick(selectedKey, subItem.key)}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
