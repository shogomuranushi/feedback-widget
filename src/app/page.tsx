'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export default function Home() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // メインページでのみスクロールを有効にする
    document.body.style.overflow = 'auto';
    return () => {
      // コンポーネントがアンマウントされたら元に戻す
      document.body.style.overflow = 'hidden';
    };
  }, []);

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      const newResult = { name, status, message, details };
      
      if (existing) {
        return prev.map(r => r.name === name ? newResult : r);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // 1. 環境変数チェック
    updateTestResult('環境変数チェック', 'pending', 'チェック中...');
    try {
      const envResponse = await fetch('/api/feedback/check-env', {
        method: 'GET',
      });
      const envData = await envResponse.json();
      
      if (envResponse.ok) {
        updateTestResult('環境変数チェック', 'success', '環境変数が正しく設定されています', envData);
      } else {
        updateTestResult('環境変数チェック', 'error', envData.error || '環境変数の設定に問題があります', envData);
      }
    } catch (error) {
      updateTestResult('環境変数チェック', 'error', `エラー: ${error}`, { error: String(error) });
    }

    // 2. Gemini API接続テスト
    updateTestResult('Gemini API接続', 'pending', '接続テスト中...');
    try {
      const geminiResponse = await fetch('/api/feedback/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_message: 'Hello, this is a test message.' }),
      });
      const geminiData = await geminiResponse.json();
      
      if (geminiResponse.ok) {
        updateTestResult('Gemini API接続', 'success', 'Gemini APIに正常に接続できました', geminiData);
      } else {
        updateTestResult('Gemini API接続', 'error', geminiData.error || 'Gemini APIに接続できません', geminiData);
      }
    } catch (error) {
      updateTestResult('Gemini API接続', 'error', `エラー: ${error}`, { error: String(error) });
    }

    // 3. GitHub API接続テスト
    updateTestResult('GitHub API接続', 'pending', '接続テスト中...');
    try {
      const githubResponse = await fetch('/api/feedback/test-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: 'test/test' }),
      });
      const githubData = await githubResponse.json();
      
      if (githubResponse.ok) {
        updateTestResult('GitHub API接続', 'success', 'GitHub APIに正常に接続できました', githubData);
      } else {
        updateTestResult('GitHub API接続', 'error', githubData.error || 'GitHub APIに接続できません', githubData);
      }
    } catch (error) {
      updateTestResult('GitHub API接続', 'error', `エラー: ${error}`, { error: String(error) });
    }

    // 4. ドメイン認証テスト
    updateTestResult('ドメイン認証', 'pending', 'ドメイン認証をテスト中...');
    try {
      const authResponse = await fetch('/api/feedback/test-auth', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': 'widget_dev',
          'X-Origin-Domain': 'localhost',
          'X-GitHub-Repo': 'test/test'
        },
        body: JSON.stringify({}),
      });
      const authData = await authResponse.json();
      
      if (authResponse.ok) {
        updateTestResult('ドメイン認証', 'success', 'ドメイン認証が正常に動作しています', authData);
      } else {
        updateTestResult('ドメイン認証', 'error', authData.error || 'ドメイン認証に失敗しました', authData);
      }
    } catch (error) {
      updateTestResult('ドメイン認証', 'error', `エラー: ${error}`, { error: String(error) });
    }

    // 5. セッション管理テスト
    updateTestResult('セッション管理', 'pending', 'セッション管理をテスト中...');
    try {
      const sessionId = 'test-session-' + Date.now();
      const sessionResponse = await fetch('/api/session/' + sessionId, {
        method: 'GET',
      });
      const sessionData = await sessionResponse.json();
      
      if (sessionResponse.ok) {
        updateTestResult('セッション管理', 'success', 'セッション管理が正常に動作しています', sessionData);
      } else {
        updateTestResult('セッション管理', 'error', sessionData.error || 'セッション管理に問題があります', sessionData);
      }
    } catch (error) {
      updateTestResult('セッション管理', 'error', `エラー: ${error}`, { error: String(error) });
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'pending': return '⏳';
      default: return '?';
    }
  };

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            フィードバックウィジェット設定チェック
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              このページでは、フィードバックウィジェットが正常に動作するために必要な設定をチェックできます。
            </p>
            
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isRunning
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? 'テスト実行中...' : '設定チェック開始'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
              
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      {result.name}
                    </h3>
                    <span className="text-sm font-medium">
                      {result.status === 'success' ? '成功' : 
                       result.status === 'error' ? '失敗' : '実行中'}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">{result.message}</p>
                  
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        詳細を表示
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">設定ファイルの場所</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• 環境変数: <code>.env</code> ファイル</li>
              <li>• ドメイン設定: <code>DOMAIN_API_MAPPINGS</code> 環境変数</li>
              <li>• API キー: <code>GEMINI_API_KEY</code>, <code>GITHUB_TOKEN</code></li>
              <li>• テストページ: <code>/public/test.html</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}