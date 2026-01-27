"use client";
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HeroContent() {
    const t = useTranslations('Home');

    return (
        <div className="w-full md:flex-1 flex flex-col items-center md:items-start text-center md:text-left my-4 ">
            <h1 className="text-6xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                OLYMPOS <span className="text-red-500">2026</span>
            </h1>

            <div className="mt-6 flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 text-xl md:text-3xl font-bold uppercase tracking-tight">
                <span className="text-white">{t('title')} Kemer</span>
            </div>

            <div className="mt-6 w-full md:w-auto flex justify-center md:justify-start">
                <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 w-fit px-8 py-3 md:px-10 md:py-4 bg-red-500 hover:bg-white text-white hover:text-black font-bold uppercase tracking-tighter rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/40 text-base md:text-lg text-center group"
                >
                    <span>{t("register_now")}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}