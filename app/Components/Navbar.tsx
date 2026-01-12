"use client";

import { useTranslations } from "next-intl";
import LangListbox from "./LangListbox";
import { Link } from "@/i18n/routing";

export default function Navbar({ onLangChange }: { onLangChange: (lang: string) => void }) {
  const t = useTranslations("Navbar");
  // pathname'den dili almak için
  let locale = "en";
  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(/^\/?([a-zA-Z-]{2,5})\b/);
    if (match && match[1]) {
      locale = match[1];
    }
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="w-full bg-zinc-950 border-b border-white/5 px-4 md:px-12 py-6 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* SOL: LOGO */}
        {/* Wrapper (Kapsayıcı):
           w-24 md:w-32: Logonun kaplayacağı yatay alanı rezerve ediyoruz (yer tutucu).
           relative: Absolute olan logo burayı referans alacak.
        */}
        <div className="relative w-24 md:w-32 flex items-center"> 
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, "hero")}
            /* absolute: Akıştan çıkar.
               left-0: Sola yasla.
               top-1/2: Üst kenarı %50 aşağı it.
               -translate-y-1/2: Kendi boyunun yarısı kadar yukarı çek (Merkezleme).
            */
            className="block absolute left-0 top-1/2 -translate-y-1/2"
          >
            <img 
              src="/img/logo.png" 
              alt="Logo" 
              /* h-32 md:h-40: Navbar'dan daha büyük bir değer veriyoruz ki taşsın.
                 Bu boyuta göre hem alttan hem üstten eşit taşacaktır.
              */
              className="h-32 md:h-40 max-w-none drop-shadow-lg" 
            />
          </a>
        </div>

        {/* ORTA: Linkler */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-10 text-white font-bold text-sm uppercase italic tracking-widest">
            <li>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="hover:text-red-500 transition-colors">
                {t("about")}
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="hover:text-red-500 transition-colors">
                {t("contact")}
              </a>
            </li>
          </ul>
        </div>

        {/* SAĞ: Dil Seçici */}
        <div className="flex items-center min-w-[140px] justify-end relative z-[110]">
          <LangListbox onChange={onLangChange} />
        </div>
      </div>
    </nav>
  );
}