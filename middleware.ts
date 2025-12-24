// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Statik dosyalar ve Next.js iç dosyaları hariç her şeyi yakala
  matcher: ['/', '/(tr|en|ru|de)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};