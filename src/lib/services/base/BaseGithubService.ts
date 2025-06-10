import { FeedbackData } from '../../types';

export interface GitHubIssueResponse {
  issue_url: string;
  issue_number: number;
  title: string;
}

export abstract class BaseGithubService {
  protected apiBase: string;

  constructor(apiBase: string) {
    this.apiBase = apiBase;
  }

  async createIssue(
    sessionId: string,
    feedbackData: FeedbackData
  ): Promise<GitHubIssueResponse> {
    const response = await fetch(`${this.apiBase}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        feedback_data: feedbackData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `${response.status} ${response.statusText}`;
      throw new Error(`Failed to create GitHub issue: ${errorMessage}`);
    }

    return await response.json();
  }

  validateRepository(repository: string): boolean {
    const repositoryPattern = /^[^/]+\/[^/]+$/;
    return repositoryPattern.test(repository);
  }

  validateGitHubToken(token: string): boolean {
    // 基本的なGitHubトークンの形式チェック
    return token.length > 0 && (
      token.startsWith('ghp_') || // Personal Access Token
      token.startsWith('gho_') || // OAuth token
      token.startsWith('ghu_') || // User-to-server token
      token.startsWith('ghs_') || // Server-to-server token
      token.startsWith('ghr_')    // Refresh token
    );
  }
}