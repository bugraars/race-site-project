import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

// Eğer i18n/request.ts yaptıysanız yolu boş bırakabilirsiniz (otomatik bulur)
// Ya da tam yolu şu şekilde verebilirsiniz:
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* diğer ayarlar */
};

export default withNextIntl(nextConfig);