"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CreditCardInputProps {
  onValidCard: (card: CardData | null) => void;
  onClose: () => void;
  onSubmit: () => void;
  isProcessing?: boolean;
}

export interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType: "visa" | "mastercard" | "troy" | "unknown";
}

// Luhn algoritması ile kart numarası doğrulama
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Kart tipini tespit et
function detectCardType(cardNumber: string): "visa" | "mastercard" | "troy" | "unknown" {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Visa: 4 ile başlar
  if (/^4/.test(cleaned)) return "visa";
  
  // Mastercard: 51-55 veya 2221-2720 ile başlar
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return "mastercard";
  
  // Troy: 9792 ile başlar
  if (/^9792/.test(cleaned)) return "troy";
  
  return "unknown";
}

// Kart numarasını formatla (4'lü gruplar)
function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

export default function CreditCardInput({ onValidCard, onClose, onSubmit, isProcessing }: CreditCardInputProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardType = detectCardType(cardNumber);
  const cleanedCardNumber = cardNumber.replace(/\D/g, '');

  // Validasyon ve kart verisi gönderme
  useEffect(() => {
    const isValidNumber = cleanedCardNumber.length >= 13 && luhnCheck(cleanedCardNumber);
    const isValidHolder = cardHolder.trim().length >= 3;
    const isValidExpiry = expiryMonth && expiryYear && 
      parseInt(expiryMonth) >= 1 && parseInt(expiryMonth) <= 12;
    const isValidCvv = cvv.length >= 3 && cvv.length <= 4;

    if (isValidNumber && isValidHolder && isValidExpiry && isValidCvv) {
      onValidCard({
        cardNumber: cleanedCardNumber,
        cardHolder: cardHolder.trim().toUpperCase(),
        expiryMonth,
        expiryYear,
        cvv,
        cardType
      });
    } else {
      onValidCard(null);
    }
  }, [cardNumber, cardHolder, expiryMonth, expiryYear, cvv, cardType, cleanedCardNumber, onValidCard]);

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 19) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!luhnCheck(cleanedCardNumber)) {
      newErrors.cardNumber = "Geçersiz kart numarası";
    }
    if (cardHolder.trim().length < 3) {
      newErrors.cardHolder = "Kart sahibi adı gerekli";
    }
    if (!expiryMonth || !expiryYear) {
      newErrors.expiry = "Son kullanma tarihi gerekli";
    }
    if (cvv.length < 3) {
      newErrors.cvv = "CVV gerekli";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  // Kart logo renkleri
  const getCardColor = () => {
    switch (cardType) {
      case "visa": return "from-blue-600 to-blue-900";
      case "mastercard": return "from-red-600 to-orange-500";
      case "troy": return "from-blue-500 to-cyan-400";
      default: return "from-zinc-700 to-zinc-900";
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear + i);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kart Görseli */}
        <div className="perspective-1000 mb-6">
          <div 
            className={`relative w-full h-48 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Ön Yüz */}
            <div 
              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${getCardColor()} p-5 text-white shadow-2xl`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Kart Tipi Logo */}
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-8 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded opacity-80" />
                <span className="text-xl font-bold uppercase tracking-wider opacity-80">
                  {cardType !== "unknown" ? cardType : "CARD"}
                </span>
              </div>
              
              {/* Kart Numarası */}
              <div className="text-xl sm:text-2xl font-mono tracking-widest mb-6">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>
              
              {/* Alt Bilgiler */}
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] uppercase opacity-60 mb-1">Kart Sahibi</div>
                  <div className="text-sm font-medium tracking-wide uppercase">
                    {cardHolder || "AD SOYAD"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase opacity-60 mb-1">Son Kullanma</div>
                  <div className="text-sm font-medium">
                    {expiryMonth || "MM"}/{expiryYear?.slice(-2) || "YY"}
                  </div>
                </div>
              </div>
            </div>

            {/* Arka Yüz */}
            <div 
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-2xl rotate-y-180"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="w-full h-12 bg-black mt-6" />
              <div className="px-5 mt-6">
                <div className="bg-zinc-300 h-10 rounded flex items-center justify-end px-4">
                  <span className="text-zinc-900 font-mono text-lg">{cvv || "•••"}</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-4 text-center">
                  Bu kartla yapılan işlemler güvenli ödeme altyapısı ile korunmaktadır.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Kart Numarası */}
          <div>
            <label className="text-zinc-500 text-xs mb-1 block">Kart Numarası</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className={`w-full bg-black h-12 px-4 rounded-xl border ${errors.cardNumber ? 'border-red-500' : 'border-zinc-800'} focus:border-red-500 outline-none font-mono text-lg tracking-wider`}
            />
            {errors.cardNumber && <span className="text-red-500 text-xs mt-1">{errors.cardNumber}</span>}
          </div>

          {/* Kart Sahibi */}
          <div>
            <label className="text-zinc-500 text-xs mb-1 block">Kart Üzerindeki İsim</label>
            <input
              type="text"
              placeholder="AD SOYAD"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              className={`w-full bg-black h-12 px-4 rounded-xl border ${errors.cardHolder ? 'border-red-500' : 'border-zinc-800'} focus:border-red-500 outline-none uppercase tracking-wide`}
            />
            {errors.cardHolder && <span className="text-red-500 text-xs mt-1">{errors.cardHolder}</span>}
          </div>

          {/* Son Kullanma & CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-500 text-xs mb-1 block">Ay</label>
              <select
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                className={`w-full bg-black h-12 px-3 rounded-xl border ${errors.expiry ? 'border-red-500' : 'border-zinc-800'} focus:border-red-500 outline-none appearance-none`}
              >
                <option value="">AA</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1 block">Yıl</label>
              <select
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                className={`w-full bg-black h-12 px-3 rounded-xl border ${errors.expiry ? 'border-red-500' : 'border-zinc-800'} focus:border-red-500 outline-none appearance-none`}
              >
                <option value="">YY</option>
                {years.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1 block">CVV</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="•••"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                onFocus={() => setIsFlipped(true)}
                onBlur={() => setIsFlipped(false)}
                className={`w-full bg-black h-12 px-4 rounded-xl border ${errors.cvv ? 'border-red-500' : 'border-zinc-800'} focus:border-red-500 outline-none text-center font-mono text-lg`}
              />
            </div>
          </div>
          {errors.expiry && <span className="text-red-500 text-xs">{errors.expiry}</span>}

          {/* Güvenlik Notu */}
          <div className="flex items-center gap-2 text-zinc-500 text-xs pt-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>256-bit SSL ile güvenli ödeme</span>
          </div>
          <p className="text-zinc-600 text-[10px] text-center mt-1">Vakıf Bank sanal pos altyapısı ile gerçekleştirilmektedir.</p>

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white font-bold h-12 rounded-xl uppercase text-sm"
            >
              İptal
            </button>
            <button
              onClick={validateAndSubmit}
              disabled={isProcessing}
              className="flex-1 bg-red-500 text-white font-bold h-12 rounded-xl uppercase text-sm disabled:opacity-50"
            >
              {isProcessing ? "İŞLENİYOR..." : "ÖDE"}
            </button>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.div>
  );
}
