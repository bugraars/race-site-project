"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AboutSection() {
  const t = useTranslations("Home");

  // Sponsor listesi (İleride burayı kolayca güncelleyebilirsin)
  const sponsors = [
    { id: 1, src: "/img/redbull.svg", alt: "Red Bull" },
    { id: 2, src: "/img/redbull.svg", alt: "Sponsor 2" },
    { id: 3, src: "/img/redbull.svg", alt: "Sponsor 3" },
    { id: 4, src: "/img/redbull.svg", alt: "Sponsor 4" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12">
      {/* Sol Taraf: Görsel */}
      <div className="w-full md:w-1/2">
        <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden rounded-2xl shadow-xl bg-zinc-100">
          <Image
            src="/img/pexels-gilberto.jpg"
            alt="Hard Enduro"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Sağ Taraf: İçerik */}
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-800 italic uppercase tracking-tighter">
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
          <h3 className="text-zinc-400 font-bold text-xs mb-4 tracking-widest uppercase">
            {t("main_sponsors")}
          </h3>
          
          {/* Grid yapısı: 4 tane yan yana, logolar yarı boyutta (60px civarı) */}
          <div className="flex items-center gap-6">
            {sponsors.map((sponsor, index) => (
              <div 
                key={sponsor.id} 
                className="relative grayscale opacity-40 animate-sponsor-glow"
                style={{ 
                  // Her logoya 2sn aralıkla yanması için delay ekliyoruz
                  animationDelay: `${index * 2}s`,
                  // Toplam süre = logo sayısı * 2sn (8 saniye)
                  animationDuration: '8s' 
                }}
              >
                <Image 
                  src={sponsor.src} 
                  alt={sponsor.alt} 
                  width={60} // Boyut yarıya indirildi
                  height={30}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sponsor-glow {
          0%, 25% { 
            filter: grayscale(0%); 
            opacity: 1; 
            transform: scale(1.05);
          }
          30%, 100% { 
            filter: grayscale(100%); 
            opacity: 0.4; 
            transform: scale(1);
          }
        }
        .animate-sponsor-glow {
          animation-name: sponsor-glow;
          animation-iteration-count: infinite;
          transition: all 0.5s ease;
        }
      `}</style>
    </section>
  );
}