import { GithubService } from '../../services/githubService';
import { FeedbackData } from '../../types';

// fetchのモック
global.fetch = jest.fn();

describe('GithubService', () => {
  let githubService: GithubService;

  beforeEach(() => {
    githubService = new GithubService('/api/feedback');
    jest.clearAllMocks();
  });

  describe('createIssue', () => {
    it('GitHub Issueを作成する', async () => {
      const mockResponse = {
        issue_url: 'https://github.com/test-owner/test-repo/issues/123',
        issue_number: 123,
        title: '[Feature Request] ダークモード機能の追加',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const feedbackData: FeedbackData = {
        title: 'ダークモード機能の追加',
        description: 'アプリケーション全体でダークモードを使用できるようにしたい',
        labels: ['enhancement', 'UI/UX'],
        category: 'feature',
        priority: 'medium',
      };

      const result = await githubService.createIssue(
        'test-session',
        feedbackData,
        'test-github-token',
        'test-owner/test-repo'
      );

      expect(global.fetch).toHaveBeenCalledWith('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: 'test-session',
          feedback_data: feedbackData,
          github_token: 'test-github-token',
          repository: 'test-owner/test-repo',
        }),
      });

      expect(result).toEqual(mockResponse);
    });

    it('エラーレスポンスを適切に処理する', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid GitHub token' }),
      });

      const feedbackData: FeedbackData = {
        title: 'テスト',
        description: 'テスト',
      };

      await expect(
        githubService.createIssue(
          'test-session',
          feedbackData,
          'invalid-token',
          'test-owner/test-repo'
        )
      ).rejects.toThrow('Failed to create GitHub issue: Invalid GitHub token');
    });

    it('ネットワークエラーを処理する', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const feedbackData: FeedbackData = {
        title: 'テスト',
        description: 'テスト',
      };

      await expect(
        githubService.createIssue(
          'test-session',
          feedbackData,
          'test-token',
          'test-owner/test-repo'
        )
      ).rejects.toThrow('Network error');
    });
  });

  describe('validateRepository', () => {
    it('有効なリポジトリ形式を検証する', () => {
      expect(githubService.validateRepository('owner/repo')).toBe(true);
      expect(githubService.validateRepository('test-owner/test-repo')).toBe(true);
    });

    it('無効なリポジトリ形式を検出する', () => {
      expect(githubService.validateRepository('invalid')).toBe(false);
      expect(githubService.validateRepository('owner/')).toBe(false);
      expect(githubService.validateRepository('/repo')).toBe(false);
      expect(githubService.validateRepository('owner/repo/extra')).toBe(false);
    });
  });
});