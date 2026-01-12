"use client";
// ANASAYFA
import { useTranslations } from 'next-intl';
import AnnouncementBar from '../Components/AnnouncementBar';
import Navbar from "../Components/Navbar";
import AboutSection from "../Components/AboutSection";
import { usePathname, useRouter } from 'next/navigation';
import RaceMap from '../Components/RaceMap';
import Footer from '../Components/Footer';
import HeroContent from '../Components/HeroContent';
import CountdownTimer from '../Components/CountdownTimer';


export default function Home() {
  const t = useTranslations('Home');
  const pathname = usePathname();
  const router = useRouter();

  function handleLangChange(newLang: string) {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLang;
    const newPath = segments.join('/');
    router.push(newPath);
  }

  return (
    <div className="min-h-screen">

      <AnnouncementBar />
      <Navbar onLangChange={handleLangChange} />
      <header className="relative min-h-[850px] md:h-screen w-full flex items-center overflow-hidden bg-zinc-950">
        {/* Arka Plan Videosu ve Gradient */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
          src="/vid/mock-video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-zinc-950 z-10" />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">

          {/* Sol Kısım */}
          <HeroContent />

          {/* Sağ Kısım */}
          <CountdownTimer />

        </div>
      </header>
      <main>
        {/* Hakkında kısmı ve bileşeni */}
        <div id='about' className="mt-[-30px]">
          <AboutSection />
        </div>
        {/* Harita Kısmı */}
        <section className="pb-10 px-4 max-w-7xl mx-auto">
          <div className="mb-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-800 italic uppercase tracking-tighter">
              {t('race_track_title')} <span className="text-red-500">{t('race_track_title_span')}</span>
            </h2>
            <p className="text-zinc-400 font-bold tracking-widest mt-1">
              {t('race_track_subtitle')}
            </p>
          </div>
          {/* Harita Bileşeni */}
          <RaceMap />
        </section>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}