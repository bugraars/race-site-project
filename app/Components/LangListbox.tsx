"use client";
import { useState, useEffect } from "react";
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import CountryFlag from "react-country-flag";
import { useParams } from "next/navigation"; // 1. useParams'ı içe aktar

const languages = [
  { id: "tr", name: "Türkçe", country: "TR" },
  { id: "en", name: "English", country: "GB" },
  { id: "ru", name: "Русский", country: "RU" },
  { id: "de", name: "Deutsch", country: "DE" },
];

export default function LangListbox({ onChange }: { onChange: (lang: string) => void }) {
  const params = useParams(); // 2. URL parametrelerini al
  const currentLocale = params.locale as string;

  // 3. URL'deki locale ile eşleşen dili bul, bulamazsa ilkini seç
  const initialLang = languages.find((l) => l.id === currentLocale) || languages[0];
  
  const [selected, setSelected] = useState(initialLang);

  // 4. Sayfa dilleri arasında gezinirken state'in güncel kalmasını sağla
  useEffect(() => {
    const updatedLang = languages.find((l) => l.id === currentLocale);
    if (updatedLang) {
      setSelected(updatedLang);
    }
  }, [currentLocale]);

  function handleChange(lang: typeof languages[0]) {
    setSelected(lang);
    onChange(lang.id);
  }

  return (
    <div className="w-40">
      <Listbox value={selected} onChange={handleChange}>
        <Label className="sr-only">Dil Seçimi</Label>
        <div className="relative mt-0">
          <ListboxButton className="flex w-full items-center gap-2 rounded-md bg-gray-800/50 py-1.5 pr-2 pl-3 text-left text-white border border-lime-400 focus:outline-none">
            <span className="flex items-center gap-2">
              <CountryFlag countryCode={selected.country === "GB" ? "GB" : selected.country} svg style={{ width: "1.2em" }} />
              <span className="block truncate">{selected.name}</span>
            </span>
            <ChevronUpDownIcon aria-hidden="true" className="ml-auto h-5 w-5 text-gray-400" />
          </ListboxButton>
          
          <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-900 py-1 text-base shadow-lg border border-white/10">
            {languages.map((lang) => (
              <ListboxOption
                key={lang.id}
                value={lang}
                className="group relative cursor-pointer py-2 pl-3 pr-9 text-white data-[focus]:bg-lime-500 data-[focus]:text-black"
              >
                <div className="flex items-center gap-2">
                  <CountryFlag countryCode={lang.country} svg style={{ width: "1.2em" }} />
                  <span className="block truncate font-normal group-data-[selected]:font-semibold">
                    {lang.name}
                  </span>
                </div>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-lime-400 group-data-[focus]:text-black group-[&:not([data-selected])]:hidden">
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
}