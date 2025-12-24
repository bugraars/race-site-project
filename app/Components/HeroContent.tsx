"use client";
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HeroContent() {
    const t = useTranslations('Home');

    return (
        <div className="w-full md:flex-1 flex flex-col items-center md:items-start text-center md:text-left my-4 ">
            <h1 className="text-6xl font-black text-white leading-[0.85] tracking-tighter uppercase">
                OLYMPOS <span className="text-lime-400">2026</span>
            </h1>

            <div className="mt-6 flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 text-xl md:text-3xl font-bold uppercase tracking-tight">
                <span className="text-white">Hard Enduro 17-18 {t('july')}</span>
            </div>

            <div className="mt-2 w-full md:w-auto">
                <Link
                    href="/register"
                    className="inline-block px-12 py-5 bg-lime-500 hover:bg-white text-black font-black uppercase tracking-tighter rounded-xl transition-all duration-300 shadow-2xl w-full md:w-auto text-lg text-center"
                >
                    {t("register_now")}
                </Link>
            </div>
        </div>
    );
}