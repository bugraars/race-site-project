"use client";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function CountdownTimer() {
    const t = useTranslations('Home');
    const targetDate = new Date('2026-07-17T09:00:00+03:00');

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const FlipUnit = ({ value, label, isSeconds = false }: { value: number; label: string, isSeconds?: boolean }) => (
        <div className="flex flex-col items-center relative my-4 ">
            {/* UTC Badge - Sadece saniyenin üzerinde */}
            {isSeconds && (
                <div className="absolute -top-7 right-0 z-30">
                    <span className="bg-lime-400 text-black text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-lg">
                        UTC +3
                    </span>
                </div>
            )}
            
            {/* Kutu Boyutları: Mobil (XS) için küçültüldü */}
            <div className="relative bg-[#111111] rounded-lg 
                            w-[60px] h-[60px] 
                            sm:w-[96px] sm:h-[96px] 
                            md:w-[120px] md:h-[120px] 
                            flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                
                <div className="absolute w-full h-[1px] bg-black/50 top-1/2 left-0 z-20"></div>
                
                {/* Font Boyutları: Mobil (XS) için küçültüldü */}
                <span className="text-xl sm:text-3xl md:text-5xl font-black text-lime-400 leading-none">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>

            {/* Etiket Boyutları */}
            <span className="text-[8px] sm:text-[10px] uppercase tracking-widest mt-2 sm:mt-3 text-zinc-400 font-bold">
                {label}
            </span>
        </div>
    );

    return (
        <div className="w-full md:w-auto flex justify-center items-center my-4 ">
            {/* Arka plan kartı kaldırıldı, sadece gap ve hizalama kaldı */}
            <div className="flex gap-1.5 sm:gap-4 md:gap-6 items-end">
                <FlipUnit value={timeLeft.days} label={t('days')} />
                <FlipUnit value={timeLeft.hours} label={t('hours')} />
                <FlipUnit value={timeLeft.minutes} label={t('minutes')} />
                <FlipUnit value={timeLeft.seconds} label={t('seconds')} isSeconds={true} />
            </div>
        </div>
    );
}