'use client';

import { useEffect } from 'react';
import FeedbackWidget from '@/lib/feedback-widget';

export default function Home() {
  useEffect(() => {
    console.log('[Page] Starting FeedbackWidget initialization...');
    
    // デモ用の設定
    const config = {
      position: 'bottom-right' as const,
      theme: 'auto' as const,
      // 他のヘルプアイコンと被らないように位置を調整
      offset: {
        bottom: 80, // デフォルトより上に表示
        right: 24,  // デフォルトと同じ右側の距離
      },
    };

    console.log('[Page] FeedbackWidget config:', config);
    console.log('[Page] FeedbackWidget object:', FeedbackWidget);

    try {
      FeedbackWidget.init(config);
      console.log('[Page] FeedbackWidget initialized successfully');
      
      // 初期化後にボタンが存在するかチェック
      setTimeout(() => {
        const button = document.getElementById('feedback-widget-button');
        console.log('[Page] Checking for widget button:', {
          exists: !!button,
          visible: button?.style.display !== 'none',
          element: button
        });
      }, 1000);
      
    } catch (error) {
      console.error('[Page] FeedbackWidget initialization failed:', error);
    }

    return () => {
      setTimeout(() => {
        try {
          console.log('[Page] Cleaning up FeedbackWidget...');
          FeedbackWidget.destroy();
        } catch (error) {
          console.log('[Page] FeedbackWidget cleanup error:', error);
        }
      }, 0);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          フィードバックウィジェット デモ
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">使用方法</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>右下のフィードバックボタンをクリック</li>
            <li>機能要望やフィードバックを入力</li>
            <li>AIがヒアリングを行います</li>
            <li>内容をまとめてGitHub Issueを自動作成</li>
          </ol>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-yellow-900">位置調整の設定例</h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-yellow-800">基本的な位置設定:</h4>
              <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`const config = {
  position: 'bottom-right', // または 'bottom-left'
};`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800">他のヘルプアイコンと被らないように調整:</h4>
              <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`const config = {
  position: 'bottom-right',
  offset: {
    bottom: 80, // 下から80px（デフォルト24px）
    right: 24,  // 右から24px（デフォルト24px）
  },
};`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800">左下配置で上にずらす例:</h4>
              <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`const config = {
  position: 'bottom-left',
  offset: {
    bottom: 100, // 下から100px
    left: 30,    // 左から30px
  },
};`}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">技術仕様</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Gemini API による AI エージェント</li>
            <li>• GitHub API による自動 Issue 作成</li>
            <li>• Claude Code Actions 連携対応</li>
            <li>• 1行導入可能な SDK</li>
            <li>• カスタマイズ可能なアイコン位置</li>
          </ul>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-2">デバッグ情報</h3>
          <p className="text-purple-800 text-sm mb-3">
            フィードバックウィジェットのデバッグモードが有効です。ブラウザのコンソールで詳細なログを確認できます。
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                console.log('Testing API directly...');
                fetch('/api/feedback/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    session_id: 'test-' + Date.now(),
                    message: 'テストメッセージ'
                  })
                })
                .then(res => {
                  console.log('Direct API test response:', res.status);
                  return res.json();
                })
                .then(data => console.log('Direct API test data:', data))
                .catch(err => console.error('Direct API test error:', err));
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition mr-2"
            >
              APIテスト (コンソールを確認)
            </button>
            <button 
              onClick={() => {
                console.log('Checking for widget button...');
                const button = document.getElementById('feedback-widget-button');
                console.log('Widget button status:', {
                  exists: !!button,
                  visible: button?.style.display !== 'none',
                  element: button
                });
                
                if (!button) {
                  console.log('Button not found, trying to re-initialize widget...');
                  try {
                    FeedbackWidget.destroy();
                    setTimeout(() => {
                      FeedbackWidget.init({
                        position: 'bottom-right',
                        theme: 'auto',
                        offset: { bottom: 80, right: 24 }
                      });
                    }, 100);
                  } catch (error) {
                    console.error('Re-initialization failed:', error);
                  }
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              ウィジェット状態確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}