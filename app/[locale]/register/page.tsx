"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendVerificationCode, verifyCode, registerRacer } from "@/lib/api";
import ReactCountryFlag from "react-country-flag";

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

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

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
    needsTransfer: false, 
    needsBikeRental: false,
  });

  const next = () => setStep((s) => s + 1);

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
      needsTransfer: formData.needsTransfer,
      needsBikeRental: formData.needsBikeRental,
    });
    if (result.success) {
      next();
    } else {
      setError(result.error || "Kayıt başarısız.");
    }
    setLoading(false);
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
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-red-500">Adım 4: Hizmetler</h2>
              <div className="space-y-2">
                <label className="flex items-center justify-between h-14 px-4 bg-black rounded-xl border border-zinc-800 cursor-pointer">
                  <span className="text-sm sm:text-base">Havalimanı Transfer (€50)</span>
                  <input type="checkbox" checked={formData.needsTransfer} onChange={(e) => setFormData({...formData, needsTransfer: e.target.checked})} className="accent-red-500 w-5 h-5" />
                </label>
                <label className="flex items-center justify-between h-14 px-4 bg-black rounded-xl border border-zinc-800 cursor-pointer">
                  <span className="text-sm sm:text-base">Motosiklet Kiralama (€250)</span>
                  <input type="checkbox" checked={formData.needsBikeRental} onChange={(e) => setFormData({...formData, needsBikeRental: e.target.checked})} className="accent-red-500 w-5 h-5" />
                </label>
              </div>
              <div className="h-14 px-4 bg-zinc-950 rounded-xl flex items-center justify-end gap-4">
                <span className="text-zinc-500 uppercase text-xs font-bold">Toplam:</span>
                <span className="text-2xl font-black text-red-500 italic">€{450 + (formData.needsTransfer ? 50 : 0) + (formData.needsBikeRental ? 250 : 0)}</span>
              </div>
              <button onClick={handleRegister} disabled={loading} className="w-full bg-red-500 h-14 text-white font-black rounded-xl uppercase italic disabled:opacity-50">
                {loading ? "KAYDEDİLİYOR..." : "KAYDI TAMAMLA"}
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white text-3xl mb-4">✓</div>
                <h2 className="text-2xl sm:text-3xl font-black italic uppercase">KAYIT TAMAM!</h2>
                <p className="text-zinc-500 mt-2 text-sm sm:text-base">Kaydınız alınmıştır. Ödeme sonrası yarışçı numaranız e-posta adresinize gönderilecektir.</p>
              </div>

              {/* Ödeme Bilgileri */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
                <h3 className="text-lg font-bold text-red-500 uppercase">Ödeme Bilgileri / Payment Info</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Toplam Tutar:</span>
                    <span className="font-bold text-white">€{450 + (formData.needsTransfer ? 50 : 0) + (formData.needsBikeRental ? 250 : 0)}</span>
                  </div>
                  
                  <hr className="border-zinc-800" />
                  
                  <div className="space-y-2">
                    <p className="text-zinc-400 font-semibold">EFT / Havale Bilgileri:</p>
                    <div className="bg-black p-4 rounded-lg space-y-1 text-zinc-300 text-xs sm:text-sm">
                      <p><span className="text-zinc-500">Banka:</span> _______________</p>
                      <p><span className="text-zinc-500">Hesap Sahibi:</span> _______________</p>
                      <p className="break-all"><span className="text-zinc-500">IBAN:</span> TR__ ____ ____ ____ ____ ____ __</p>
                      <p><span className="text-zinc-500">SWIFT:</span> _______________</p>
                    </div>
                  </div>

                  <p className="text-zinc-500 text-xs">
                    * Açıklama kısmına <span className="text-red-500 font-bold">{formData.firstName} {formData.lastName}</span> yazınız.
                  </p>
                  <p className="text-zinc-500 text-xs">
                    * Ödemeniz onaylandığında yarışçı numaranız e-posta ile gönderilecektir.
                  </p>
                </div>
              </div>

              <button onClick={() => window.location.href="/"} className="w-full bg-zinc-800 text-white font-bold p-4 rounded-xl uppercase">
                Anasayfaya Dön
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}