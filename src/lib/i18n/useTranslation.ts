import { useEffect, useState } from 'react';
import { i18n, SupportedLocale } from './index';
import { enTranslations } from './translations/en';
import { jaTranslations } from './translations/ja';

// Register translations on initialization
i18n.registerTranslations('en', enTranslations);
i18n.registerTranslations('ja', jaTranslations);

/**
 * React hook for translations
 */
export function useTranslation() {
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>(i18n.getLocale());

  useEffect(() => {
    // Listen for locale changes (this is a simple implementation)
    // In a real app, you might want to use a context or state management
    const checkLocaleChange = () => {
      const newLocale = i18n.getLocale();
      if (newLocale !== currentLocale) {
        setCurrentLocale(newLocale);
      }
    };

    // Check for locale changes periodically
    const interval = setInterval(checkLocaleChange, 100);
    
    return () => clearInterval(interval);
  }, [currentLocale]);

  const t = (key: string, params?: Record<string, string | number>) => {
    return i18n.translate(key, params);
  };

  const changeLocale = (locale: SupportedLocale) => {
    i18n.setLocale(locale);
    setCurrentLocale(locale);
  };

  const formatDate = (date: Date) => {
    return i18n.formatDate(date);
  };

  const formatTime = (date: Date) => {
    return i18n.formatTime(date);
  };

  return {
    t,
    locale: currentLocale,
    changeLocale,
    formatDate,
    formatTime,
  };
}