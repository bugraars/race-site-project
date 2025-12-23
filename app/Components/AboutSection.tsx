"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AboutSection() {
  const t = useTranslations("Home");

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12">
      {/* Sol Taraf: Görsel */}
      <div className="w-full md:w-1/2">
        <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden rounded-2xl shadow-xl">
          <Image
            src="/img/pexels-gilberto.jpg" // Buraya kendi görsel yolunu ekle
            alt="Hard Enduro"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Sağ Taraf: İçerik */}
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <span className="text-zinc-500 text-sm tracking-[0.3em] font-medium uppercase">
            - {t("about_subtitle")} -
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-2 italic">
            <span className="text-zinc-800">{t("about_title_1")} </span>
            <span className="text-lime-500">{t("about_title_2")}</span>
          </h2>
          <p className="text-zinc-400 font-bold tracking-widest mt-1">
            {t("about_category")}
          </p>
        </div>

        <p className="text-zinc-600 leading-relaxed text-lg">
          {t("about_description")}
        </p>

        {/* Sponsorlar Bölümü */}
        <div className="pt-4">
          <h3 className="text-zinc-800 font-bold text-lg mb-2 tracking-wide uppercase">
            {t("main_sponsors")}
          </h3>
          <div className="flex flex-wrap items-center gap-8">
            <Image 
              src="/img/redbull.svg" 
              alt="Red Bull" 
              width={120}  
              className="grayscale hover:grayscale-0 transition opacity-80 hover:opacity-100"
            />
            <Image 
              src="/img/redbull.svg" 
              alt="Red Bull" 
              width={120}  
              className="grayscale hover:grayscale-0 transition opacity-80 hover:opacity-100"
            />
            <Image 
              src="/img/redbull.svg" 
              alt="Red Bull" 
              width={120}  
              className="grayscale hover:grayscale-0 transition opacity-80 hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}