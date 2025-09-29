import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n.config';

export default getRequestConfig(async ({ locale }) => {
  console.log('getRequestConfig called with locale:', locale);
  
  // If locale is undefined, use default locale
  if (!locale) {
    console.log('Locale is undefined, using default locale: en');
    const messages = (await import(`../messages/en.json`)).default;
    return {
      locale: 'en',
      messages
    };
  }
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    console.log('Locale not found:', locale);
    notFound();
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log('Messages loaded for locale:', locale);
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Error loading messages for locale:', locale, error);
    notFound();
  }
});