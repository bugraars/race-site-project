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
                
                {/* İletişim Bölümü */}
                <div className="flex flex-col items-center text-center md:flex-row md:justify-center md:text-left gap-3 md:gap-6 border-b border-gray-300 pb-5">
                    <div className="font-bold text-gray-800 text-sm">
                        {t("Navbar.contact")}
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
                        <a
                            href={mailtoLink}
                            className="flex items-center gap-2 hover:text-red-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{email}</span>
                        </a>
                        <a href="https://instagram.com/hardenduro_olympos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span>Instagram</span>
                        </a>
                        <a href="https://youtube.com/@olymposhardenduro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                            <span>YouTube</span>
                        </a>
                    </div>
                </div>

                {/* Dashboard Login ve Sözleşmeler */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 border-b border-gray-300 pb-5">
                    <a
                        href="/admin"
                        className="flex items-center gap-2 text-xs hover:text-red-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Dashboard Login
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

                {/* Copyright - En Altta */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-[11px] text-gray-500">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <span>© {year} Olympos Hard Enduro. All rights reserved.</span>
                        <span className="max-w-xs md:max-w-none opacity-70">
                            This site does not constitute a legal contract.
                        </span>
                    </div>
                    <div className="whitespace-nowrap">
                        Powered by <span className="font-semibold text-red-500 tracking-wider">ANTAWARE Studio</span>
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