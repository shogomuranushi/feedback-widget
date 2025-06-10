export type SupportedLocale = 'en' | 'ja';

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

export const DEFAULT_LOCALE: SupportedLocale = 'ja';

/**
 * Internationalization service for handling multiple languages
 */
export class I18nService {
  private static instance: I18nService;
  private currentLocale: SupportedLocale;
  private translations: Record<SupportedLocale, Record<string, any>> = {
    en: {},
    ja: {},
  };

  private constructor() {
    this.currentLocale = this.getDefaultLocale();
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  /**
   * Get default locale from environment or browser
   */
  private getDefaultLocale(): SupportedLocale {
    // Check environment variable first
    if (typeof process !== 'undefined' && process.env.FEEDBACK_WIDGET_LANGUAGE) {
      const envLocale = process.env.FEEDBACK_WIDGET_LANGUAGE as SupportedLocale;
      if (SUPPORTED_LOCALES.some(locale => locale.code === envLocale)) {
        return envLocale;
      }
    }

    // Check browser language (client-side only)
    if (typeof window !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0] as SupportedLocale;
      if (SUPPORTED_LOCALES.some(locale => locale.code === browserLang)) {
        return browserLang;
      }
    }

    return DEFAULT_LOCALE;
  }

  /**
   * Set current locale
   */
  public setLocale(locale: SupportedLocale): void {
    if (SUPPORTED_LOCALES.some(l => l.code === locale)) {
      this.currentLocale = locale;
    }
  }

  /**
   * Get current locale
   */
  public getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * Register translations for a locale
   */
  public registerTranslations(locale: SupportedLocale, translations: Record<string, any>): void {
    this.translations[locale] = { ...this.translations[locale], ...translations };
  }

  /**
   * Translate a key with optional interpolation
   */
  public translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLocale];

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current locale
        value = this.translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Interpolate parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }

  /**
   * Get date format for current locale
   */
  public getDateFormat(): Intl.DateTimeFormatOptions {
    const formats: Record<SupportedLocale, Intl.DateTimeFormatOptions> = {
      en: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      ja: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    };

    return formats[this.currentLocale];
  }

  /**
   * Format date according to current locale
   */
  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLocale, this.getDateFormat()).format(date);
  }

  /**
   * Format time according to current locale
   */
  public formatTime(date: Date): string {
    const timeFormat: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat(this.currentLocale, timeFormat).format(date);
  }
}

// Export singleton instance
export const i18n = I18nService.getInstance();

// Initialize translations
import { enTranslations } from './translations/en';
import { jaTranslations } from './translations/ja';

i18n.registerTranslations('en', enTranslations);
i18n.registerTranslations('ja', jaTranslations);

// Service for getting translations based on current locale
export const i18nService = {
  getTranslations: () => {
    const locale = i18n.getLocale();
    return locale === 'ja' ? jaTranslations : enTranslations;
  },
  translate: (key: string, params?: Record<string, string | number>) => i18n.translate(key, params),
  formatDate: (date: Date) => i18n.formatDate(date),
  formatTime: (date: Date) => i18n.formatTime(date),
};