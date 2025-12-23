"use client";

import { useTranslations } from "next-intl";
import LangListbox from "./LangListbox";

export default function Navbar({ onLangChange }: { onLangChange: (lang: string) => void }) {
  const t = useTranslations("Navbar");

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    /* fixed, absolute kaldırıldı. Standart block yapısında en üstte durur. */
    <nav className="w-full bg-zinc-950 border-b border-white/5 px-4 md:px-12 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* SOL: LOGO */}
        <div className="flex items-center">
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, "hero")}
            className="text-xl md:text-2xl font-black text-lime-400 italic tracking-tighter"
          >
            LOGO
          </a>
        </div>

        {/* ORTA: Linkler (Sadece Masaüstü - md) */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-10 text-white font-bold text-sm uppercase italic tracking-widest">
            <li>
              <a href="#hero" onClick={(e) => scrollToSection(e, "hero")} className="hover:text-lime-400 transition-colors">
                {t("home")}
              </a>
            </li>
            <li>
              <a href="#race-track" onClick={(e) => scrollToSection(e, "race-track")} className="hover:text-lime-400 transition-colors">
                {t("about")}
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="hover:text-lime-400 transition-colors">
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