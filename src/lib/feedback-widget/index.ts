import { FeedbackWidgetConfig, Message, FeedbackSession } from '@/lib/types';
import { ChatService } from '@/lib/feedback-widget/services/chatService';

class FeedbackWidgetSDK {
  private config: FeedbackWidgetConfig | null = null;
  private container: HTMLDivElement | null = null;
  private isInitialized = false;
  private isOpen = false;
  private session: FeedbackSession | null = null;
  private chatService: ChatService | null = null;
  private debugMode = true; // Enable debug logs

  /**
   * フィードバックウィジェットを初期化
   */
  init(config: FeedbackWidgetConfig): void {
    if (this.debugMode) {
      console.log('[FeedbackWidget] Init called with config:', config);
      console.log('[FeedbackWidget] Current state:', {
        isInitialized: this.isInitialized,
        config: this.config
      });
    }
    
    if (this.isInitialized) {
      console.log('[FeedbackWidget] Already initialized, skipping');
      return;
    }

    this.config = {
      ...config,
      position: config.position || 'bottom-right',
      theme: config.theme || 'auto',
    };

    if (this.debugMode) {
      console.log('[FeedbackWidget] Final config:', this.config);
    }

    try {
      console.log('[FeedbackWidget] Initializing session...');
      this.initializeSession();
      
      console.log('[FeedbackWidget] Creating floating button...');
      this.createFloatingButton();
      
      console.log('[FeedbackWidget] Adding styles...');
      this.addStyles();
      
      console.log('[FeedbackWidget] Initializing chat service...');
      this.chatService = new ChatService();
      
      this.isInitialized = true;
      console.log('[FeedbackWidget] Initialization completed successfully');
      
    } catch (error) {
      console.error('[FeedbackWidget] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * ウィジェットを表示
   */
  show(): void {
    if (!this.isInitialized) {
      throw new Error('FeedbackWidget is not initialized. Call init() first.');
    }
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * ウィジェットを非表示
   */
  hide(): void {
    if (!this.isInitialized) {
      throw new Error('FeedbackWidget is not initialized. Call init() first.');
    }
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * 設定を動的に更新
   */
  updateConfig(newConfig: Partial<FeedbackWidgetConfig>): void {
    if (!this.isInitialized) {
      throw new Error('FeedbackWidget is not initialized. Call init() first.');
    }
    
    if (!this.config) return;

    this.config = { ...this.config, ...newConfig };
    
    // 位置が変更された場合はスタイルを再適用
    if (newConfig.position) {
      this.addStyles();
    }
  }

  /**
   * ウィジェットを破棄
   */
  destroy(): void {
    if (!this.isInitialized) return;

    try {
      // 全ての要素を削除
      const floatingButton = document.getElementById('feedback-widget-button');
      const modal = document.getElementById('feedback-widget-modal');
      const styles = document.getElementById('feedback-widget-styles');

      [floatingButton, modal, styles].forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });

      this.container = null;
      this.config = null;
      this.session = null;
      this.isOpen = false;
      this.isInitialized = false;
    } catch (error) {
      console.warn('Error during FeedbackWidget destroy:', error);
      this.isInitialized = false;
    }
  }

  /**
   * セッションを初期化
   */
  private initializeSession(): void {
    const welcomeMessage: Message = {
      id: this.generateId(),
      role: 'assistant',
      content: 'こんにちは！機能要望やフィードバックをお聞かせください。どのような改善をご希望ですか？',
      timestamp: new Date(),
    };

    this.session = {
      id: this.generateId(),
      messages: [welcomeMessage],
      status: 'active',
    };
  }

  /**
   * FloatingButtonを作成
   */
  private createFloatingButton(): void {
    console.log('[FeedbackWidget] Creating floating button...');
    
    // 既存のボタンがあれば削除
    const existingButton = document.getElementById('feedback-widget-button');
    if (existingButton) {
      console.log('[FeedbackWidget] Removing existing button');
      existingButton.remove();
    }

    const button = document.createElement('button');
    button.id = 'feedback-widget-button';
    button.className = 'feedback-widget-floating-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 8.5l-1.5 1.5-1.5-1.5V9.5l3 0v3z"/>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `;

    button.addEventListener('click', () => {
      console.log('[FeedbackWidget] Button clicked!');
      this.openModal();
    });
    
    console.log('[FeedbackWidget] Button created, appending to body...');
    document.body.appendChild(button);
    
    console.log('[FeedbackWidget] Button appended. Checking if visible...');
    setTimeout(() => {
      const addedButton = document.getElementById('feedback-widget-button');
      console.log('[FeedbackWidget] Button check:', {
        exists: !!addedButton,
        display: addedButton?.style.display,
        visibility: addedButton?.style.visibility,
        className: addedButton?.className,
        computedStyle: addedButton ? window.getComputedStyle(addedButton).display : 'N/A'
      });
    }, 100);
  }

  /**
   * モーダルを開く
   */
  private openModal(): void {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.createModal();
    this.hideFloatingButton();
  }

  /**
   * モーダルを閉じる
   */
  private closeModal(): void {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.destroyModal();
    this.showFloatingButton();
  }

  /**
   * 全画面モーダルを作成
   */
  private createModal(): void {
    const modal = document.createElement('div');
    modal.id = 'feedback-widget-modal';
    modal.className = 'feedback-widget-modal';
    modal.innerHTML = this.getModalHTML();

    document.body.appendChild(modal);
    this.attachModalEventListeners();
  }

  /**
   * モーダルのHTMLを取得
   */
  private getModalHTML(): string {
    return `
      <div class="feedback-widget-header">
        <div class="feedback-widget-header-content">
          <div class="feedback-widget-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 7C14.21 7 16 8.79 16 11V22H8V11C8 8.79 9.79 7 12 7Z" />
            </svg>
          </div>
          <h1>フィードバック</h1>
        </div>
        <button class="feedback-widget-close" onclick="window.feedbackWidget.closeModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="feedback-widget-messages" id="feedback-widget-messages">
        ${this.renderMessages()}
      </div>
      <div class="feedback-widget-input-container">
        <textarea 
          id="feedback-widget-input" 
          class="feedback-widget-input" 
          placeholder="メッセージを入力..."
          rows="1"
        ></textarea>
        <button 
          id="feedback-widget-send" 
          class="feedback-widget-send-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * メッセージリストをレンダリング
   */
  private renderMessages(): string {
    if (!this.session) return '';

    return this.session.messages.map(message => `
      <div class="feedback-widget-message ${message.role}">
        <div class="feedback-widget-message-content">
          ${message.content}
        </div>
        <div class="feedback-widget-message-time">
          ${this.formatTime(message.timestamp)}
        </div>
      </div>
    `).join('');
  }

  /**
   * FloatingButtonを隠す
   */
  private hideFloatingButton(): void {
    const button = document.getElementById('feedback-widget-button');
    if (button) {
      button.style.display = 'none';
    }
  }

  /**
   * FloatingButtonを表示
   */
  private showFloatingButton(): void {
    const button = document.getElementById('feedback-widget-button');
    if (button) {
      button.style.display = 'flex';
    }
  }

  /**
   * モーダルを削除
   */
  private destroyModal(): void {
    const modal = document.getElementById('feedback-widget-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  /**
   * モーダルのイベントリスナーを設定
   */
  private attachModalEventListeners(): void {
    const sendButton = document.getElementById('feedback-widget-send');
    const input = document.getElementById('feedback-widget-input') as HTMLTextAreaElement;

    if (sendButton && input) {
      sendButton.addEventListener('click', () => this.sendMessage());
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // グローバルからアクセスできるようにする
    (window as any).feedbackWidget = this;
  }

  /**
   * メッセージを送信
   */
  private async sendMessage(): Promise<void> {
    const input = document.getElementById('feedback-widget-input') as HTMLTextAreaElement;
    if (!input || !input.value.trim() || !this.session || !this.chatService) return;

    const content = input.value.trim();
    input.value = '';

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    this.session.messages.push(userMessage);
    this.updateMessagesDisplay();

    if (this.debugMode) {
      console.log('[FeedbackWidget] Sending message:', {
        sessionId: this.session.id,
        message: content,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Show loading state
      this.addLoadingMessage();
      
      // Send message to API
      const response = await this.chatService.sendMessage(this.session.id, content);
      
      if (this.debugMode) {
        console.log('[FeedbackWidget] API Response:', response);
      }
      
      // Remove loading message
      this.removeLoadingMessage();
      
      // Add assistant response
      this.session.messages.push(response);
      this.updateMessagesDisplay();
      
    } catch (error) {
      console.error('[FeedbackWidget] Error sending message:', error);
      
      // Remove loading message
      this.removeLoadingMessage();
      
      // Show error message
      this.addAssistantMessage('申し訳ございません。メッセージの送信中にエラーが発生しました。しばらくしてから再度お試しください。');
      
      if (this.debugMode) {
        console.error('[FeedbackWidget] Full error details:', {
          error,
          sessionId: this.session.id,
          message: content,
          apiBase: this.chatService ? 'ChatService initialized' : 'ChatService not initialized'
        });
      }
    }
  }

  /**
   * アシスタントメッセージを追加
   */
  private addAssistantMessage(content: string): void {
    if (!this.session) return;

    const assistantMessage: Message = {
      id: this.generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };

    this.session.messages.push(assistantMessage);
    this.updateMessagesDisplay();
  }

  /**
   * メッセージ表示を更新
   */
  private updateMessagesDisplay(): void {
    const messagesContainer = document.getElementById('feedback-widget-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = this.renderMessages();
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * ローディングメッセージを追加
   */
  private addLoadingMessage(): void {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'feedback-widget-loading';
    loadingDiv.className = 'feedback-widget-message assistant';
    loadingDiv.innerHTML = `
      <div class="feedback-widget-message-content">
        <div class="feedback-widget-loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    
    const messagesContainer = document.getElementById('feedback-widget-messages');
    if (messagesContainer) {
      messagesContainer.appendChild(loadingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * ローディングメッセージを削除
   */
  private removeLoadingMessage(): void {
    const loadingDiv = document.getElementById('feedback-widget-loading');
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
  }

  /**
   * 時刻をフォーマット
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * IDを生成
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * CSSスタイルを追加
   */
  private addStyles(): void {
    const styleId = 'feedback-widget-styles';
    
    // 既存のスタイルがあれば削除
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* FloatingButton */
      .feedback-widget-floating-button {
        position: fixed;
        ${this.config?.position === 'bottom-left' ? 'left' : 'right'}: ${this.config?.offset?.right || this.config?.offset?.left || 24}px;
        bottom: ${this.config?.offset?.bottom || 24}px;
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        transition: all 0.3s ease;
      }

      .feedback-widget-floating-button:hover {
        transform: scale(1.1);
      }

      /* Modal */
      .feedback-widget-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      /* Header */
      .feedback-widget-header {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .feedback-widget-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .feedback-widget-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .feedback-widget-header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .feedback-widget-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }

      .feedback-widget-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      /* Messages */
      .feedback-widget-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .feedback-widget-message {
        max-width: 85%;
        display: flex;
        flex-direction: column;
      }

      .feedback-widget-message.user {
        align-self: flex-end;
        align-items: flex-end;
      }

      .feedback-widget-message.assistant {
        align-self: flex-start;
        align-items: flex-start;
      }

      .feedback-widget-message-content {
        background: #f1f5f9;
        padding: 12px 16px;
        border-radius: 18px;
        word-wrap: break-word;
        line-height: 1.4;
      }

      .feedback-widget-message.user .feedback-widget-message-content {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
      }

      .feedback-widget-message-time {
        font-size: 12px;
        color: #64748b;
        margin-top: 4px;
        padding: 0 8px;
      }

      /* Input Container */
      .feedback-widget-input-container {
        padding: 20px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 12px;
        align-items: flex-end;
        flex-shrink: 0;
      }

      .feedback-widget-input {
        flex: 1;
        min-height: 44px;
        max-height: 120px;
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 22px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        outline: none;
        transition: border-color 0.2s;
      }

      .feedback-widget-input:focus {
        border-color: #6366f1;
      }

      .feedback-widget-send-button {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .feedback-widget-send-button:hover {
        transform: scale(1.05);
      }

      .feedback-widget-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      /* Loading animation */
      .feedback-widget-loading-dots {
        display: flex;
        gap: 4px;
      }

      .feedback-widget-loading-dots span {
        width: 8px;
        height: 8px;
        background: #6366f1;
        border-radius: 50%;
        animation: feedback-widget-pulse 1.4s ease-in-out infinite;
      }

      .feedback-widget-loading-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .feedback-widget-loading-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes feedback-widget-pulse {
        0%, 60%, 100% {
          opacity: 0.3;
          transform: scale(0.8);
        }
        30% {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// シングルトンインスタンス
const FeedbackWidget = new FeedbackWidgetSDK();

// 型定義をエクスポート
export type { FeedbackWidgetConfig, Message, FeedbackData, FeedbackSession } from '@/lib/types';

// メインSDKをデフォルトエクスポート
export default FeedbackWidget;