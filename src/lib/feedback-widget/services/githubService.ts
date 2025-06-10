import { BaseGithubService } from '../../services/base/BaseGithubService';
import type { GitHubIssueResponse } from '../../services/base/BaseGithubService';

export type { GitHubIssueResponse };

export class GithubService extends BaseGithubService {
  constructor(apiBase?: string) {
    super(apiBase || '/api');
  }
}