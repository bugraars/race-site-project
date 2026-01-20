"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendVerificationCode, verifyCode, registerRacer, fetchAvailableBibNumbers } from "@/lib/api";
import ReactCountryFlag from "react-country-flag";
import CreditCardInput, { CardData } from "@/app/Components/CreditCardInput";
import TermsModal from "@/app/Components/TermsModal";

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

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [availableBibNumbers, setAvailableBibNumbers] = useState<number[]>([]);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<"terms" | "privacy" | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [assignedBibNumber, setAssignedBibNumber] = useState<string | null>(null);

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
      setError(result.error || "Mail gönderilemedi.");
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
      setError(result.error || "Kod hatalı.");
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
      setError(result.error || "Kayıt başarısız.");
    }
    setLoading(false);
  };

  // Ödeme başlat
  const handlePayment = () => {
    if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
      setError("Sözleşmeleri kabul etmelisiniz.");
      return;
    }
    if (!formData.paymentMethod) {
      setError("Ödeme yöntemi seçiniz.");
      return;
    }
    
    if (formData.paymentMethod === "CREDIT_CARD") {
      setShowCreditCardModal(true);
    } else {
      // Banka havalesi - direkt kaydet
      handleRegister();
    }
  };

  // Kredi kartı ile ödeme tamamla
  const handleCreditCardPayment = () => {
    if (cardData) {
      setShowCreditCardModal(false);
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 pt-24 sm:pt-32">
      <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-4 sm:p-8 rounded-2xl sm:rounded-[2rem]">
        {error && <div className="p-4 mb-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500 text-sm">{error}</div>}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">Adım 1: Mail</h2>
              <input 
                className="w-full bg-black border border-zinc-800 h-14 px-4 rounded-xl outline-none focus:border-red-500"
                placeholder="E-posta" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <button onClick={handleStep1} disabled={loading || !formData.email} className="w-full bg-red-500 h-14 text-white font-black uppercase italic rounded-xl disabled:opacity-50">
                {loading ? "GÖNDERİLİYOR..." : "DOĞRULAMA KODU GÖNDER"}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">Adım 2: Onay</h2>
              <input 
                className="w-full bg-black border border-zinc-800 h-14 px-4 rounded-xl text-center text-2xl font-mono tracking-widest outline-none focus:border-red-500"
                placeholder="000000" maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
              />
              <button onClick={handleStep2} disabled={loading || enteredCode.length !== 6} className="w-full bg-red-500 h-14 text-white font-black uppercase italic rounded-xl disabled:opacity-50">
                {loading ? "DOĞRULANIYOR..." : "KODU ONAYLA"}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">Adım 3: Kimlik</h2>
              
              {/* Ad Soyad - Mobilde alt alta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  placeholder="Ad" 
                  value={formData.firstName}
                  className="bg-black h-14 px-4 rounded-xl border border-zinc-800 focus:border-red-500 outline-none" 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                />
                <input 
                  placeholder="Soyad" 
                  value={formData.lastName}
                  className="bg-black h-14 px-4 rounded-xl border border-zinc-800 focus:border-red-500 outline-none" 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                />
              </div>

              {/* TC / Pasaport & Kan Grubu - Mobilde alt alta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input 
                  placeholder="T.C. / Pasaport No" 
                  value={formData.idNumber}
                  className="sm:col-span-2 bg-black h-14 px-4 rounded-xl border border-zinc-800 focus:border-red-500 outline-none" 
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})} 
                />
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                  className="bg-black h-14 px-4 pr-10 rounded-xl border border-zinc-800 focus:border-red-500 outline-none text-left appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23888%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]"
                >
                  <option value="">Kan Grubu</option>
                  {bloodTypes.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              {/* Doğum Tarihi & Uyruk - Mobilde alt alta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-500 text-xs mb-1 block">Doğum Tarihi</label>
                  <input 
                    type="date" 
                    value={formData.birthDate}
                    className="w-full bg-black h-14 px-4 rounded-xl border border-zinc-800 text-zinc-400 focus:border-red-500 outline-none [color-scheme:dark]" 
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-zinc-500 text-xs mb-1 block">Uyruk / Nationality</label>
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
                <label className="text-zinc-500 text-xs mb-1 block">Telefon / Phone</label>
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
                    placeholder="5XX XXX XX XX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '')})}
                    className="flex-1 min-w-0 bg-black h-14 px-4 rounded-r-xl border border-zinc-800 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Acil Telefon */}
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">Acil Durum Telefonu / Emergency Phone</label>
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
                    placeholder="5XX XXX XX XX"
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
                SONRAKİ ADIM
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">Adım 4: Seçenekler</h2>
              
              {/* Tişört Bedeni */}
              <div>
                <label className="text-zinc-500 text-xs mb-2 block">Tişört Bedeni / T-Shirt Size</label>
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
                <label className="text-zinc-500 text-xs mb-1 block">Yarışçı Numarası / Bib Number</label>
                <select
                  value={formData.bibNumber}
                  onChange={(e) => setFormData({...formData, bibNumber: e.target.value})}
                  className="w-full bg-black h-14 px-4 pr-10 rounded-xl border border-zinc-800 focus:border-red-500 outline-none appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23888%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]"
                >
                  <option value="">Numara Seçin (Opsiyonel)</option>
                  {availableBibNumbers.map((num) => (
                    <option key={num} value={String(num)}>#{num}</option>
                  ))}
                </select>
                <p className="text-zinc-600 text-xs mt-1">* Boş bırakırsanız numara otomatik atanacaktır.</p>
              </div>

              <button 
                onClick={next} 
                disabled={!formData.tshirtSize}
                className="w-full bg-white text-black font-black h-14 rounded-xl uppercase italic disabled:opacity-50"
              >
                ÖDEMEYE GEÇ
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">Adım 5: Ödeme</h2>

              {/* Toplam */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Yarış Katılım Ücreti</span>
                  <span className="text-2xl font-black text-red-500 italic">10.000₺</span>
                </div>
              </div>

              {/* Sözleşme Onayları */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-black rounded-xl border border-zinc-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.agreedToTerms} 
                    onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})} 
                    className="accent-red-500 w-5 h-5 mt-0.5 shrink-0" 
                  />
                  <span className="text-sm text-zinc-300">
                    <button 
                      type="button"
                      onClick={() => setShowTermsModal("terms")}
                      className="text-red-500 underline hover:text-red-400"
                    >
                      Mesafeli Satış Sözleşmesi
                    </button>
                    &apos;ni okudum ve kabul ediyorum.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 bg-black rounded-xl border border-zinc-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.agreedToPrivacy} 
                    onChange={(e) => setFormData({...formData, agreedToPrivacy: e.target.checked})} 
                    className="accent-red-500 w-5 h-5 mt-0.5 shrink-0" 
                  />
                  <span className="text-sm text-zinc-300">
                    <button 
                      type="button"
                      onClick={() => setShowTermsModal("privacy")}
                      className="text-red-500 underline hover:text-red-400"
                    >
                      Gizlilik Politikası ve KVKK Aydınlatma Metni
                    </button>
                    &apos;ni okudum ve kabul ediyorum.
                  </span>
                </label>
              </div>

              {/* Ödeme Yöntemi */}
              <div>
                <label className="text-zinc-500 text-xs mb-2 block">Ödeme Yöntemi / Payment Method</label>
                <div className="space-y-2">
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'BANK_TRANSFER' 
                        ? 'bg-red-500/10 border-red-500' 
                        : 'bg-black border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setFormData({...formData, paymentMethod: 'BANK_TRANSFER'})}
                      className="accent-red-500 w-5 h-5" 
                    />
                    <div>
                      <span className="font-semibold block">Havale / EFT</span>
                      <span className="text-zinc-500 text-xs">Banka bilgileri sonraki sayfada gösterilecek</span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'CREDIT_CARD' 
                        ? 'bg-red-500/10 border-red-500' 
                        : 'bg-black border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="CREDIT_CARD"
                      checked={formData.paymentMethod === 'CREDIT_CARD'}
                      onChange={() => setFormData({...formData, paymentMethod: 'CREDIT_CARD'})}
                      className="accent-red-500 w-5 h-5" 
                    />
                    <div>
                      <span className="font-semibold block">Kredi / Banka Kartı</span>
                      <span className="text-zinc-500 text-xs">Visa, Mastercard, Troy</span>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={loading || !formData.agreedToTerms || !formData.agreedToPrivacy || !formData.paymentMethod}
                className="w-full bg-red-500 h-14 text-white font-black rounded-xl uppercase italic disabled:opacity-50"
              >
                {loading ? "İŞLENİYOR..." : formData.paymentMethod === 'CREDIT_CARD' ? "KART BİLGİLERİ" : "KAYDI TAMAMLA"}
              </button>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white text-3xl mb-4">✓</div>
                <h2 className="text-2xl sm:text-3xl font-black italic uppercase">KAYIT TAMAM!</h2>
                {assignedBibNumber && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-xl">
                    <p className="text-zinc-400 text-sm">Yarışçı Numaranız</p>
                    <p className="text-4xl font-black text-red-500 italic">#{assignedBibNumber}</p>
                  </div>
                )}
                <p className="text-zinc-500 mt-4 text-sm sm:text-base">
                  {formData.paymentMethod === 'CREDIT_CARD' 
                    ? "Ödemeniz alınmıştır. Yarış detayları e-posta adresinize gönderilecektir."
                    : "Kaydınız alınmıştır. Ödeme sonrası yarışçı numaranız e-posta adresinize gönderilecektir."
                  }
                </p>
              </div>

              {/* Havale seçilmişse banka bilgilerini göster */}
              {formData.paymentMethod === 'BANK_TRANSFER' && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-bold text-red-500 uppercase">Ödeme Bilgileri / Payment Info</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Toplam Tutar:</span>
                      <span className="font-bold text-white">10.000₺</span>
                    </div>
                    
                    <hr className="border-zinc-800" />
                    
                    <div className="space-y-2">
                      <p className="text-zinc-400 font-semibold">EFT / Havale Bilgileri:</p>
                      <div className="bg-black p-4 rounded-lg space-y-2 text-zinc-300 text-xs sm:text-sm">
                        <p><span className="text-zinc-500">Banka:</span> Vakıf Bank</p>
                        <p><span className="text-zinc-500">Şube:</span> Kemer / Antalya Şubesi (392)</p>
                        <p><span className="text-zinc-500">Hesap No:</span> 00158007366826204</p>
                        <p className="break-all"><span className="text-zinc-500">IBAN:</span> TR62 0001 5001 5800 7366 8262 04</p>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-400 text-xs font-semibold">
                        ⚠️ Açıklama kısmına tam isim soyisim yazılmalıdır: <span className="text-red-500 font-bold">{formData.firstName} {formData.lastName}</span>
                      </p>
                    </div>
                    <p className="text-zinc-500 text-xs">
                      * Ödemeniz onaylandığında yarışçı numaranız e-posta ile gönderilecektir.
                    </p>
                  </div>
                </div>
              )}

              <button onClick={() => window.location.href="/"} className="w-full bg-zinc-800 text-white font-bold p-4 rounded-xl uppercase">
                Anasayfaya Dön
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Kredi Kartı Modal */}
      <AnimatePresence>
        {showCreditCardModal && (
          <CreditCardInput
            onValidCard={setCardData}
            onClose={() => setShowCreditCardModal(false)}
            onSubmit={handleCreditCardPayment}
            isProcessing={loading}
          />
        )}
      </AnimatePresence>

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