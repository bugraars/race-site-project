"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface Sponsor {
  id: number;
  name: string;
  logo: string;
  height: number;
  url: string;
  description: string;
}

export default function SponsorsSection() {
  const t = useTranslations("Home");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    fetch("/data/sponsor.json")
      .then((res) => res.json())
      .then((data) => setSponsors(data.sponsors))
      .catch((err) => console.error("Sponsor JSON Error:", err));
  }, []);

  return (
    <section id="sponsors" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-center mb-12">
          <span className="text-zinc-800">{t("supporters")}</span>
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-110"
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                style={{ height: sponsor.height, width: "auto" }}
                className="object-contain"
              />
              <span className="text-zinc-500 text-sm font-medium">
                {sponsor.description}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}