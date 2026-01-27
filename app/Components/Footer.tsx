"use client";
import { useState } from "react";
import TermsModal from "./TermsModal";
import { useTranslations } from "next-intl";

export default function Footer() {
    const year = new Date().getFullYear();
    const email = "info@olymposhardenduro.com";
    const subject = encodeURIComponent("OlymposEnduro26 - Bilgi Talebi");
    const mailtoLink = `mailto:${email}?subject=${subject}`;
    const t = useTranslations();

    const [modalType, setModalType] = useState<null | "terms" | "privacy">(null);

    return (
        <footer id="contact" className="w-full bg-gray-100 border-t border-gray-300 py-8 mt-10">
            <div className="max-w-7xl mx-auto px-4 flex flex-col gap-6 text-gray-700 text-xs">
                {/* Üst Satır: İletişim ve Sosyal Medya */}
                <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 border-b border-gray-300 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="font-bold text-gray-800 flex items-center">
                            {t("Navbar.contact")} :
                        </div>
                        <a
                            href={mailtoLink}
                            className="flex items-center hover:text-red-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{email}</span>
                        </a>
                        <div className="flex items-center gap-4">
                            <a href="https://instagram.com/hardenduro_olympos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <span>Instagram</span>
                            </a>
                            <a href="https://youtube.com/@olymposhardenduro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <span>YouTube</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Alt Satır: Bilgilendirme ve Copyright */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-6">
                        <span>© {year} Olympos Hard Enduro. All rights reserved.</span>
                        <span className="max-w-xs md:max-w-none text-[10px] md:text-xs opacity-70">
                            This site does not constitute a legal contract. For legal information, please contact the organization.
                        </span>
                    </div>
                    <div className="whitespace-nowrap">
                        Powered by <span className="font-bold text-red-500 tracking-wider">ANTAWARE Studio</span>
                    </div>
                </div>

                {/* Admin Link */}
                <div className="flex justify-start gap-4">
                    <a
                        href="/admin"
                        className="flex items-center gap-2 text-xs underline hover:text-red-500 transition-colors"
                    >
                        Dashboard Login
                    </a>

                {/* Sözleşme Linkleri */}
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