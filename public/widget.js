// フィードバックウィジェット SDK
(function() {
  'use strict';


  // 既存のインスタンスがあればそれを使用
  if (window.FeedbackWidget && window.FeedbackWidget._initialized) {
    return;
  }

  // API Base URL
  const API_BASE = 'http://localhost:3001';
  
  // 現在のドメインを取得
  function getCurrentDomain() {
    return window.location.hostname;
  }

  // 設定情報をscriptタグから取得
  function getScriptConfig() {
    const script = document.querySelector('script[src*="widget.js"]');
    if (!script) return {};
    
    return {
      apiKey: script.dataset.apiKey,
      githubRepo: script.dataset.githubRepo,
      position: script.dataset.position || 'bottom-right',
      theme: script.dataset.theme || 'auto',
      bottom: parseInt(script.dataset.bottom || '24'),
      right: parseInt(script.dataset.right || '24'),
      left: parseInt(script.dataset.left || '24'),
      domain: getCurrentDomain()
    };
  }

  // 共通ヘッダー生成（API Key + Domain対応版）
  function getHeaders() {
    const config = getScriptConfig();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // API Key、GitHubリポジトリ、ドメインをヘッダーに追加
    if (config.apiKey) {
      headers['X-API-Key'] = config.apiKey;
    }
    if (config.githubRepo) {
      headers['X-GitHub-Repo'] = config.githubRepo;
    }
    if (config.domain) {
      headers['X-Origin-Domain'] = config.domain;
    }
    
    return headers;
  }

  // ウィジェットSDK
  const FeedbackWidgetSDK = {
    _config: null,
    _initialized: false,
    _isOpen: false,
    _session: null,
    _issueCreated: false,

    init: function(config) {
      if (this._initialized) {
        return;
      }

      this._config = Object.assign({
        position: 'bottom-right',
        theme: 'auto',
        offset: { bottom: 24, right: 24 }
      }, config || {});

      this._initializeSession();
      this._createFloatingButton();
      this._addStyles();
      this._initialized = true;
    },

    _initializeSession: function() {
      this._session = {
        id: 'session' + Math.random().toString(36).substring(2, 15),
        messages: [{
          id: Math.random().toString(36).substring(2, 15),
          role: 'assistant',
          content: 'こんにちは！機能要望やフィードバックをお聞かせください。どのような改善をご希望ですか？',
          timestamp: new Date()
        }]
      };
    },

    _createFloatingButton: function() {
      // 既存のボタンを削除
      const existing = document.getElementById('feedback-widget-button');
      if (existing) existing.remove();

      const button = document.createElement('button');
      button.id = 'feedback-widget-button';
      button.className = 'feedback-widget-floating-button';
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `;

      button.addEventListener('click', () => {
        this._openModal();
      });

      document.body.appendChild(button);
    },

    _openModal: function() {
      if (this._isOpen) return;
      
      this._isOpen = true;
      this._createModal();
    },

    _closeModal: function() {
      if (!this._isOpen) return;
      
      this._isOpen = false;
      this._destroyModal();
    },

    _createModal: function() {
      const modal = document.createElement('div');
      modal.id = 'feedback-widget-modal';
      modal.className = 'feedback-widget-modal';
      modal.innerHTML = `
        <div class="feedback-widget-header">
          <div class="feedback-widget-header-content">
            <div class="feedback-widget-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 7C14.21 7 16 8.79 16 11V22H8V11C8 8.79 9.79 7 12 7Z" />
              </svg>
            </div>
            <h1>フィードバック</h1>
          </div>
          <button class="feedback-widget-close" onclick="window.FeedbackWidget._closeModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="feedback-widget-messages" id="feedback-widget-messages">
          ${this._renderMessages()}
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
            onclick="window.FeedbackWidget._sendMessage()"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      `;

      document.body.appendChild(modal);
      
      // イベントリスナーを設定
      const input = document.getElementById('feedback-widget-input');
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this._sendMessage();
          }
        });
      }
    },

    _destroyModal: function() {
      const modal = document.getElementById('feedback-widget-modal');
      if (modal) modal.remove();
    },

    _renderMessages: function() {
      if (!this._session) return '';

      return this._session.messages.map(message => `
        <div class="feedback-widget-message ${message.role}">
          <div class="feedback-widget-message-content">
            ${message.content}
          </div>
          <div class="feedback-widget-message-time">
            ${this._formatTime(message.timestamp)}
          </div>
        </div>
      `).join('');
    },

    _sendMessage: async function() {
      const input = document.getElementById('feedback-widget-input');
      if (!input || !input.value.trim()) return;

      const content = input.value.trim();
      input.value = '';

      // ユーザーメッセージを追加
      const userMessage = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'user',
        content: content,
        timestamp: new Date()
      };

      this._session.messages.push(userMessage);
      this._updateMessagesDisplay();

      // ローディング表示
      this._addLoadingMessage();

      try {
        const response = await fetch(`${API_BASE}/api/feedback/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            session_id: this._session.id,
            message: content
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // ローディング削除
        this._removeLoadingMessage();

        // レスポンスデータの検証
        if (!data || !data.content) {
          throw new Error('Invalid response: missing content');
        }

        // AIレスポンスを追加
        const assistantMessage = {
          id: Math.random().toString(36).substring(2, 15),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(data.timestamp || new Date())
        };

        this._session.messages.push(assistantMessage);
        this._updateMessagesDisplay();

        // GitHub Issue自動作成チェック（2回以上のユーザーメッセージで作成）
        this._checkAndCreateGitHubIssue();

      } catch (error) {
        this._removeLoadingMessage();
        
        // エラーメッセージを追加
        const errorMessage = {
          id: Math.random().toString(36).substring(2, 15),
          role: 'assistant',
          content: '申し訳ございません。メッセージの送信中にエラーが発生しました。',
          timestamp: new Date()
        };

        this._session.messages.push(errorMessage);
        this._updateMessagesDisplay();
      }
    },

    _addLoadingMessage: function() {
      const messagesContainer = document.getElementById('feedback-widget-messages');
      if (!messagesContainer) return;

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

      messagesContainer.appendChild(loadingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    _removeLoadingMessage: function() {
      const loading = document.getElementById('feedback-widget-loading');
      if (loading) loading.remove();
    },

    _updateMessagesDisplay: function() {
      const container = document.getElementById('feedback-widget-messages');
      if (container) {
        container.innerHTML = this._renderMessages();
        container.scrollTop = container.scrollHeight;
      }
    },

    _formatTime: function(date) {
      return new Date(date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    },

    _checkAndCreateGitHubIssue: function() {
      if (!this._session || this._issueCreated) return;
      
      const userMessageCount = this._session.messages.filter(msg => msg.role === 'user').length;
      
      if (userMessageCount === 2) {
        this._issueCreated = true;
        this._createGitHubIssue();
      }
    },

    _createGitHubIssue: async function() {
      if (!this._session) return;
      
      try {
        const conversationHistory = this._session.messages
          .map(msg => `**${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}** (${this._formatTime(msg.timestamp)})\n${msg.content}`)
          .join('\n\n');
        
        const firstUserMessage = this._session.messages.find(msg => msg.role === 'user')?.content || 'ユーザーからのフィードバック';
        const title = firstUserMessage.length > 50 ? firstUserMessage.substring(0, 47) + '...' : firstUserMessage;
        
        await fetch(`${API_BASE}/api/feedback/submit`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            session_id: this._session.id,
            title: title,
            conversation_history: conversationHistory,
            category: 'feature',
            priority: 'medium',
            description: firstUserMessage,
            labels: ['feedback', 'widget']
          })
        });
        
      } catch (error) {
        // エラーは静かに無視
      }
    },

    _addStyles: function() {
      const styleId = 'feedback-widget-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .feedback-widget-floating-button {
          position: fixed;
          ${this._config.position === 'bottom-left' ? 'left' : 'right'}: ${this._config.offset.right || this._config.offset.left || 24}px;
          bottom: ${this._config.offset.bottom || 24}px;
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
        .feedback-widget-modal {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 400px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          z-index: 999999;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .feedback-widget-modal {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
          }
        }
        .feedback-widget-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 16px 20px;
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
          font-size: 18px;
          font-weight: 600;
        }
        .feedback-widget-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
        }
        .feedback-widget-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .feedback-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 0;
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
        .feedback-widget-input-container {
          padding: 16px;
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
        }
        .feedback-widget-send-button:hover {
          transform: scale(1.05);
        }
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
    },

    destroy: function() {
      ['feedback-widget-button', 'feedback-widget-modal', 'feedback-widget-styles']
        .forEach(id => document.getElementById(id)?.remove());
      
      this._initialized = false;
      this._isOpen = false;
      this._session = null;
      this._issueCreated = false;
    }
  };

  // グローバルに公開
  window.FeedbackWidget = FeedbackWidgetSDK;

  function autoInit() {
    const config = getScriptConfig();
    FeedbackWidgetSDK.init({
      position: config.position,
      theme: config.theme,
      offset: {
        bottom: config.bottom,
        right: config.right,
        left: config.left
      }
    });
  }

  // DOM読み込み後に自動初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    // 既にDOMが読み込まれている場合
    setTimeout(autoInit, 0);
  }

})();