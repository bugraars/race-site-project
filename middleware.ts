import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'tr', 'ru', 'de'],
  defaultLocale: 'tr'
});

export const config = {
  // Sadece ana dizini ve dil bazlı yolları yakalar
  matcher: ['/', '/(tr|en|ru|de)/:path*']
};