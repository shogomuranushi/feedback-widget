'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WidgetPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const embedded = searchParams.get('embedded') === 'true';

  useEffect(() => {
    setMounted(true);
    
    // 初期メッセージを設定
    const welcomeMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'assistant',
      content: 'こんにちは！機能要望やフィードバックをお聞かせください。どのような改善をご希望ですか？',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    console.log('[Widget] Sending message:', inputValue);

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // ローディング状態を表示
    const loadingMessage: Message = {
      id: 'loading',
      role: 'assistant',
      content: '考えています...',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // セッションIDを生成または取得（英数字のみ）
      const sessionId = window.sessionStorage.getItem('feedback-session-id') || 
                       'session' + Math.random().toString(36).substring(2, 15);
      window.sessionStorage.setItem('feedback-session-id', sessionId);

      console.log('[Widget] Calling API with sessionId:', sessionId);

      // APIを呼び出し
      const response = await fetch('/api/feedback/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage.content,
        }),
      });

      console.log('[Widget] API Response status:', response.status);
      console.log('[Widget] Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('[Widget] Raw response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: 'Invalid JSON response', rawText: responseText };
        }
        console.error('[Widget] API Error:', errorData);
        throw new Error(errorData.error || 'API request failed');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Widget] Failed to parse JSON:', parseError);
        console.error('[Widget] Raw response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      console.log('[Widget] API Response data:', data);
      console.log('[Widget] Response content:', data.content);
      console.log('[Widget] Response content length:', data.content?.length);
      console.log('[Widget] Response content type:', typeof data.content);
      console.log('[Widget] Full response object:', JSON.stringify(data, null, 2));

      // ローディングメッセージを削除
      setMessages(prev => prev.filter(m => m.id !== 'loading'));

      // contentが空でないか確認
      if (!data.content || data.content.trim() === '') {
        console.error('[Widget] Empty content received from API');
        throw new Error('Empty response content');
      }

      // AIレスポンスを追加
      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(data.timestamp),
      };
      console.log('[Widget] Creating assistant message:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);

      // 自動Issue作成・更新の条件をチェック
      const updatedMessages = [...messages, userMessage, assistantMessage];
      const userMessageCount = updatedMessages.filter(m => m.role === 'user').length;
      
      console.log('[Widget] User message count:', userMessageCount);
      
      if (userMessageCount >= 2) {
        if (userMessageCount === 2) {
          console.log('[Widget] First issue creation trigger (2 messages)');
          setTimeout(() => {
            createGitHubIssue(sessionId, false); // false = create new issue
          }, 2000);
        } else {
          console.log('[Widget] Issue update trigger (3+ messages)');
          // 一時的に更新を無効化し、常に新規作成
          setTimeout(() => {
            createGitHubIssue(sessionId, false); // 一時的にfalseに変更
          }, 2000);
        }
      }

    } catch (error) {
      console.error('[Widget] Error sending message:', error);
      
      // ローディングメッセージを削除
      setMessages(prev => prev.filter(m => m.id !== 'loading'));

      // エラーメッセージを表示
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'assistant',
        content: 'すみません、一時的に応答できません。もう一度お試しください。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const createGitHubIssue = async (sessionId: string, isUpdate: boolean = false) => {
    console.log(`[Widget] Starting GitHub issue ${isUpdate ? 'update' : 'creation'} process...`);
    
    try {
      // フィードバックを分析
      console.log('[Widget] Analyzing feedback...');
      const analyzeResponse = await fetch('/api/feedback/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!analyzeResponse.ok) {
        const analyzeError = await analyzeResponse.json();
        console.error('[Widget] Analysis failed:', analyzeError);
        throw new Error(analyzeError.error || 'Failed to analyze feedback');
      }

      const analysisResult = await analyzeResponse.json();
      console.log('[Widget] Analysis result:', analysisResult);

      if (isUpdate) {
        // 既存Issueを更新
        console.log('[Widget] Updating existing GitHub issue...');
        const existingIssueNumber = window.sessionStorage.getItem(`issue-number-${sessionId}`);
        
        if (existingIssueNumber) {
          console.log('[Widget] Attempting to update issue #', existingIssueNumber);
          
          try {
            const updateResponse = await fetch('/api/feedback/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                session_id: sessionId,
                issue_number: parseInt(existingIssueNumber),
                feedback_data: analysisResult,
              }),
            });

            console.log('[Widget] Update response status:', updateResponse.status);
            console.log('[Widget] Update response ok:', updateResponse.ok);

            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              console.log('[Widget] Issue updated successfully:', updateResult);
              return;
            } else {
              console.error('[Widget] Update failed with status:', updateResponse.status);
              const errorText = await updateResponse.text();
              console.error('[Widget] Update error response:', errorText);
            }
          } catch (updateError) {
            console.error('[Widget] Update request failed:', updateError);
          }
        } else {
          console.log('[Widget] No existing issue number found, will create new issue');
        }
      }

      // GitHub Issueを新規作成
      console.log('[Widget] Creating new GitHub issue...');
      const submitResponse = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          feedback_data: analysisResult,
        }),
      });

      if (!submitResponse.ok) {
        const submitError = await submitResponse.json();
        console.error('[Widget] Issue creation failed:', submitError);
        throw new Error(submitError.error || 'Failed to create GitHub issue');
      }

      const issueResult = await submitResponse.json();
      console.log('[Widget] Issue created successfully:', issueResult);

      // Issue番号をセッションに保存
      window.sessionStorage.setItem(`issue-number-${sessionId}`, issueResult.issue_number.toString());

    } catch (error) {
      console.error('[Widget] Error with GitHub issue:', error);
      // エラーメッセージは表示せず、ログのみ出力
    }
  };

  const handleClose = () => {
    // 親ウィンドウにクローズメッセージを送信
    if (window.parent) {
      window.parent.postMessage('closeFeedback', '*');
    }
  };

  if (!mounted) {
    return null;
  }

  const containerStyle = embedded 
    ? { width: '100%', height: '100%', backgroundColor: 'white' }
    : { width: '100vw', height: '100vh', backgroundColor: 'white' };

  return (
    <div style={containerStyle}>
      <style jsx>{`
        .feedback-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .feedback-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .feedback-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feedback-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feedback-header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .feedback-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feedback-message {
          max-width: 85%;
          display: flex;
          flex-direction: column;
        }

        .feedback-message.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .feedback-message.assistant {
          align-self: flex-start;
          align-items: flex-start;
        }

        .feedback-message-content {
          background: #f1f5f9;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .feedback-message.user .feedback-message-content {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
        }

        .feedback-message-time {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
          padding: 0 8px;
        }

        .feedback-input-container {
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .feedback-input {
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

        .feedback-input:focus {
          border-color: #6366f1;
        }

        .feedback-send-button {
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

        .feedback-send-button:hover {
          transform: scale(1.05);
        }

        .feedback-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .feedback-close-button {
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

        .feedback-close-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .feedback-message-content.loading {
          opacity: 0.7;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
      
      <div className="feedback-container">
        <div className="feedback-header">
          <div className="feedback-header-content">
            <div className="feedback-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 7C14.21 7 16 8.79 16 11V22H8V11C8 8.79 9.79 7 12 7Z" />
              </svg>
            </div>
            <h1>フィードバック</h1>
          </div>
          <button className="feedback-close-button" onClick={handleClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="feedback-messages">
          {messages.map(message => (
            <div key={message.id} className={`feedback-message ${message.role}`}>
              <div className={`feedback-message-content ${message.id === 'loading' ? 'loading' : ''}`}>
                {message.content}
              </div>
              <div className="feedback-message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="feedback-input-container">
          <textarea 
            className="feedback-input" 
            placeholder="メッセージを入力..."
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="feedback-send-button"
            onClick={sendMessage}
            disabled={!inputValue.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}