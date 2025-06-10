import { BaseGithubService } from './base/BaseGithubService';
import type { GitHubIssueResponse } from './base/BaseGithubService';

export type { GitHubIssueResponse };

export class GithubService extends BaseGithubService {
  constructor(apiBase: string = '/api/feedback') {
    super(apiBase);
  }
}