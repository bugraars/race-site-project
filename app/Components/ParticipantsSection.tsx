"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Participant {
  id: number;
  bibNumber: string | null;
  firstName: string;
  lastName: string;
}

// Backend API URL (Core/Server - Port 3000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function ParticipantsSection() {
  const t = useTranslations("Participants");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Ekranda gösterilecek kart sayısı
  const cardsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  // Backend'den yarışçıları çek
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/racers/joined-list`);
        if (response.ok) {
          const data = await response.json();
          setParticipants(data);
        }
      } catch (error) {
        console.error("Participants fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (participants.length === 0) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [participants.length, currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      return newIndex < 0 ? participants.length - 1 : newIndex;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= participants.length ? 0 : newIndex;
    });
  };

  // Görünür kartları hesapla
  const getVisibleCards = () => {
    if (participants.length === 0) return [];
    
    const cards = [];
    const total = participants.length;
    
    // 3 kart göster (desktop için)
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % total;
      cards.push({
        ...participants[index],
        position: i,
        originalIndex: index
      });
    }
    
    return cards;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-zinc-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (participants.length === 0) {
    return null;
  }

  const visibleCards = getVisibleCards();

  return (
    <section className="py-20 bg-zinc-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* Başlık */}
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            <span className="text-zinc-800">{t("participants_title") || "Katılımcılar"}</span>
            <span className="text-red-500"> {t("participants_title_span") || "2026"}</span>
          </h2>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-sm hidden sm:block">
              {participants.length} {t("participants_count") || "Yarışçı"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={goToPrev}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-300 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all text-zinc-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-300 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all text-zinc-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCards.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              className={`
                bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 
                rounded-2xl p-6 
                border border-zinc-700
                hover:border-red-500
                shadow-lg hover:shadow-red-500/10
                transition-all duration-300
                cursor-pointer
                ${idx === 0 ? 'block' : idx === 1 ? 'hidden md:block' : 'hidden lg:block'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Bib Number Badge */}
                <div className="w-16 h-16 rounded-xl bg-red-500 flex items-center justify-center font-black text-2xl text-white italic shrink-0">
                  {card.bibNumber || "?"}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm uppercase tracking-wide text-zinc-400 truncate">
                    {card.firstName}
                  </p>
                  <p className="font-black text-xl uppercase tracking-tight text-white truncate">
                    {card.lastName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-1">
            {participants.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  h-1 rounded-full transition-all duration-300
                  ${currentIndex === index 
                    ? 'bg-red-500 w-8' 
                    : 'bg-zinc-300 w-1 hover:bg-zinc-400'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}