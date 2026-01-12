"use client";
import { useState, useEffect } from "react";
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import CountryFlag from "react-country-flag";
import { useParams } from "next/navigation";

const languages = [
  { id: "tr", name: "Türkçe", country: "TR" },
  { id: "en", name: "English", country: "GB" },
  { id: "ru", name: "Русский", country: "RU" },
  { id: "de", name: "Deutsch", country: "DE" },
];

export default function LangListbox({ onChange }: { onChange: (lang: string) => void }) {
  const params = useParams();
  const currentLocale = params.locale as string;
  const initialLang = languages.find((l) => l.id === currentLocale) || languages[0];
  
  const [selected, setSelected] = useState(initialLang);

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
          <ListboxButton className="flex w-full items-center gap-2 rounded-md bg-gray-800/50 py-1.5 pr-2 pl-3 text-left text-white border border-red-500 focus:outline-none">
            <span className="flex items-center gap-2">
              <CountryFlag countryCode={selected.country === "GB" ? "GB" : selected.country} svg style={{ width: "1.2em" }} />
              <span className="block truncate">{selected.name}</span>
            </span>
            <ChevronUpDownIcon aria-hidden="true" className="ml-auto h-5 w-5 text-gray-400" />
          </ListboxButton>

          <ListboxOptions className="absolute right-0 mt-2 w-full origin-top-right overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 focus:outline-none z-[120]">
            {languages.map((lang) => (
              <ListboxOption
                key={lang.id}
                value={lang}
                className="group relative cursor-pointer py-2 pl-3 pr-9 text-white data-[focus]:bg-red-500 data-[focus]:text-white"
              >
                <div className="flex items-center gap-2">
                  <CountryFlag countryCode={lang.country} svg style={{ width: "1.2em" }} />
                  <span className="block truncate font-normal group-data-[selected]:font-semibold">
                    {lang.name}
                  </span>
                </div>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-red-500 group-data-[focus]:text-white group-[&:not([data-selected])]:hidden">
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