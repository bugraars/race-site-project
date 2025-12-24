"use client";

export default function Footer() {
  const year = new Date().getFullYear();
  
  // Mail yapılandırması
  const email = "info@olymposhardenduro.com";
  const subject = encodeURIComponent("OlymposEnduro26 - Bilgi Talebi");
  const mailtoLink = `mailto:${email}?subject=${subject}`;

  return (
    <footer id="contact" className="w-full bg-zinc-950 border-t border-white/5 py-8 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-6 text-zinc-400 text-xs">
        
        {/* Üst Satır: İletişim ve Sosyal Medya */}
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-6">
            <a 
              href={mailtoLink}
              className="flex items-center gap-2 hover:text-lime-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{email}</span>
            </a>

            <div className="flex items-center gap-4">
              <a href="https://instagram.com/olymposhardenduro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-lime-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/></svg>
                <span>Instagram</span>
              </a>
              <a href="https://youtube.com/@olymposhardenduro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-lime-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.8 8.001a2.752 2.752 0 0 0-1.936-1.946C18.077 6 12 6 12 6s-6.077 0-7.864.055A2.752 2.752 0 0 0 2.2 8.001C2.145 9.789 2.145 12 2.145 12s0 2.211.055 3.999a2.752 2.752 0 0 0 1.936 1.946C5.923 18 12 18 12 18s6.077 0 7.864-.055a2.752 2.752 0 0 0 1.936-1.946C21.855 14.211 21.855 12 21.855 12s0-2.211-.055-3.999zM10 15.5v-7l6 3.5l-6 3.5z"/></svg>
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
            Powered by <span className="font-bold text-lime-400 tracking-wider">ANTAWARE Software</span>
          </div>
        </div>

      </div>
    </footer>
  );
}