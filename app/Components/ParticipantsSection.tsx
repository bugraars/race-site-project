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
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <section className="pb-10 pt-4 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* Başlık */}
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            <span className="text-zinc-800">{t("participants_title") || "Katılımcılar"}</span>
            <span className="text-red-500"> {t("participants_title_span") || "2026"}</span>
          </h2>

          {/* Count */}
          <span className="text-zinc-500 text-sm">
            <span className="text-red-500 font-black text-xl">{participants.length}</span> {t("participants_count") || "Yarışçı"}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-zinc-200">
          {/* Table Header */}
          <div className="bg-zinc-900 text-white grid grid-cols-12 gap-2 px-3 md:px-4 py-3 font-bold uppercase text-xs tracking-wide">
            <div className="col-span-2 text-center">#</div>
            <div className="col-span-5">{t("table_name") || "İsim"}</div>
            <div className="col-span-5">{t("table_surname") || "Soyisim"}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className={`
                  grid grid-cols-12 gap-2 px-3 md:px-4 py-2 items-center
                  transition-colors duration-200
                  ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}
                  hover:bg-red-50
                `}
              >
                {/* Bib Number */}
                <div className="col-span-2 flex justify-center">
                  <span className="w-8 h-8 rounded-md bg-red-500 flex items-center justify-center font-black text-sm text-white italic">
                    {participant.bibNumber || "?"}
                  </span>
                </div>

                {/* First Name */}
                <div className="col-span-5">
                  <p className="font-medium text-sm text-zinc-700 uppercase tracking-wide truncate">
                    {participant.firstName}
                  </p>
                </div>

                {/* Last Name */}
                <div className="col-span-5">
                  <p className="font-bold text-sm text-zinc-900 uppercase tracking-tight truncate">
                    {participant.lastName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}