"use client";
import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface SubMenuItem {
  key: string;
  labelKey: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  key: string;
  labelKey: string;
  icon: React.ReactNode;
  subItems: SubMenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: "staff",
    labelKey: "menu_staff",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    subItems: [
      { key: "staff-list", labelKey: "menu_staff_list" },
      { key: "staff-roles", labelKey: "menu_staff_roles" },
    ],
  },
  {
    key: "racers",
    labelKey: "menu_racers",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    subItems: [
      { key: "racers-list", labelKey: "menu_racers_list" },
    ],
  },
  {
    key: "race",
    labelKey: "menu_race",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    subItems: [
      { key: "race-events", labelKey: "menu_race_events" },
      { key: "race-checkpoints", labelKey: "menu_race_checkpoints" },
    ],
  },
  {
    key: "logs",
    labelKey: "menu_logs",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    subItems: [
      { key: "logs-system", labelKey: "menu_logs_system" },
    ],
  },
  {
    key: "mail",
    labelKey: "menu_mail",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    subItems: [
      { key: "mail-inbox", labelKey: "menu_mail_inbox" },
      { key: "mail-sent", labelKey: "menu_mail_sent" },
      { key: "mail-bulk", labelKey: "menu_mail_bulk" },
      { key: "mail-templates", labelKey: "menu_mail_templates" },
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
  const t = useTranslations('AdminDashboard');
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
                    <span>{t(item.labelKey)}</span>
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
                          {t('logout')}
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
                        ? "bg-red-500 text-white font-medium shadow-sm" 
                        : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                    onClick={() => handleSubItemClick(selectedKey, subItem.key)}
                  >
                    {t(subItem.labelKey)}
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
