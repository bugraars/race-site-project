"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AnnouncementBar() {
  const t = useTranslations("AnnouncementBar");
  return (
    <Link
      href="/register"
      className="group block w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-[length:200%_auto] hover:bg-[100%_0] transition-all duration-500 shadow-lg border-b border-red-700/20"
    >
      <div className="max-w-7xl mx-auto py-2.5 px-4 flex items-center justify-center gap-3">
        {/* Canlılık Efekti Veren Pulse Noktası */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white/80"></span>
        </span>

        {/* Metin İçeriği */}
        <div className="flex items-center gap-2 text-white text-sm md:text-base font-semibold tracking-tight group-hover:underline underline-offset-4 decoration-white/30">
          <span>{t('announcement_short')}</span>
          <span className="hidden sm:inline opacity-30">|</span>
          <span className="hidden sm:inline bg-white/20 px-2 py-0.5 rounded-full text-[10px] md:text-xs uppercase tracking-wider">
            {t('apply_now')}
          </span>
        </div>

        {/* Hareketli Ok İkonu */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="hidden sm:block h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </Link>
  );
}