// フィードバックウィジェット SDK
(function() {
  'use strict';


  // 既存のインスタンスがあればそれを使用
  if (window.FeedbackWidget && window.FeedbackWidget._initialized) {
    return;
  }

  // API Base URLを自動検出
  function getApiBase() {
    const script = document.querySelector('script[src*="widget.js"]');
    if (!script || !script.src) {
      // フォールバック（開発環境等）
      return 'http://localhost:3001';
    }
    
    try {
      const url = new URL(script.src);
      // widget.jsと同じオリジンをAPIベースとして使用
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      // URL解析エラー時のフォールバック
      return 'http://localhost:3001';
    }
  }
  
  const API_BASE = getApiBase();
  
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
            ${this._convertLinksToHtml(message.content)}
          </div>
          <div class="feedback-widget-message-time">
            ${this._formatTime(message.timestamp)}
          </div>
        </div>
      `).join('');
    },

    _convertLinksToHtml: function(text) {
      // Markdownリンク [text](url) をHTMLリンクに変換
      return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    },

    _showIssueCreatedNotification: function(issueNumber, issueUrl) {
      // 既存の通知があれば削除
      const existingNotification = document.getElementById('feedback-widget-issue-notification');
      if (existingNotification) {
        existingNotification.remove();
      }

      // 通知要素を作成
      const notification = document.createElement('div');
      notification.id = 'feedback-widget-issue-notification';
      notification.className = 'feedback-widget-issue-notification';
      notification.innerHTML = `
        <div class="feedback-widget-notification-content">
          <div class="feedback-widget-notification-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="feedback-widget-notification-text">
            <div class="feedback-widget-notification-title">GitHub Issueが作成されました</div>
            <div class="feedback-widget-notification-link">
              <a href="${issueUrl}" target="_blank" rel="noopener noreferrer">#${issueNumber}</a>
            </div>
          </div>
          <button class="feedback-widget-notification-close" onclick="this.parentElement.parentElement.remove()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      `;

      // メッセージコンテナの上に挿入
      const messagesContainer = document.getElementById('feedback-widget-messages');
      if (messagesContainer) {
        messagesContainer.parentNode.insertBefore(notification, messagesContainer);
      }
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

      // ユーザーメッセージの数をチェック
      const userMessageCount = this._session.messages.filter(msg => msg.role === 'user').length;

      // 2回目のユーザーメッセージの場合、固定レスポンスを返す
      if (userMessageCount === 2) {
        // ローディング表示（短時間）
        this._addLoadingMessage();
        
        // 少し待ってからレスポンスを表示（自然な感じにするため）
        setTimeout(() => {
          this._removeLoadingMessage();
          
          // 固定レスポンスを追加
          const assistantMessage = {
            id: Math.random().toString(36).substring(2, 15),
            role: 'assistant',
            content: 'ありがとうございました😊 エンジニアチームにフィードバックしました📝',
            timestamp: new Date()
          };

          this._session.messages.push(assistantMessage);
          this._updateMessagesDisplay();

          // GitHub Issue自動作成チェック
          this._checkAndCreateGitHubIssue();
        }, 800);
        
        return;
      }

      // 1回目のユーザーメッセージの場合、Gemini APIを呼び出す
      // ローディング表示
      this._addLoadingMessage();

      try {
        // タイムアウト付きfetch（20秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        
        const response = await fetch(`${API_BASE}/api/feedback/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            session_id: this._session.id,
            message: content
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

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
        
        let errorContent = '申し訳ございません。メッセージの送信中にエラーが発生しました。';
        
        // エラーの種類に応じてメッセージを変更
        if (error.name === 'AbortError') {
          errorContent = '応答に時間がかかっています。もう一度お試しください。';
        } else if (error.message && error.message.includes('Failed to fetch')) {
          errorContent = 'ネットワークエラーが発生しました。接続を確認してもう一度お試しください。';
        }
        
        // エラーメッセージを追加
        const errorMessage = {
          id: Math.random().toString(36).substring(2, 15),
          role: 'assistant',
          content: errorContent,
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

    _disableInputAndShowNewFeedbackButton: function() {
      const inputContainer = document.querySelector('.feedback-widget-input-container');
      if (!inputContainer) return;

      // 入力コンテナを新しいフィードバックボタンに置き換え
      inputContainer.innerHTML = `
        <div class="feedback-widget-new-session-container">
          <p class="feedback-widget-session-complete">フィードバックありがとうございました！</p>
          <button 
            id="feedback-widget-new-session" 
            class="feedback-widget-new-session-button"
            onclick="window.FeedbackWidget._startNewSession()"
          >
            新しいフィードバックを投稿する
          </button>
        </div>
      `;
    },

    _startNewSession: function() {
      // セッションをリセット
      this._session = null;
      this._issueCreated = false;
      
      // すべての通知を削除
      document.querySelectorAll('.feedback-widget-notification').forEach(el => el.remove());
      
      // セッションを再初期化
      this._initializeSession();
      
      // モーダルを一度閉じて再度開く（確実にクリアするため）
      this._destroyModal();
      this._isOpen = false;
      
      // 少し待ってから再度開く
      setTimeout(() => {
        this._openModal();
      }, 100);
    },


    _checkAndCreateGitHubIssue: function() {
      if (!this._session || this._issueCreated) return;
      
      const userMessageCount = this._session.messages.filter(msg => msg.role === 'user').length;
      
      if (userMessageCount === 2) {
        this._issueCreated = true;
        this._createGitHubIssue();
        // 入力を無効化し、新しいフィードバックボタンを表示
        this._disableInputAndShowNewFeedbackButton();
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
        
        const response = await fetch(`${API_BASE}/api/feedback/submit`, {
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
        
        if (response.ok) {
          const result = await response.json();
          // GITHUB_NOTIFYがtrueの場合のみIssue作成成功通知を表示
          if (result.notify_enabled) {
            this._showIssueCreatedNotification(result.issue_number, result.issue_url);
          }
        }
        
      } catch (error) {
        // エラーは静かに無視（ユーザー体験を損なわないため）
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
        .feedback-widget-message-content a {
          color: #3b82f6;
          text-decoration: underline;
          font-weight: 500;
        }
        .feedback-widget-message.user .feedback-widget-message-content a {
          color: #ddd6fe;
        }
        .feedback-widget-message-content a:hover {
          color: #1d4ed8;
        }
        .feedback-widget-message.user .feedback-widget-message-content a:hover {
          color: #c4b5fd;
        }
        .feedback-widget-issue-notification {
          margin: 16px;
          margin-bottom: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          animation: feedback-widget-slide-in 0.3s ease-out;
        }
        .feedback-widget-notification-content {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 12px;
        }
        .feedback-widget-notification-icon {
          flex-shrink: 0;
          opacity: 0.9;
        }
        .feedback-widget-notification-text {
          flex: 1;
          min-width: 0;
        }
        .feedback-widget-notification-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .feedback-widget-notification-link {
          font-size: 13px;
          opacity: 0.9;
        }
        .feedback-widget-notification-link a {
          color: #d1fae5;
          text-decoration: none;
          font-weight: 500;
        }
        .feedback-widget-notification-link a:hover {
          color: white;
          text-decoration: underline;
        }
        .feedback-widget-notification-close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.7;
        }
        .feedback-widget-notification-close:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }
        @keyframes feedback-widget-slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
        .feedback-widget-new-session-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px;
          text-align: center;
        }
        .feedback-widget-session-complete {
          color: #059669;
          font-weight: 500;
          margin: 0;
          font-size: 14px;
        }
        .feedback-widget-new-session-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }
        .feedback-widget-new-session-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }
        .feedback-widget-new-session-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }
      `;
      document.head.appendChild(style);
    },

    destroy: function() {
      ['feedback-widget-button', 'feedback-widget-modal', 'feedback-widget-styles', 'feedback-widget-issue-notification']
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