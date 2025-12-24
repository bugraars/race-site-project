import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'tr', 'ru', 'de'],
  defaultLocale: 'tr'
});

// Proje genelinde kullanacağımız Link ve Router buradan gelecek
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);