// フィードバックウィジェット バンドル版
(function() {
  'use strict';

  // 既に読み込まれている場合はスキップ
  if (window.FeedbackWidgetLoaded) {
    return;
  }
  window.FeedbackWidgetLoaded = true;

  // ウィジェットのスタイルを挿入
  const style = document.createElement('style');
  style.textContent = `
    .feedback-widget-launcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 999999;
    }
    
    .feedback-widget-launcher:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    .feedback-widget-launcher svg {
      width: 28px;
      height: 28px;
      color: white;
    }
    
    .feedback-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 380px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
    }
    
    .feedback-widget-container.open {
      display: flex;
    }
    
    .feedback-widget-header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .feedback-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .feedback-widget-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .feedback-widget-iframe {
      flex: 1;
      width: 100%;
      border: none;
    }
  `;
  document.head.appendChild(style);

  // ウィジェットのHTML構造を作成
  function createWidget() {
    // ランチャーボタン
    const launcher = document.createElement('div');
    launcher.className = 'feedback-widget-launcher';
    launcher.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
        <path d="M6 9h12v2H6zM6 13h8v2H6z" fill="white"/>
      </svg>
    `;

    // コンテナ
    const container = document.createElement('div');
    container.className = 'feedback-widget-container';
    container.innerHTML = `
      <div class="feedback-widget-header">
        <div>
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">フィードバック</h3>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">ご意見をお聞かせください</p>
        </div>
        <button class="feedback-widget-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <iframe class="feedback-widget-iframe" src="http://localhost:3001/simple?embedded=true"></iframe>
    `;

    // イベントリスナー
    launcher.addEventListener('click', () => {
      container.classList.add('open');
      launcher.style.display = 'none';
    });

    const closeBtn = container.querySelector('.feedback-widget-close');
    closeBtn.addEventListener('click', () => {
      container.classList.remove('open');
      launcher.style.display = 'flex';
    });

    // DOMに追加
    document.body.appendChild(launcher);
    document.body.appendChild(container);
  }

  // DOMContentLoadedまたは即座に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();