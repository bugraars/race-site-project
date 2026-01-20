"use client";
import { motion } from "framer-motion";

interface TermsModalProps {
  type: "terms" | "privacy";
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ type, onClose, onAccept }: TermsModalProps) {
  const isTerms = type === "terms";

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
            {isTerms ? "Mesafeli Satış Sözleşmesi" : "Gizlilik Politikası & KVKK"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 text-zinc-300 text-sm space-y-4 mb-4">
          {isTerms ? (
            <>
              <h3 className="text-white font-bold">1. TARAFLAR</h3>
              <p>
                İşbu sözleşme, <strong>NFC Racer</strong> (bundan böyle "SATICI" olarak anılacaktır) ile
                kayıt formunu dolduran yarışçı (bundan böyle "ALICI" olarak anılacaktır) arasında,
                aşağıda belirtilen hüküm ve şartlar çerçevesinde akdedilmiştir.
              </p>

              <h3 className="text-white font-bold">2. KONU</h3>
              <p>
                İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait web sitesinden elektronik ortamda
                siparişini verdiği yarış katılım hakkının satışı ve teslimi ile ilgili olarak 6502 sayılı
                Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri
                gereğince tarafların hak ve yükümlülüklerini kapsamaktadır.
              </p>

              <h3 className="text-white font-bold">3. SÖZLEŞME KONUSU HİZMET</h3>
              <p>
                - Hizmet: Yarış katılım hakkı ve etkinlik paketi<br />
                - Fiyat: €450 (KDV dahil)<br />
                - Teslimat: Yarış günü, kayıt masasında
              </p>

              <h3 className="text-white font-bold">4. GENEL HÜKÜMLER</h3>
              <p>
                4.1. ALICI, SATICI'ya ait internet sitesinde sözleşme konusu hizmetin temel nitelikleri,
                satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu,
                elektronik ortamda gerekli teyidi verdiğini kabul, beyan ve taahhüt eder.
              </p>
              <p>
                4.2. ALICI, sözleşmeyi onaylayarak, sipariş onayı ile birlikte ödemeyi gerçekleştirdiğini
                kabul eder.
              </p>

              <h3 className="text-white font-bold">5. CAYMA HAKKI</h3>
              <p>
                ALICI, etkinlik tarihinden 14 gün öncesine kadar herhangi bir gerekçe göstermeksizin ve
                cezai şart ödemeksizin cayma hakkını kullanabilir. Etkinlik tarihine 14 günden az kalmış
                ise cayma hakkı kullanılamaz.
              </p>

              <h3 className="text-white font-bold">6. SORUMLULUK</h3>
              <p>
                6.1. Yarış sırasında meydana gelebilecek kaza, yaralanma veya kayıplardan SATICI sorumlu
                tutulamaz.<br />
                6.2. ALICI, yarışa katılmak için gerekli sağlık durumuna sahip olduğunu beyan eder.<br />
                6.3. ALICI, yarış kurallarına uymayı kabul ve taahhüt eder.
              </p>

              <h3 className="text-white font-bold">7. YETKİLİ MAHKEME</h3>
              <p>
                İşbu sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanır.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-white font-bold">1. VERİ SORUMLUSU</h3>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz;
                veri sorumlusu olarak <strong>NFC Racer</strong> tarafından aşağıda açıklanan kapsamda
                işlenebilecektir.
              </p>

              <h3 className="text-white font-bold">2. TOPLANAN KİŞİSEL VERİLER</h3>
              <p>
                - Kimlik bilgileri (Ad, soyad, T.C. kimlik/pasaport numarası, doğum tarihi)<br />
                - İletişim bilgileri (E-posta, telefon numarası)<br />
                - Sağlık bilgileri (Kan grubu, acil durum iletişim bilgileri)<br />
                - Ödeme bilgileri (Kart bilgileri, işlem geçmişi)
              </p>

              <h3 className="text-white font-bold">3. VERİLERİN İŞLENME AMAÇLARI</h3>
              <p>
                Kişisel verileriniz aşağıdaki amaçlarla işlenebilecektir:<br />
                - Yarış kaydının oluşturulması ve takibi<br />
                - Ödeme işlemlerinin gerçekleştirilmesi<br />
                - Yasal yükümlülüklerin yerine getirilmesi<br />
                - Acil durumlarda iletişim kurulması<br />
                - Etkinlik duyuruları ve bilgilendirme
              </p>

              <h3 className="text-white font-bold">4. VERİLERİN AKTARIMI</h3>
              <p>
                Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda,
                hizmet aldığımız iş ortaklarımıza, yetkili kamu kurum ve kuruluşlarına ve hukuki
                zorunluluklar kapsamında ilgili taraflara aktarılabilecektir.
              </p>

              <h3 className="text-white font-bold">5. VERİ SAHİBİNİN HAKLARI</h3>
              <p>
                KVKK'nın 11. maddesi uyarınca, aşağıdaki haklara sahipsiniz:<br />
                - Kişisel verilerinizin işlenip işlenmediğini öğrenme<br />
                - Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme<br />
                - Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme<br />
                - Kişisel verilerin düzeltilmesini veya silinmesini isteme
              </p>

              <h3 className="text-white font-bold">6. VERİ GÜVENLİĞİ</h3>
              <p>
                Kişisel verilerinizin hukuka aykırı olarak işlenmesini ve erişilmesini önlemek ile
                muhafazasını sağlamak için uygun güvenlik düzeyini temin etmeye yönelik gerekli her türlü
                teknik ve idari tedbirler alınmaktadır. Kredi kartı bilgileriniz 256-bit SSL şifrelemesi
                ile korunmakta olup, sistemlerimizde saklanmamaktadır.
              </p>

              <h3 className="text-white font-bold">7. İLETİŞİM</h3>
              <p>
                KVKK kapsamındaki taleplerinizi info@nfcracer.com e-posta adresine iletebilirsiniz.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 text-white font-bold h-12 rounded-xl uppercase text-sm"
          >
            Kapat
          </button>
          <button
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="flex-1 bg-red-500 text-white font-bold h-12 rounded-xl uppercase text-sm"
          >
            Okudum, Kabul Ediyorum
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
