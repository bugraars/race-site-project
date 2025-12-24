"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regToken, setRegToken] = useState(""); // JWT burada tutulacak
  const [enteredCode, setEnteredCode] = useState("");

  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", phone: "",
    idNumber: "", birthDate: "", address: "",
    needsTransfer: false, needsBikeRental: false,
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  // API ÇAĞRILARI
  const handleStep1 = async () => {
    setLoading(true);
    const res = await fetch("/api/register/verify-email", {
      method: "POST",
      body: JSON.stringify({ email: formData.email }),
    });
    if (res.ok) next(); else setError("Mail gönderilemedi.");
    setLoading(false);
  };

  const handleStep2 = async () => {
    setLoading(true);
    const res = await fetch("/api/register/confirm-code", {
      method: "POST",
      body: JSON.stringify({ email: formData.email, code: enteredCode }),
    });
    const data = await res.json();
    if (res.ok) { setRegToken(data.token); next(); } else setError("Kod hatalı.");
    setLoading(false);
  };

  const handleStep3And4 = async () => {
    setLoading(true);
    const res = await fetch("/api/register/save-details", {
      method: "POST",
      body: JSON.stringify({ token: regToken, ...formData }),
    });
    if (res.ok) next(); else setError("Kayıt güncellenemedi.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32">
      <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem]">
        {error && <div className="p-4 mb-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500 text-sm">{error}</div>}

        <AnimatePresence mode="wait">
          {/* STEP 1: E-POSTA GİRİŞİ */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-3xl font-black italic uppercase text-lime-400">Adım 1: Mail</h2>
              <input 
                className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-lime-500"
                placeholder="E-posta" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <button onClick={handleStep1} className="w-full bg-lime-500 p-4 text-black font-black uppercase italic rounded-xl">
                {loading ? "GÖNDERİLİYOR..." : "DOĞRULAMA KODU GÖNDER"}
              </button>
            </motion.div>
          )}

          {/* STEP 2: KOD DOĞRULAMA */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-3xl font-black italic uppercase text-lime-400">Adım 2: Onay</h2>
              <input 
                className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-center text-2xl font-mono tracking-widest outline-none focus:border-lime-500"
                placeholder="000000" maxLength={6}
                onChange={(e) => setEnteredCode(e.target.value)}
              />
              <button onClick={handleStep2} className="w-full bg-lime-400 p-4 text-black font-black uppercase italic rounded-xl">
                {loading ? "DOĞRULANIYOR..." : "KODU ONAYLA"}
              </button>
            </motion.div>
          )}

          {/* STEP 3: KİŞİSEL BİLGİLER */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-3xl font-black italic uppercase text-lime-400">Adım 3: Kimlik</h2>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Ad" className="bg-black p-4 rounded-xl border border-zinc-800" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                <input placeholder="Soyad" className="bg-black p-4 rounded-xl border border-zinc-800" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                <input placeholder="T.C. / Pasaport No" className="col-span-2 bg-black p-4 rounded-xl border border-zinc-800" onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
                <input type="date" className="bg-black p-4 rounded-xl border border-zinc-800 text-zinc-500" onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
                <input placeholder="Telefon" className="bg-black p-4 rounded-xl border border-zinc-800" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <button onClick={next} className="w-full bg-white text-black font-black p-4 rounded-xl uppercase italic">SONRAKİ ADIM</button>
            </motion.div>
          )}

          {/* STEP 4: EK HİZMETLER VE ÖZET */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-3xl font-black italic uppercase text-lime-400">Adım 4: Hizmetler</h2>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-4 bg-black rounded-xl border border-zinc-800">
                  <span>Havalimanı Transfer (€50)</span>
                  <input type="checkbox" checked={formData.needsTransfer} onChange={(e) => setFormData({...formData, needsTransfer: e.target.checked})} />
                </label>
                <label className="flex items-center justify-between p-4 bg-black rounded-xl border border-zinc-800">
                  <span>Motosiklet Kiralama (€250)</span>
                  <input type="checkbox" checked={formData.needsBikeRental} onChange={(e) => setFormData({...formData, needsBikeRental: e.target.checked})} />
                </label>
              </div>
              <div className="p-4 bg-zinc-950 rounded-xl text-right">
                <span className="text-zinc-500 uppercase text-xs font-bold mr-4">Toplam:</span>
                <span className="text-2xl font-black text-lime-400 italic">€{450 + (formData.needsTransfer ? 50 : 0) + (formData.needsBikeRental ? 250 : 0)}</span>
              </div>
              <button onClick={handleStep3And4} className="w-full bg-lime-500 p-4 text-black font-black rounded-xl uppercase italic">ÖDEMEYE GEÇ</button>
            </motion.div>
          )}

          {/* STEP 5: ÖDEME BAŞARILI / BİLET */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center mx-auto text-black font-black">✓</div>
              <h2 className="text-3xl font-black italic uppercase">KAYIT TAMAM!</h2>
              <p className="text-zinc-500">Yarışçı numaranız ve biletiniz e-posta adresinize gönderildi.</p>
              <button onClick={() => window.location.href="/"} className="text-lime-400 font-bold uppercase underline">Anasayfaya Dön</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}