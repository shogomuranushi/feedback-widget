import { Octokit } from '@octokit/rest';
import { FeedbackData } from './types';

export class GitHubService {
  private octokit: Octokit;
  private repository: string;

  constructor(repository: string) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    
    this.octokit = new Octokit({ auth: token });
    this.repository = repository;
    
    if (!this.validateRepository(repository)) {
      throw new Error('Invalid repository format. Expected "owner/repo"');
    }
  }

  async createIssue(feedbackData: FeedbackData): Promise<any> {
    try {
      const [owner, repo] = this.repository.split('/');
      
      const title = this.formatIssueTitle(feedbackData);
      const body = this.formatIssueBody(feedbackData);
      const labels = this.getIssueLabels(feedbackData);

      const response = await this.octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels
      });

      return {
        url: response.data.html_url,
        number: response.data.number,
        title: response.data.title
      };
    } catch (error) {
      console.error('GitHub API error:', error);
      throw new Error('Failed to create GitHub issue');
    }
  }

  private validateRepository(repository: string): boolean {
    const repositoryPattern = /^[^/]+\/[^/]+$/;
    return repositoryPattern.test(repository);
  }

  private formatIssueTitle(feedbackData: FeedbackData): string {
    const category = feedbackData.category || 'feature';
    
    let prefix = '[Request]';
    if (category.toLowerCase() === 'bug') {
      prefix = '[Bug Report]';
    } else if (category.toLowerCase() === 'feature') {
      prefix = '[Feature Request]';
    } else if (category.toLowerCase() === 'enhancement') {
      prefix = '[Enhancement]';
    }
    
    return `${prefix} ${feedbackData.title}`;
  }

  private formatIssueBody(feedbackData: FeedbackData): string {
    const bodyParts = [
      '## 概要',
      feedbackData.description,
      ''
    ];
    
    if (feedbackData.category) {
      bodyParts.push('## カテゴリ', feedbackData.category, '');
    }
    
    if (feedbackData.priority) {
      bodyParts.push('## 優先度', feedbackData.priority, '');
    }
    
    bodyParts.push(
      '---',
      '',
      '@claude',
      '',
      '_このIssueはユーザーフィードバックから自動生成されました。_'
    );
    
    return bodyParts.join('\n');
  }

  private getIssueLabels(feedbackData: FeedbackData): string[] {
    const labels = ['feedback']; // デフォルトラベル
    
    if (feedbackData.labels) {
      labels.push(...feedbackData.labels);
    }
    
    // 優先度ラベル
    if (feedbackData.priority) {
      labels.push(`${feedbackData.priority}-priority`);
    }
    
    // カテゴリラベル
    if (feedbackData.category) {
      labels.push(feedbackData.category);
    }
    
    return Array.from(new Set(labels)); // 重複除去
  }
}