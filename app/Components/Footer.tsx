"use client";
import { useState } from "react";
import TermsModal from "./TermsModal";
import { useTranslations } from "next-intl";

export default function Footer() {
    const year = new Date().getFullYear();
    const t = useTranslations();
    const tf = useTranslations('Footer');

    const [modalType, setModalType] = useState<null | "terms" | "privacy">(null);

    return (
        <footer className="w-full bg-gray-100 border-t border-gray-300 py-6">
            <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4 text-gray-700 text-xs">
                
                {/* Dashboard Login ve Sözleşmeler */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                    <a
                        href="/admin"
                        className="flex items-center gap-2 text-xs hover:text-red-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        {tf("dashboard_login")}
                    </a>
                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            className="underline hover:text-red-500 transition-colors"
                            onClick={() => setModalType("terms")}
                            type="button"
                        >
                            {t("Register.terms_link")}
                        </button>
                        <button
                            className="underline hover:text-red-500 transition-colors"
                            onClick={() => setModalType("privacy")}
                            type="button"
                        >
                            {t("Register.privacy_link")}
                        </button>
                    </div>
                </div>

                {/* Ayırıcı Çizgi */}
                <div className="border-t border-gray-300"></div>

                {/* Copyright - En Altta */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-[11px] text-gray-500">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <span>© {year} Olympos Hard Enduro. {tf("copyright")}</span>
                        <span className="max-w-xs md:max-w-none opacity-70">
                            {tf("disclaimer")}
                        </span>
                    </div>
                    <div className="whitespace-nowrap">
                        {tf("powered_by")} <span className="font-semibold text-red-500 tracking-wider">ANTAWARE Studio</span>
                    </div>
                </div>

                {/* Modal */}
                {modalType && (
                    <TermsModal
                        type={modalType}
                        onClose={() => setModalType(null)}
                        onAccept={() => setModalType(null)}
                    />
                )}
            </div>
        </footer>
    );
}