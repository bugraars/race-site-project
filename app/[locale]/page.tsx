"use client";
import { useTranslations } from 'next-intl';
import Navbar from "../Components/Navbar";
import AboutSection from "../Components/AboutSection";
import { usePathname, useRouter } from 'next/navigation';
import RaceMap from '../Components/RaceMap';

export default function Home() {
  const t = useTranslations('Home');
  const pathname = usePathname();
  const router = useRouter();

  // Dil seçimi değiştiğinde URL'i güncelleyen fonksiyon
  function handleLangChange(newLang: string) {
    if (!pathname) return;

    // Örn: /tr/about -> segments: ["", "tr", "about"]
    const segments = pathname.split('/');

    // Dil kodunu (index 1) yeni seçilen dille değiştiriyoruz
    segments[1] = newLang;

    const newPath = segments.join('/');
    router.push(newPath);
  }

  return (
    <div className="min-h-screen">
      {/* Üst bar ve Header içeriği aynı kalıyor */}
      <div className="w-full bg-lime-500 text-white text-center py-2 px-4 flex items-center justify-center gap-2">
        <span>{t('announcement')}</span>
        <a href="#" className="underline font-bold hover:text-black transition">{t('apply')}</a>
      </div>

      <header className="relative h-[400px] flex flex-col justify-center items-center text-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/vid/mock-video.mp4"
          autoPlay muted loop playsInline
        />
        <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />

        <div className="relative z-20 w-full">
          <Navbar onLangChange={handleLangChange} />
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center h-full w-full">
          <div className="text-lg text-white tracking-widest mb-2 mt-16">17-19 JULY 2026</div>
          <h1 className="text-4xl md:text-6xl font-bold text-lime-400 mb-2">
            {t('title')} <span className="text-white">{t('title')}</span>
          </h1>
          <div className="flex gap-4 justify-center mt-6">
            <button className="px-6 py-2 bg-zinc-800 text-white rounded hover:bg-lime-400 hover:text-black transition">{t('schedule')}</button>
            <button className="px-6 py-2 bg-lime-400 text-black rounded font-bold hover:bg-zinc-800 hover:text-white transition">{t('register')}</button>
          </div>
        </div>
      </header>
      <main>
        <AboutSection />
        <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-zinc-800 italic uppercase tracking-tighter">
            {t('race_track_title')} <span className="text-lime-500">{t('race_track_title_span')}</span>
          </h2>
          <p className="text-zinc-500 mt-3 text-lg font-medium">
            {t('race_track_subtitle')}
          </p>
        </div>
        {/* Harita Bileşeni */}
        <RaceMap />
      </section>
      </main>
    </div>
  );
}