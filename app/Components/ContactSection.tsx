"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://t8wdcqtmvn.eu-central-1.awsapprunner.com';

export default function ContactSection() {
    const t = useTranslations();
    const tc = useTranslations('Contact');
    const [senderEmail, setSenderEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const email = "info@olymposhardenduro.com";

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Doğrulama kodu gönder
    const handleSendCode = async () => {
        if (!senderEmail || !senderEmail.includes('@')) {
            setStatus({ type: 'error', message: tc('invalid_email') });
            return;
        }
        
        setSendingCode(true);
        setStatus(null);
        
        try {
            const response = await fetch(`${API_URL}/contact/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: senderEmail.trim() }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                setCodeSent(true);
                // Status'u null bırak - info alanı otomatik gösterecek
            } else {
                setStatus({ type: 'error', message: data.message || tc('code_send_failed') });
            }
        } catch (error) {
            setStatus({ type: 'error', message: tc('connection_error') });
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setStatus(null);
        
        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: senderEmail.trim(),
                    code: verificationCode.trim(),
                    message: message.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus({ type: 'success', message: tc('message_success') });
                // 5 saniye sonra formu sıfırla
                setTimeout(() => {
                    setSenderEmail("");
                    setVerificationCode("");
                    setMessage("");
                    setCodeSent(false);
                    setStatus(null);
                }, 5000);
            } else {
                setStatus({ type: 'error', message: data.message || tc('message_failed') });
            }
        } catch (error) {
            setStatus({ type: 'error', message: tc('connection_error_retry') });
        } finally {
            setSending(false);
        }
    };

    return (
        <section id="contact" className="w-full py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Title */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-800 italic uppercase tracking-tighter mb-2">
                        {t("Navbar.contact")}
                    </h2>
                    <p className="text-zinc-400 font-bold tracking-widest uppercase">
                        {tc("subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* İletişim Formu */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col h-full">
                        <div className="flex flex-col md:flex-row items-center md:justify-between mb-3 gap-1">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {tc("send_message")}
                            </h3>
                            {/* Email - Copyable */}
                            <div className="flex items-center gap-1.5 text-sm">
                                <span className="font-bold text-gray-800">{email}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyEmail}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                    title={tc("copy")}
                                >
                                    {copied ? (
                                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
                            {/* Email + Kod Gönder */}
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={senderEmail}
                                    onChange={(e) => setSenderEmail(e.target.value)}
                                    placeholder={tc("email_placeholder")}
                                    required
                                    disabled={codeSent}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={sendingCode || codeSent || !senderEmail}
                                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                                >
                                    {sendingCode ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="hidden sm:inline">{tc("sending")}</span>
                                        </>
                                    ) : codeSent ? (
                                        <>
                                            <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="hidden sm:inline">{tc("sent")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">{tc("send_code")}</span>
                                            <span className="sm:hidden">{tc("verify")}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Doğrulama Kodu */}
                            {codeSent && (
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="● ● ● ● ● ●"
                                    required
                                    maxLength={6}
                                    className="w-full h-14 px-4 border border-gray-300 rounded-xl text-gray-900 text-2xl font-mono tracking-widest text-center focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                />
                            )}
                            
                            {/* Message */}
                            <div className="relative flex-1">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value.slice(0, 256))}
                                    placeholder={tc("message_placeholder")}
                                    required
                                    maxLength={256}
                                    className="w-full h-full min-h-[100px] px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                                />
                                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                                    {message.length}/256
                                </span>
                            </div>
                            
                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={sending || !senderEmail || !verificationCode || !message || verificationCode.length !== 6}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {tc("sending_message")}
                                    </>
                                ) : (
                                    tc("send")
                                )}
                            </button>

                            {/* Status / Info Message */}
                            <div className={`p-3 rounded-lg text-sm text-center ${
                                status?.type === 'success' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : status?.type === 'error'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                                {status?.type === 'success' ? (
                                    status.message
                                ) : status?.type === 'error' ? (
                                    status.message
                                ) : codeSent ? (
                                    tc("code_info")
                                ) : (
                                    tc("verification_required")
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Sosyal Medya */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {tc("social_media")}
                        </h3>
                        
                        <div className="flex flex-col gap-3 flex-1 justify-center">
                            {/* Instagram */}
                            <a 
                                href="https://instagram.com/hardenduro_olympos" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl text-white hover:opacity-90 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                <div>
                                    <p className="font-semibold">Instagram</p>
                                    <p className="text-sm opacity-90">@hardenduro_olympos</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            
                            {/* YouTube */}
                            <a 
                                href="https://youtube.com/@olymposhardenduro" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-red-600 rounded-xl text-white hover:bg-red-700 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                <div>
                                    <p className="font-semibold">YouTube</p>
                                    <p className="text-sm opacity-90">@olymposhardenduro</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            
                            {/* Email */}
                            <a 
                                href={`mailto:${email}`}
                                className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl text-white hover:bg-gray-900 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="font-semibold">{tc("email_label")}</p>
                                    <p className="text-sm opacity-90">{email}</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
