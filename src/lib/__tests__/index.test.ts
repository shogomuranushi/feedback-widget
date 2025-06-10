import FeedbackWidget from '../index';
import { FeedbackWidgetConfig } from '../types';

describe('FeedbackWidget SDK', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // DOMコンテナを作成
    container = document.createElement('div');
    container.id = 'feedback-widget-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // クリーンアップ
    document.body.removeChild(container);
    FeedbackWidget.destroy();
  });

  describe('init', () => {
    it('設定を使用してウィジェットを初期化する', () => {
      const config: FeedbackWidgetConfig = {
        geminiApiKey: 'test-gemini-key',
        githubToken: 'test-github-token',
        repository: 'test-owner/test-repo',
      };

      FeedbackWidget.init(config);

      // ウィジェットがDOMに追加されたことを確認
      const widget = document.querySelector('[data-testid="feedback-widget"]');
      expect(widget).toBeInTheDocument();
    });

    it('カスタム位置でウィジェットを初期化する', () => {
      const config: FeedbackWidgetConfig = {
        geminiApiKey: 'test-gemini-key',
        githubToken: 'test-github-token',
        repository: 'test-owner/test-repo',
        position: 'bottom-left',
      };

      FeedbackWidget.init(config);

      const widget = document.querySelector('[data-testid="feedback-widget"]');
      expect(widget).toHaveClass('bottom-left');
    });

    it('既に初期化されている場合はエラーを投げる', () => {
      const config: FeedbackWidgetConfig = {
        geminiApiKey: 'test-gemini-key',
        githubToken: 'test-github-token',
        repository: 'test-owner/test-repo',
      };

      FeedbackWidget.init(config);

      expect(() => FeedbackWidget.init(config)).toThrow(
        'FeedbackWidget is already initialized'
      );
    });

    it('必須パラメータが不足している場合はエラーを投げる', () => {
      const invalidConfig = {
        geminiApiKey: 'test-gemini-key',
        // githubTokenとrepositoryが不足
      } as FeedbackWidgetConfig;

      expect(() => FeedbackWidget.init(invalidConfig)).toThrow(
        'Missing required configuration'
      );
    });

    it('無効なリポジトリ形式でエラーを投げる', () => {
      const config: FeedbackWidgetConfig = {
        geminiApiKey: 'test-gemini-key',
        githubToken: 'test-github-token',
        repository: 'invalid-format',
      };

      expect(() => FeedbackWidget.init(config)).toThrow(
        'Invalid repository format'
      );
    });
  });

  describe('destroy', () => {
    it('ウィジェットを削除する', () => {
      const config: FeedbackWidgetConfig = {
        geminiApiKey: 'test-gemini-key',
        githubToken: 'test-github-token',
        repository: 'test-owner/test-repo',
      };

      FeedbackWidget.init(config);
      expect(document.querySelector('[data-testid="feedback-widget"]')).toBeInTheDocument();

      FeedbackWidget.destroy();
      expect(document.querySelector('[data-testid="feedback-widget"]')).not.toBeInTheDocument();
    });

    it('初期化されていない場合は何もしない', () => {
      expect(() => FeedbackWidget.destroy()).not.toThrow();
    });
  });

  describe('show/hide', () => {
    beforeEach(() => {
      const config: FeedbackWidgetConfig = {
        geminiApiKey: 'test-gemini-key',
        githubToken: 'test-github-token',
        repository: 'test-owner/test-repo',
      };
      FeedbackWidget.init(config);
    });

    it('ウィジェットを表示する', () => {
      FeedbackWidget.hide();
      FeedbackWidget.show();

      const widget = document.querySelector('[data-testid="feedback-widget"]');
      expect(widget).not.toHaveStyle({ display: 'none' });
    });

    it('ウィジェットを非表示にする', () => {
      FeedbackWidget.hide();

      const widget = document.querySelector('[data-testid="feedback-widget"]');
      expect(widget).toHaveStyle({ display: 'none' });
    });
  });

  describe('updateConfig', () => {
    it('設定を動的に更新する', () => {
      const initialConfig: FeedbackWidgetConfig = {
        geminiApiKey: 'test-gemini-key',
        githubToken: 'test-github-token',
        repository: 'test-owner/test-repo',
        position: 'bottom-right',
      };

      FeedbackWidget.init(initialConfig);

      const updatedConfig: Partial<FeedbackWidgetConfig> = {
        position: 'bottom-left',
        theme: 'dark',
      };

      FeedbackWidget.updateConfig(updatedConfig);

      const widget = document.querySelector('[data-testid="feedback-widget"]');
      expect(widget).toHaveClass('bottom-left');
      expect(widget).toHaveClass('theme-dark');
    });

    it('初期化されていない場合はエラーを投げる', () => {
      expect(() => FeedbackWidget.updateConfig({})).toThrow(
        'FeedbackWidget is not initialized'
      );
    });
  });
});