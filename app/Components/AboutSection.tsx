"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AboutSection() {
  const t = useTranslations("Home");

  return (
    <section id="about" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-stretch gap-12">
        {/* Sol Taraf: Görsel */}
        <div className="w-full lg:w-1/2">
          <div className="relative h-[400px] lg:h-full min-h-[500px] w-full overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/img/about-img.jpg"
              alt="About"
              fill
              className="object-cover"
            />
          </div>
        </div>
        {/* Sağ Taraf: İçerik */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-800 italic uppercase tracking-tighter">
              <span className="text-zinc-800">{t("about_title_1")} </span>
              <span className="text-red-500">{t("about_title_2")}</span>
            </h2>
            <p className="text-zinc-400 font-bold tracking-widest mt-2 uppercase">
              {t("about_category")}
            </p>
          </div>

          <p className="text-zinc-600 leading-relaxed text-base lg:text-lg text-justify hyphens-auto">
            {t("about_description")}
          </p>
        </div>
      </div>
    </section>
  );
}