import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { i18nService } from '../../../../lib/i18n';
import { isValidSessionId, validateFeedbackData, sanitizeInput } from '../../../../lib/utils/security';
import { validateApiKey } from '../../../../lib/utils/apiKeyAuth';

const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-GitHub-Repo, X-Origin-Domain');
  return response;
};

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Max-Age', '86400');
  return setCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    // ウィジェットからの直接リクエストとfeedback_dataラップのリクエストをサポート
    const session_id = requestData.session_id;
    const feedback_data = requestData.feedback_data || requestData;

    const createErrorResponse = (error: string, status: number) => 
      setCorsHeaders(NextResponse.json({ error }, { status }));

    if (!session_id || !feedback_data) {
      return createErrorResponse('session_id and feedback_data are required', 400);
    }

    if (!isValidSessionId(session_id)) {
      return createErrorResponse('Invalid session ID format', 400);
    }

    const feedbackValidation = validateFeedbackData(feedback_data);
    if (!feedbackValidation.isValid) {
      return createErrorResponse(feedbackValidation.error || 'Invalid feedback data', 400);
    }

    // ヘッダーからAPI Key、GitHubリポジトリ、ドメインを取得
    const apiKey = request.headers.get('X-API-Key');
    const githubRepo = request.headers.get('X-GitHub-Repo');
    const originDomain = request.headers.get('X-Origin-Domain');
    
    // API Key + ドメインセット認証
    const apiKeyValidation = validateApiKey(apiKey, originDomain);
    if (!apiKeyValidation.isValid) {
      return createErrorResponse(apiKeyValidation.error || 'Invalid API key', 401);
    }
    
    // GitHub設定の取得（リポジトリはクライアント側で必須指定）
    const repository = githubRepo;
    const githubToken = process.env.GITHUB_TOKEN;
    const githubMention = process.env.GITHUB_MENTION || '@claude';

    if (!githubToken) {
      return createErrorResponse('GitHub token not configured', 500);
    }

    if (!repository) {
      return createErrorResponse('GitHub repository must be specified in X-GitHub-Repo header', 400);
    }

    const [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      return createErrorResponse('Invalid repository format. Expected: owner/repo', 500);
    }
    
    const octokit = new Octokit({ auth: githubToken });

    
    const issueBody = `## 概要

${feedback_data.description || 'ユーザーからのフィードバックです。'}

## カテゴリ
${feedback_data.category || 'feature'}

## 優先度
${feedback_data.priority || 'medium'}

## 会話履歴

<details>
<summary>詳細な会話内容</summary>

\`\`\`
${feedback_data.conversation_history || 'No conversation history available'}
\`\`\`

</details>

---

**Session ID**: ${session_id}  
**Created**: ${new Date().toISOString()}  

${githubMention} 上記のフィードバックについて開発とPRの作成をお願いします。`;

    const sanitizedTitle = sanitizeInput(feedback_data.title, 200);
    const sanitizedLabels = (feedback_data.labels || ['feedback'])
      .map((label: string) => sanitizeInput(label, 50))
      .filter(Boolean);

    const issueResponse = await octokit.rest.issues.create({
      owner,
      repo,
      title: sanitizedTitle,
      body: issueBody,
      labels: sanitizedLabels,
    });

    const issueData = {
      issue_url: issueResponse.data.html_url,
      issue_number: issueResponse.data.number,
      title: issueResponse.data.title,
    };

    return setCorsHeaders(NextResponse.json(issueData));

  } catch (error) {
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? (error as any).message || 'Unknown GitHub error'
      : 'Failed to create GitHub issue';
    
    const errorStatus = error && typeof error === 'object' && 'status' in error 
      ? (error as any).status 
      : undefined;
    
    return setCorsHeaders(NextResponse.json(
      { error: errorMessage, status: errorStatus },
      { status: 500 }
    ));
  }
}