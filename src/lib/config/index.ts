import { FeedbackWidgetConfig } from '../types';

/**
 * 環境変数からの設定取得
 */
export class ConfigService {
  /**
   * 必須の環境変数を取得（未設定の場合はエラー）
   */
  static getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * オプションの環境変数を取得（未設定の場合はデフォルト値）
   */
  static getOptionalEnv(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Gemini API設定を取得
   */
  static getGeminiConfig() {
    const config = {
      apiKey: this.getRequiredEnv('GEMINI_API_KEY'),
      model: this.getOptionalEnv('GEMINI_MODEL', 'gemini-1.5-flash'),
      timeout: parseInt(this.getOptionalEnv('GEMINI_TIMEOUT', '60000')),
    };
    
    return config;
  }

  /**
   * GitHub API設定を取得
   */
  static getGitHubConfig() {
    return {
      token: this.getRequiredEnv('GITHUB_TOKEN'),
      timeout: parseInt(this.getOptionalEnv('GITHUB_TIMEOUT', '10000')),
      maxRetries: parseInt(this.getOptionalEnv('GITHUB_MAX_RETRIES', '3')),
    };
  }

  /**
   * アプリケーション設定を取得
   */
  static getAppConfig() {
    return {
      nodeEnv: this.getOptionalEnv('NODE_ENV', 'development'),
      port: parseInt(this.getOptionalEnv('PORT', '3001')),
      logLevel: this.getOptionalEnv('LOG_LEVEL', 'info'),
      enableDebug: this.getOptionalEnv('ENABLE_DEBUG', 'false') === 'true',
    };
  }

  /**
   * フィードバックウィジェットのデフォルト設定
   */
  static getDefaultWidgetConfig(): FeedbackWidgetConfig {
    return {
      position: 'bottom-right',
      theme: 'auto',
    };
  }

  /**
   * 開発環境かどうかの判定
   */
  static isDevelopment(): boolean {
    return this.getOptionalEnv('NODE_ENV', 'development') === 'development';
  }

  /**
   * 本番環境かどうかの判定
   */
  static isProduction(): boolean {
    return this.getOptionalEnv('NODE_ENV', 'development') === 'production';
  }

  /**
   * テスト環境かどうかの判定
   */
  static isTest(): boolean {
    return this.getOptionalEnv('NODE_ENV', 'development') === 'test';
  }
}

/**
 * クライアントサイド用の設定
 */
export class ClientConfigService {
  /**
   * APIベースURLを取得
   */
  static getApiBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  /**
   * 環境に応じたAPI設定を取得
   */
  static getApiConfig() {
    const baseUrl = this.getApiBaseUrl();
    return {
      baseUrl,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    };
  }

  /**
   * ブラウザ固有の設定を取得
   */
  static getBrowserConfig() {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        language: 'ja',
        platform: 'unknown',
        cookieEnabled: false,
      };
    }

    return {
      userAgent: navigator.userAgent,
      language: navigator.language || 'ja',
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
    };
  }

  /**
   * テーマ設定を取得
   */
  static getThemeConfig() {
    const prefersDark = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;

    return {
      prefersDark,
      systemTheme: prefersDark ? 'dark' : 'light',
    };
  }
}

// 設定のエクスポート
export * from './constants';