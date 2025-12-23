"use client";
import { useState, useRef, useEffect } from "react";
import CountryFlag from "react-country-flag";

export default function LangSelect({ onChange }: { onChange: (lang: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <li className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2 bg-transparent text-white border border-lime-400 rounded px-2 py-1 focus:outline-none hover:bg-lime-400/10 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
      >
        <CountryFlag countryCode="TR" svg style={{ width: "1.5em", height: "1.5em" }} />
        <span className="hidden md:inline">TR</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-28 bg-white rounded shadow z-30 text-black divide-y divide-gray-100 min-w-max" tabIndex={-1}>
          <li>
            <button className="flex items-center w-full px-3 py-2 hover:bg-lime-100 gap-2" onClick={() => { onChange('tr'); setOpen(false); }}>
              <CountryFlag countryCode="TR" svg style={{ width: "1.5em", height: "1.5em" }} /> <span>Türkçe</span>
            </button>
          </li>
          <li>
            <button className="flex items-center w-full px-3 py-2 hover:bg-lime-100 gap-2" onClick={() => { onChange('en'); setOpen(false); }}>
              <CountryFlag countryCode="GB" svg style={{ width: "1.5em", height: "1.5em" }} /> <span>English</span>
            </button>
          </li>
          <li>
            <button className="flex items-center w-full px-3 py-2 hover:bg-lime-100 gap-2" onClick={() => { onChange('ru'); setOpen(false); }}>
              <CountryFlag countryCode="RU" svg style={{ width: "1.5em", height: "1.5em" }} /> <span>Русский</span>
            </button>
          </li>
          <li>
            <button className="flex items-center w-full px-3 py-2 hover:bg-lime-100 gap-2" onClick={() => { onChange('de'); setOpen(false); }}>
              <CountryFlag countryCode="DE" svg style={{ width: "1.5em", height: "1.5em" }} /> <span>Deutsch</span>
            </button>
          </li>
        </ul>
      )}
    </li>
  );
}
