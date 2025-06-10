import { ChatService } from '../../services/chatService';
import { Message } from '../../types';

// fetchのモック
global.fetch = jest.fn();

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService('/api/feedback');
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('メッセージを送信して応答を受け取る', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'どのような機能を追加したいですか？',
        timestamp: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatService.sendMessage(
        'test-session',
        'ダークモードを追加したい',
        'test-gemini-key'
      );

      expect(global.fetch).toHaveBeenCalledWith('/api/feedback/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: 'test-session',
          message: 'ダークモードを追加したい',
          gemini_api_key: 'test-gemini-key',
        }),
      });

      expect(result).toEqual(mockResponse);
    });

    it('エラーレスポンスを適切に処理する', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        chatService.sendMessage('test-session', 'test', 'test-key')
      ).rejects.toThrow('Failed to send message: 500 Internal Server Error');
    });

    it('ネットワークエラーを処理する', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        chatService.sendMessage('test-session', 'test', 'test-key')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getSessionHistory', () => {
    it('セッション履歴を取得する', async () => {
      const mockHistory: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'ダークモードを追加したい',
          timestamp: new Date(),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'どのような機能を追加したいですか？',
          timestamp: new Date(),
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockHistory }),
      });

      const result = await chatService.getSessionHistory('test-session');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/session/test-session'
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('analyzeFeeback', () => {
    it('フィードバックを分析してIssueデータを生成する', async () => {
      const mockAnalysis = {
        title: '[Feature Request] ダークモード機能の追加',
        description: '## 概要\nダークモード機能を追加する',
        labels: ['enhancement', 'UI/UX'],
        category: 'feature',
        priority: 'medium',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      });

      const result = await chatService.analyzeFeedback(
        'test-session',
        'test-gemini-key'
      );

      expect(global.fetch).toHaveBeenCalledWith('/api/feedback/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: 'test-session',
          gemini_api_key: 'test-gemini-key',
        }),
      });

      expect(result).toEqual(mockAnalysis);
    });
  });
});