"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface TermsModalProps {
  type: "terms" | "privacy";
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ type, onClose, onAccept }: TermsModalProps) {
  const t = useTranslations("TermsModal");
  const isTerms = type === "terms";
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll kontrolü - en alta indiğinde butonu aktif et
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // 20px tolerans ile en alta ulaştığını kontrol et
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setCanAccept(true);
      }
    }
  };

  // İçerik kısa ise direkt aktif et
  useEffect(() => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      if (scrollHeight <= clientHeight) {
        setCanAccept(true);
      }
    }
  }, []);

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
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-red-500 uppercase italic">
            {isTerms ? t("terms_title") : t("privacy_title")}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pr-2 text-zinc-300 text-sm space-y-4 mb-4"
        >
          {isTerms ? (
            <>
              <h3 className="text-white font-bold">{t("terms_section1_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("terms_section1_content") }} />

              <h3 className="text-white font-bold">{t("terms_section2_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("terms_section2_content") }} />

              <h3 className="text-white font-bold">{t("terms_section3_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("terms_section3_content") }} />

              <h3 className="text-white font-bold">{t("terms_section4_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("terms_section4_content1") }} />
              <p dangerouslySetInnerHTML={{ __html: t("terms_section4_content2") }} />

              <h3 className="text-white font-bold">{t("terms_section5_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("terms_section5_content") }} />

              <h3 className="text-white font-bold">{t("terms_section6_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("terms_section6_content") }} />

              <h3 className="text-white font-bold">{t("terms_section7_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("terms_section7_content") }} />
            </>
          ) : (
            <>
              <h3 className="text-white font-bold">{t("privacy_section1_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("privacy_section1_content") }} />

              <h3 className="text-white font-bold">{t("privacy_section2_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("privacy_section2_content") }} />

              <h3 className="text-white font-bold">{t("privacy_section3_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("privacy_section3_content") }} />

              <h3 className="text-white font-bold">{t("privacy_section4_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("privacy_section4_content") }} />

              <h3 className="text-white font-bold">{t("privacy_section5_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("privacy_section5_content") }} />

              <h3 className="text-white font-bold">{t("privacy_section6_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("privacy_section6_content") }} />

              <h3 className="text-white font-bold">{t("privacy_section7_title")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("privacy_section7_content") }} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800">
          {!canAccept && (
            <p className="text-zinc-500 text-xs text-center mb-3">
              {t("scroll_hint")}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white font-bold h-12 rounded-xl uppercase text-sm"
            >
              {t("close")}
            </button>
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              disabled={!canAccept}
              className="flex-1 bg-red-500 text-white font-bold h-12 rounded-xl uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("accept")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
