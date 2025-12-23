"use client";

import Link from "next/link";
import LangListbox from "./LangListbox";
import { useTranslations } from "next-intl";

export default function Navbar({ onLangChange }: { onLangChange: (lang: string) => void }) {
  const t = useTranslations("Navbar");

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 z-20">
      {/* Logo */}
      <div className="flex items-center min-w-[120px]">
        <span className="text-2xl font-bold text-lime-400 drop-shadow tracking-widest">LOGO</span>
      </div>
      {/* Ortada linkler */}
      <ul className="flex-1 flex justify-center gap-8 text-white font-medium text-lg">
        <li>
          <Link href="/" className="hover:text-lime-400 transition">
            {t("home")}
          </Link>
        </li>
        <li>
          <Link href="/about" className="hover:text-lime-400 transition">
            {t("about")}
          </Link>
        </li>
        <li>
          <Link href="/contact" className="hover:text-lime-400 transition">
            {t("contact")}
          </Link>
        </li>
      </ul>
      {/* Sağda dil seçici */}
      <div className="flex items-center min-w-[140px] justify-end">
        <LangListbox onChange={onLangChange} />
      </div>
    </nav>
  );
}
