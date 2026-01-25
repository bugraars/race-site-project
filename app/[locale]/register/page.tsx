"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendVerificationCode, verifyCode, registerRacer, fetchAvailableBibNumbers } from "@/lib/api";
import ReactCountryFlag from "react-country-flag";
import CreditCardInput, { CardData } from "@/app/Components/CreditCardInput";
import TermsModal from "@/app/Components/TermsModal";
import { useTranslations } from "next-intl";

// Popüler ülke kodları
const countryCodes = [
  { code: "TR", dial: "+90", name: "Türkiye" },
  { code: "DE", dial: "+49", name: "Germany" },
  { code: "GB", dial: "+44", name: "United Kingdom" },
  { code: "US", dial: "+1", name: "United States" },
  { code: "NL", dial: "+31", name: "Netherlands" },
  { code: "FR", dial: "+33", name: "France" },
  { code: "IT", dial: "+39", name: "Italy" },
  { code: "ES", dial: "+34", name: "Spain" },
  { code: "AT", dial: "+43", name: "Austria" },
  { code: "BE", dial: "+32", name: "Belgium" },
  { code: "CH", dial: "+41", name: "Switzerland" },
  { code: "PL", dial: "+48", name: "Poland" },
  { code: "CZ", dial: "+420", name: "Czech Republic" },
  { code: "RO", dial: "+40", name: "Romania" },
  { code: "BG", dial: "+359", name: "Bulgaria" },
  { code: "GR", dial: "+30", name: "Greece" },
  { code: "RU", dial: "+7", name: "Russia" },
  { code: "UA", dial: "+380", name: "Ukraine" },
];

// Kan grupları
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];

// Tişört bedenleri
const tshirtSizes = ["S", "M", "L", "XL", "XXL"];

// Utility: Map BE error message to translation key
const errorMessageToKey = (msg: string) => {
  if (!msg) return "unknown_error";
  if (msg.includes("already taken")) return "bib_taken";
  if (msg.includes("already registered")) return "email_registered";
  if (msg.includes("Invalid email format")) return "invalid_email";
  if (msg.includes("Email not verified")) return "email_not_verified";
  if (msg.includes("Failed to send email")) return "email_send_error";
  if (msg.includes("Invalid code")) return "code_error";
  if (msg.includes("Registration failed")) return "registration_error";
  return "unknown_error";
};

export default function RegisterPage() {
  const t = useTranslations("Register");
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [availableBibNumbers, setAvailableBibNumbers] = useState<number[]>([]);
  const [showTermsModal, setShowTermsModal] = useState<"terms" | "privacy" | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [assignedBibNumber, setAssignedBibNumber] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "redirecting" | "processing" | "success" | "error">("idle");
  const [traceId, setTraceId] = useState<string>("");

  const [formData, setFormData] = useState({
    email: "", 
    firstName: "", 
    lastName: "", 
    phoneCountry: "TR",
    phoneNumber: "",
    emergencyPhoneCountry: "TR",
    emergencyPhoneNumber: "",
    idNumber: "", 
    birthDate: "", 
    nationality: "TR",
    bloodType: "",
    tshirtSize: "",
    bibNumber: "",
    paymentMethod: "" as "" | "BANK_TRANSFER" | "CREDIT_CARD",
    agreedToTerms: false,
    agreedToPrivacy: false,
  });

  const next = () => setStep((s) => s + 1);

  // Müsait bib numaralarını yükle
  useEffect(() => {
    const loadBibNumbers = async () => {
      const result = await fetchAvailableBibNumbers();
      if (result.success && result.data) {
        setAvailableBibNumbers(result.data);
      }
    };
    loadBibNumbers();
  }, []);

  // Telefon numarasını birleştir
  const getFullPhone = (countryCode: string, number: string) => {
    if (!number) return undefined;
    const country = countryCodes.find(c => c.code === countryCode);
    return country ? `${country.dial}${number}` : number;
  };

  // Adım 1: Email doğrulama kodu gönder
  const handleStep1 = async () => {
    setLoading(true);
    setError("");
    const result = await sendVerificationCode(formData.email);
    if (result.success) {
      next();
    } else {
      setError(t(errorMessageToKey(result.error ?? result.message ?? "")));
    }
    setLoading(false);
  };

  // Adım 2: Kodu doğrula
  const handleStep2 = async () => {
    setLoading(true);
    setError("");
    const result = await verifyCode(formData.email, enteredCode);
    if (result.success) {
      next();
    } else {
      setError(t(errorMessageToKey(result.error ?? result.message ?? "")));
    }
    setLoading(false);
  };

  // Adım 4: Kaydı tamamla
  const handleRegister = async () => {
    setLoading(true);
    setError("");
    const result = await registerRacer({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: getFullPhone(formData.phoneCountry, formData.phoneNumber),
      emergencyPhone: getFullPhone(formData.emergencyPhoneCountry, formData.emergencyPhoneNumber),
      idNumber: formData.idNumber || undefined,
      birthDate: formData.birthDate || undefined,
      nationality: formData.nationality || undefined,
      bloodType: formData.bloodType || undefined,
      tshirtSize: formData.tshirtSize || undefined,
      bibNumber: formData.bibNumber || undefined,
      paymentMethod: formData.paymentMethod || undefined,
      agreedToTerms: formData.agreedToTerms,
      agreedToPrivacy: formData.agreedToPrivacy,
    });
    if (result.success) {
      if (result.data?.bibNumber) {
        setAssignedBibNumber(result.data.bibNumber);
      }
      next();
    } else {
      setError(t(errorMessageToKey(result.error ?? result.message ?? "")));
    }
    setLoading(false);
  };

  // Ödeme başlat
  const handlePayment = async () => {
    if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
      setError(t("terms_required"));
      return;
    }
    if (!formData.paymentMethod) {
      setError(t("payment_method_required"));
      return;
    }
    
    // Trace ID oluştur
    const newTraceId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setTraceId(newTraceId);
    
    if (formData.paymentMethod === "CREDIT_CARD") {
      if (!cardData) {
        setError(t("card_required"));
        return;
      }
      
      // Bankaya yönlendirme simülasyonu
      setPaymentState("redirecting");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ödeme işleniyor simülasyonu
      setPaymentState("processing");
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // %90 başarı şansı
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentState("success");
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleRegister();
      } else {
        setPaymentState("error");
      }
    } else {
      // Banka havalesi - direkt kaydet
      handleRegister();
    }
  };

  // Ödeme durumunu sıfırla
  const resetPaymentState = () => {
    setPaymentState("idle");
    setError("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 pt-24 sm:pt-32">
      <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-4 sm:p-8 rounded-2xl sm:rounded-[2rem]">
        {error && <div className="p-4 mb-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500 text-sm">{error}</div>}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">{t("step1_title")}</h2>
              <input 
                className="w-full bg-black border border-zinc-800 h-14 px-4 rounded-xl outline-none focus:border-red-500"
                placeholder={t("email_placeholder")} value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <button onClick={handleStep1} disabled={loading || !formData.email} className="w-full bg-red-500 h-14 text-white font-black uppercase italic rounded-xl disabled:opacity-50">
                {loading ? t("sending") : t("send_code")}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">{t("step2_title")}</h2>
              <input 
                className="w-full bg-black border border-zinc-800 h-14 px-4 rounded-xl text-center text-2xl font-mono tracking-widest outline-none focus:border-red-500"
                placeholder={t("code_placeholder")} maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
              />
              <button onClick={handleStep2} disabled={loading || enteredCode.length !== 6} className="w-full bg-red-500 h-14 text-white font-black uppercase italic rounded-xl disabled:opacity-50">
                {loading ? t("verifying") : t("verify_code")}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">{t("step3_title")}</h2>
              
              {/* Ad Soyad - Mobilde alt alta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  placeholder={t("first_name")} 
                  value={formData.firstName}
                  className="bg-black h-14 px-4 rounded-xl border border-zinc-800 focus:border-red-500 outline-none" 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                />
                <input 
                  placeholder={t("last_name")} 
                  value={formData.lastName}
                  className="bg-black h-14 px-4 rounded-xl border border-zinc-800 focus:border-red-500 outline-none" 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                />
              </div>

              {/* TC / Pasaport & Kan Grubu - Mobilde alt alta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input 
                  placeholder={t("id_number")} 
                  value={formData.idNumber}
                  className="sm:col-span-2 bg-black h-14 px-4 rounded-xl border border-zinc-800 focus:border-red-500 outline-none" 
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})} 
                />
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                  className="bg-black h-14 px-4 pr-10 rounded-xl border border-zinc-800 focus:border-red-500 outline-none text-left appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23888%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]"
                >
                  <option value="">{t("blood_type")}</option>
                  {bloodTypes.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              {/* Doğum Tarihi & Uyruk - Mobilde alt alta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="text-zinc-500 text-xs mb-1 block">{t("birth_date")}</label>
                  <input 
                    type="date" 
                    value={formData.birthDate}
                    className="w-full bg-black h-14 px-3 sm:px-4 rounded-xl border border-zinc-800 text-zinc-400 focus:border-red-500 outline-none [color-scheme:dark] text-sm sm:text-base" 
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-zinc-500 text-xs mb-1 block">{t("nationality")}</label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full bg-black h-14 px-4 pr-10 rounded-xl border border-zinc-800 focus:border-red-500 outline-none appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23888%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Telefon */}
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">{t("phone")}</label>
                <div className="flex gap-0">
                  <div className="flex items-center bg-black h-14 px-3 rounded-l-xl border border-r-0 border-zinc-800 gap-2 shrink-0">
                    <ReactCountryFlag countryCode={formData.phoneCountry} svg style={{ width: '1.2em', height: '1.2em' }} />
                    <select
                      value={formData.phoneCountry}
                      onChange={(e) => setFormData({...formData, phoneCountry: e.target.value})}
                      className="bg-transparent outline-none text-sm cursor-pointer"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.dial}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="tel"
                    placeholder={t("phone_placeholder")}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '')})}
                    className="flex-1 min-w-0 bg-black h-14 px-4 rounded-r-xl border border-zinc-800 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Acil Telefon */}
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">{t("emergency_phone")}</label>
                <div className="flex gap-0">
                  <div className="flex items-center bg-black h-14 px-3 rounded-l-xl border border-r-0 border-zinc-800 gap-2 shrink-0">
                    <ReactCountryFlag countryCode={formData.emergencyPhoneCountry} svg style={{ width: '1.2em', height: '1.2em' }} />
                    <select
                      value={formData.emergencyPhoneCountry}
                      onChange={(e) => setFormData({...formData, emergencyPhoneCountry: e.target.value})}
                      className="bg-transparent outline-none text-sm cursor-pointer"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.dial}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="tel"
                    placeholder={t("phone_placeholder")}
                    value={formData.emergencyPhoneNumber}
                    onChange={(e) => setFormData({...formData, emergencyPhoneNumber: e.target.value.replace(/\D/g, '')})}
                    className="flex-1 min-w-0 bg-black h-14 px-4 rounded-r-xl border border-zinc-800 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={next} 
                disabled={!formData.firstName || !formData.lastName}
                className="w-full bg-white text-black font-black h-14 rounded-xl uppercase italic disabled:opacity-50"
              >
                {t("next_step")}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">{t("step4_title")}</h2>
              
              {/* Tişört Bedeni */}
              <div>
                <label className="text-zinc-500 text-xs mb-2 block">{t("tshirt_size")}</label>
                <div className="grid grid-cols-5 gap-2">
                  {tshirtSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({...formData, tshirtSize: size})}
                      className={`h-12 rounded-xl border font-bold transition-all ${
                        formData.tshirtSize === size 
                          ? 'bg-red-500 border-red-500 text-white' 
                          : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Yarışçı Numarası */}
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">{t("bib_number")}</label>
                <select
                  value={formData.bibNumber}
                  onChange={(e) => setFormData({...formData, bibNumber: e.target.value})}
                  className="w-full bg-black h-14 px-4 pr-10 rounded-xl border border-zinc-800 focus:border-red-500 outline-none appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23888%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]"
                >
                  <option value="">{t("select_number")}</option>
                  {availableBibNumbers.map((num) => (
                    <option key={num} value={String(num)}>{num} {t("number_suffix")}</option>
                  ))}
                </select>
                <p className="text-zinc-600 text-xs mt-1">{t("available_numbers_hint")}</p>
              </div>

              <button 
                onClick={next} 
                disabled={!formData.tshirtSize || !formData.bibNumber}
                className="w-full bg-white text-black font-black h-14 rounded-xl uppercase italic disabled:opacity-50"
              >
                {t("go_to_payment")}
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">{t("step5_title")}</h2>

              {/* Loading States */}
              {paymentState !== "idle" && paymentState !== "error" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                >
                  <div className="text-center p-8">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {paymentState === "redirecting" && t("redirecting_bank")}
                      {paymentState === "processing" && t("checking_payment")}
                      {paymentState === "success" && t("payment_success")}
                    </h3>
                    <p className="text-zinc-500 text-sm">
                      {paymentState === "redirecting" && t("redirecting_wait")}
                      {paymentState === "processing" && t("checking_wait")}
                      {paymentState === "success" && t("completing_registration")}
                    </p>
                    <p className="text-zinc-600 text-xs mt-4">Trace ID: {traceId}</p>
                  </div>
                </motion.div>
              )}

              {/* Payment Error State */}
              {paymentState === "error" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center"
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">✕</div>
                  <h3 className="text-lg font-bold text-red-500 mb-2">{t("payment_failed")}</h3>
                  <p className="text-zinc-400 text-sm mb-2">{t("payment_failed_desc")}</p>
                  <p className="text-zinc-600 text-xs mb-4">Trace ID: {traceId}</p>
                  <button 
                    onClick={resetPaymentState}
                    className="bg-zinc-800 text-white px-6 py-2 rounded-lg text-sm font-semibold"
                  >
                    {t("try_again")}
                  </button>
                </motion.div>
              )}

              {paymentState === "idle" && (
                <>
                  {/* Toplam */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">{t("race_fee")}</span>
                      <span className="text-2xl font-black text-red-500 italic">10.000₺</span>
                    </div>
                  </div>

                  {/* Sözleşme Onayları - Tıklayınca modal açılır */}
                  <div className="space-y-3">
                    <div 
                      onClick={() => setShowTermsModal("terms")}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.agreedToTerms 
                          ? 'bg-green-500/10 border-green-500' 
                          : 'bg-black border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        formData.agreedToTerms ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                      }`}>
                        {formData.agreedToTerms && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm text-zinc-300">
                        <span className="text-red-500 underline">{t("terms_link")}</span>
                        &apos;{t("terms_agreement")}
                      </span>
                    </div>

                    <div 
                      onClick={() => setShowTermsModal("privacy")}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.agreedToPrivacy 
                          ? 'bg-green-500/10 border-green-500' 
                          : 'bg-black border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        formData.agreedToPrivacy ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                      }`}>
                        {formData.agreedToPrivacy && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm text-zinc-300">
                        <span className="text-red-500 underline">{t("privacy_link")}</span>
                        &apos;{t("terms_agreement")}
                      </span>
                    </div>
                  </div>

                  {/* Ödeme Yöntemi - Accordion Style */}
                  <div>
                    <label className="text-zinc-500 text-xs mb-2 block">{t("payment_method")}</label>
                    <div className="space-y-2">
                      {/* Havale/EFT Accordion */}
                      <div className={`rounded-xl border overflow-hidden transition-all ${
                        formData.paymentMethod === 'BANK_TRANSFER' 
                          ? 'border-red-500' 
                          : 'border-zinc-800'
                      }`}>
                        <div 
                          onClick={() => setFormData({...formData, paymentMethod: formData.paymentMethod === 'BANK_TRANSFER' ? '' : 'BANK_TRANSFER'})}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                            formData.paymentMethod === 'BANK_TRANSFER' 
                              ? 'bg-red-500/10' 
                              : 'bg-black hover:bg-zinc-900'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentMethod === 'BANK_TRANSFER' ? 'border-red-500' : 'border-zinc-600'
                          }`}>
                            {formData.paymentMethod === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold block">{t("bank_transfer")}</span>
                            <span className="text-zinc-500 text-xs">{t("bank_transfer_desc")}</span>
                          </div>
                          <svg className={`w-5 h-5 text-zinc-500 transition-transform ${formData.paymentMethod === 'BANK_TRANSFER' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {/* Bank Details Accordion Content */}
                        <motion.div
                          initial={false}
                          animate={{ height: formData.paymentMethod === 'BANK_TRANSFER' ? 'auto' : 0, opacity: formData.paymentMethod === 'BANK_TRANSFER' ? 1 : 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-3">
                            <div className="bg-zinc-950 p-4 rounded-lg space-y-2 text-zinc-300 text-xs sm:text-sm">
                              <p><span className="text-zinc-500">{t("bank_name")}:</span> Vakıf Bank</p>
                              <p><span className="text-zinc-500">{t("branch")}:</span> Kemer / Antalya Şubesi (392)</p>
                              <p><span className="text-zinc-500">{t("account_no")}:</span> 00158007366826204</p>
                              <p className="break-all"><span className="text-zinc-500">IBAN:</span> TR62 0001 5001 5800 7366 8262 04</p>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                              <p className="text-red-400 text-xs font-semibold">
                                ⚠️ {t("bank_warning")} <span className="text-red-500 font-bold">{formData.firstName} {formData.lastName}</span>
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Kredi Kartı Accordion */}
                      <div className={`rounded-xl border overflow-hidden transition-all ${
                        formData.paymentMethod === 'CREDIT_CARD' 
                          ? 'border-red-500' 
                          : 'border-zinc-800'
                      }`}>
                        <div 
                          onClick={() => setFormData({...formData, paymentMethod: formData.paymentMethod === 'CREDIT_CARD' ? '' : 'CREDIT_CARD'})}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                            formData.paymentMethod === 'CREDIT_CARD' 
                              ? 'bg-red-500/10' 
                              : 'bg-black hover:bg-zinc-900'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentMethod === 'CREDIT_CARD' ? 'border-red-500' : 'border-zinc-600'
                          }`}>
                            {formData.paymentMethod === 'CREDIT_CARD' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold block">{t("credit_card")}</span>
                            <span className="text-zinc-500 text-xs">{t("credit_card_desc")}</span>
                          </div>
                          <svg className={`w-5 h-5 text-zinc-500 transition-transform ${formData.paymentMethod === 'CREDIT_CARD' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {/* Credit Card Form Accordion Content */}
                        <motion.div
                          initial={false}
                          animate={{ height: formData.paymentMethod === 'CREDIT_CARD' ? 'auto' : 0, opacity: formData.paymentMethod === 'CREDIT_CARD' ? 1 : 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0">
                            <CreditCardInput
                              onValidCard={setCardData}
                              onClose={() => setFormData({...formData, paymentMethod: ''})}
                              onSubmit={() => {}}
                              isProcessing={loading}
                              isInline={true}
                            />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Kart bilgisi hata mesajı */}
                  {formData.paymentMethod === 'CREDIT_CARD' && !cardData && (
                    <div className="bg-red-500/10 border border-red-500 rounded-xl p-4">
                      <p className="text-red-500 text-sm text-center font-semibold">⚠️ {t("invalid_card")}</p>
                    </div>
                  )}

                  <button 
                    onClick={handlePayment} 
                    disabled={loading || !formData.agreedToTerms || !formData.agreedToPrivacy || !formData.paymentMethod || (formData.paymentMethod === 'CREDIT_CARD' && !cardData)}
                    className="w-full bg-red-500 h-14 text-white font-black rounded-xl uppercase italic disabled:opacity-50"
                  >
                    {loading ? t("processing") : t("complete_registration")}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white text-3xl mb-4">✓</div>
                <h2 className="text-2xl sm:text-3xl font-black italic uppercase">{t("registration_complete")}</h2>
                {assignedBibNumber && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-xl">
                    <p className="text-zinc-400 text-sm">{t("your_bib_number")}</p>
                    <p className="text-4xl font-black text-red-500 italic">{assignedBibNumber} {t("number_suffix")}</p>
                  </div>
                )}
                <p className="text-zinc-500 mt-4 text-sm sm:text-base">
                  {formData.paymentMethod === 'CREDIT_CARD' 
                    ? t("payment_received")
                    : t("awaiting_payment")
                  }
                </p>
              </div>

              {/* Havale seçilmişse banka bilgilerini göster */}
              {formData.paymentMethod === 'BANK_TRANSFER' && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-bold text-red-500 uppercase">{t("payment_info")}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t("total_amount")}:</span>
                      <span className="font-bold text-white">10.000₺</span>
                    </div>
                    
                    <hr className="border-zinc-800" />
                    
                    <div className="space-y-2">
                      <p className="text-zinc-400 font-semibold">{t("bank_details")}</p>
                      <div className="bg-black p-4 rounded-lg space-y-2 text-zinc-300 text-xs sm:text-sm">
                        <p><span className="text-zinc-500">{t("bank_name")}:</span> Vakıf Bank</p>
                        <p><span className="text-zinc-500">{t("branch")}:</span> Kemer / Antalya Şubesi (392)</p>
                        <p><span className="text-zinc-500">{t("account_no")}:</span> 00158007366826204</p>
                        <p className="break-all"><span className="text-zinc-500">IBAN:</span> TR62 0001 5001 5800 7366 8262 04</p>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-400 text-xs font-semibold">
                        ⚠️ {t("bank_warning")} <span className="text-red-500 font-bold">{formData.firstName} {formData.lastName}</span>
                      </p>
                    </div>
                    <p className="text-zinc-500 text-xs">
                      * {t("payment_confirmation_note")}
                    </p>
                  </div>
                </div>
              )}

              <button onClick={() => window.location.href="/"} className="w-full bg-zinc-800 text-white font-bold p-4 rounded-xl uppercase">
                {t("go_home")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sözleşme Modalleri */}
      <AnimatePresence>
        {showTermsModal && (
          <TermsModal
            type={showTermsModal}
            onClose={() => setShowTermsModal(null)}
            onAccept={() => {
              if (showTermsModal === "terms") {
                setFormData({...formData, agreedToTerms: true});
              } else {
                setFormData({...formData, agreedToPrivacy: true});
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}