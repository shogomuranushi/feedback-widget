/**
 * アプリケーション全体で使用される定数値
 */

// UI関連の定数
export const UI_CONSTANTS = {
  // ウィジェットのサイズ
  WIDGET: {
    MAX_HEIGHT: '600px',
    MAX_HEIGHT_VH: '80vh',
    FULL_HEIGHT: '100vh',
    FLOATING_BUTTON_SIZE: '64px',
    FLOATING_BUTTON_MARGIN: '24px',
  },

  // グラデーション
  GRADIENTS: {
    PRIMARY: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    PRIMARY_HOVER: 'hover:from-indigo-700 hover:to-purple-700',
    SECONDARY: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    TERTIARY: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700',
  },

  // アニメーション
  ANIMATIONS: {
    TRANSITION_DEFAULT: 'transition-all duration-200',
    TRANSITION_FAST: 'transition-all duration-150',
    TRANSITION_SLOW: 'transition-all duration-300',
    BOUNCE: 'animate-bounce',
    PULSE: 'animate-pulse',
    SPIN: 'animate-spin',
  },

  // Z-Index
  Z_INDEX: {
    FLOATING_BUTTON: 9999,
    MODAL: 10000,
    TOOLTIP: 10001,
  },

  // フォーカス・ホバー効果
  FOCUS: {
    RING_PRIMARY: 'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    RING_SECONDARY: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    BORDER_PRIMARY: 'focus:border-transparent focus:ring-2 focus:ring-indigo-500',
  },

  // シャドウ
  SHADOWS: {
    SMALL: 'shadow-sm',
    DEFAULT: 'shadow',
    MEDIUM: 'shadow-md',
    LARGE: 'shadow-lg',
    EXTRA_LARGE: 'shadow-xl',
    MASSIVE: 'shadow-2xl',
  },
} as const;

// API関連の定数
export const API_CONSTANTS = {
  // エンドポイント
  ENDPOINTS: {
    FEEDBACK_CHAT: '/api/feedback/chat',
    FEEDBACK_ANALYZE: '/api/feedback/analyze',
    FEEDBACK_SUBMIT: '/api/feedback/submit',
    SESSION: '/api/session',
    CHAT: '/api/chat',
    ANALYZE: '/api/analyze',
    SUBMIT: '/api/submit',
  },

  // タイムアウト設定
  TIMEOUTS: {
    DEFAULT: 30000, // 30秒
    CHAT: 60000,    // 60秒
    ANALYZE: 90000, // 90秒
    SUBMIT: 120000, // 120秒
  },

  // リトライ設定
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_BASE: 1000, // 1秒
    DELAY_MULTIPLIER: 2,
  },
} as const;

// Gemini AI関連の定数
export const AI_CONSTANTS = {
  // モデル名
  MODELS: {
    GEMINI_PRO: 'gemini-pro',
    GEMINI_PRO_VISION: 'gemini-pro-vision',
    GEMINI_2_5_PRO: 'gemini-2.5-pro-preview-06-05',
  },

  // 生成設定
  GENERATION_CONFIG: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },

  // 安全性設定
  SAFETY_SETTINGS: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
} as const;

// セッション管理の定数
export const SESSION_CONSTANTS = {
  // セッション有効期限
  EXPIRY: {
    CHAT_SESSION: 30 * 60 * 1000,    // 30分
    FEEDBACK_SESSION: 60 * 60 * 1000, // 60分
    ANALYSIS_CACHE: 10 * 60 * 1000,   // 10分
  },

  // セッションクリーンアップ
  CLEANUP: {
    INTERVAL: 5 * 60 * 1000,  // 5分間隔
    BATCH_SIZE: 100,          // 一度に処理するセッション数
  },
} as const;

// バリデーション関連の定数
export const VALIDATION_CONSTANTS = {
  // 文字数制限
  LIMITS: {
    MESSAGE_MIN: 1,
    MESSAGE_MAX: 2000,
    TITLE_MAX: 100,
    DESCRIPTION_MAX: 5000,
    LABEL_MAX: 50,
    REPOSITORY_MAX: 100,
  },

  // 正規表現パターン
  PATTERNS: {
    REPOSITORY: /^[^/]+\/[^/]+$/,
    GITHUB_TOKEN: /^gh[pos]_[A-Za-z0-9_]{36,}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
  },

  // 許可されるファイル拡張子
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
} as const;

// GitHub関連の定数
export const GITHUB_CONSTANTS = {
  // API設定
  API: {
    BASE_URL: 'https://api.github.com',
    TIMEOUT: 10000, // 10秒
    MAX_RETRIES: 3,
  },

  // イシューラベル
  LABELS: {
    ENHANCEMENT: 'enhancement',
    BUG: 'bug',
    QUESTION: 'question',
    IMPROVEMENT: 'improvement',
    UI_UX: 'ui/ux',
    ACCESSIBILITY: 'accessibility',
    PERFORMANCE: 'performance',
    SECURITY: 'security',
    HIGH_PRIORITY: 'high-priority',
    GOOD_FIRST_ISSUE: 'good-first-issue',
    NEEDS_DISCUSSION: 'needs-discussion',
    MOBILE: 'mobile',
    DESKTOP: 'desktop',
    CROSS_PLATFORM: 'cross-platform',
  },

  // 優先度レベル
  PRIORITY_LEVELS: ['low', 'medium', 'high'] as const,

  // カテゴリ
  CATEGORIES: ['feature', 'bug', 'improvement', 'question'] as const,
} as const;

// ローカライゼーション関連
export const LOCALE_CONSTANTS = {
  // サポートされる言語
  SUPPORTED_LOCALES: ['ja', 'en'] as const,
  DEFAULT_LOCALE: 'ja',

  // 日付フォーマット
  DATE_FORMATS: {
    SHORT: 'MM/dd',
    MEDIUM: 'MM/dd/yyyy',
    LONG: 'yyyy年MM月dd日',
    TIME: 'HH:mm',
    DATETIME: 'yyyy/MM/dd HH:mm',
  },
} as const;

// デバッグ・ログ関連
export const DEBUG_CONSTANTS = {
  // ログレベル
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },

  // ログ出力先
  LOG_TARGETS: {
    CONSOLE: 'console',
    FILE: 'file',
    REMOTE: 'remote',
  },
} as const;