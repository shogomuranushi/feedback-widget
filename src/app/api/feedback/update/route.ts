import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { i18nService } from '../../../../lib/i18n';
import { isValidSessionId, validateFeedbackData, sanitizeInput } from '../../../../lib/utils/security';

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  // CORS headers for preflight requests
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

export async function POST(request: NextRequest) {
  console.log('=== GitHub Issue Update API Request Started ===');
  
  try {
    const { session_id, issue_number, feedback_data } = await request.json();
    console.log('Issue update request:', {
      session_id,
      issue_number,
      hasFeedbackData: !!feedback_data,
      feedbackDataKeys: feedback_data ? Object.keys(feedback_data) : []
    });

    // Helper function to create CORS-enabled error response
    const createErrorResponse = (error: string, status: number) => {
      const response = NextResponse.json({ error }, { status });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    };

    // Validate input parameters
    if (!session_id || !issue_number || !feedback_data) {
      console.log('Missing required parameters');
      return createErrorResponse('session_id, issue_number, and feedback_data are required', 400);
    }

    // Validate session ID format
    if (!isValidSessionId(session_id)) {
      console.log('Invalid session ID format:', session_id);
      return createErrorResponse('Invalid session ID format', 400);
    }

    // Validate feedback data structure and content
    const feedbackValidation = validateFeedbackData(feedback_data);
    if (!feedbackValidation.isValid) {
      console.log('Invalid feedback data:', feedbackValidation.error);
      return createErrorResponse(feedbackValidation.error || 'Invalid feedback data', 400);
    }

    // 環境変数からGitHub設定を取得
    console.log('Loading GitHub configuration...');
    const githubToken = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    const githubMention = process.env.GITHUB_MENTION || '@claude';

    console.log('GitHub config:', {
      hasToken: !!githubToken,
      tokenLength: githubToken?.length,
      repository,
      githubMention
    });

    if (!githubToken || !repository) {
      console.error('Missing GitHub configuration:', {
        hasToken: !!githubToken,
        hasRepository: !!repository
      });
      return NextResponse.json(
        { error: 'GitHub configuration not found' },
        { status: 500 }
      );
    }

    // リポジトリ形式を検証
    const [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      console.error('Invalid repository format:', repository);
      return NextResponse.json(
        { error: 'Invalid repository format. Expected: owner/repo' },
        { status: 500 }
      );
    }

    console.log('Repository parsed:', { owner, repo });
    
    // Octokitクライアントを初期化
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Build updated Issue body
    const t = i18nService.getTranslations();
    
    const issueBody = `## 概要

${feedback_data.description || 'ユーザーからのフィードバックです。'}

## カテゴリ
${feedback_data.category || 'feature'}

## 優先度
${feedback_data.priority || 'medium'}

## 会話履歴

<details>
<summary>詳細な会話内容（更新済み）</summary>

\`\`\`
${feedback_data.conversation_history || 'No conversation history available'}
\`\`\`

</details>

---

**Session ID**: ${session_id}  
**Last Updated**: ${new Date().toISOString()}  

${githubMention} 上記のフィードバックについて開発とPRの作成をお願いします。

*このIssueは追加の会話内容で更新されました。*`;

    // Sanitize input before updating GitHub issue
    const sanitizedTitle = sanitizeInput(feedback_data.title, 200);
    const sanitizedLabels = (feedback_data.labels || ['feedback']).map((label: string) => 
      sanitizeInput(label, 50)
    ).filter(Boolean);

    // GitHub Issueを更新
    console.log('Updating issue with params:', { 
      owner, 
      repo, 
      issue_number,
      title: sanitizedTitle,
      bodyLength: issueBody.length,
      labels: sanitizedLabels
    });
    
    console.log('Updated issue body preview:', issueBody.substring(0, 200) + '...');
    
    const issueResponse = await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issue_number,
      title: sanitizedTitle,
      body: issueBody,
      labels: sanitizedLabels,
    });
    
    console.log('Issue updated successfully:', {
      number: issueResponse.data.number,
      url: issueResponse.data.html_url,
      title: issueResponse.data.title
    });

    const issueData = {
      issue_url: issueResponse.data.html_url,
      issue_number: issueResponse.data.number,
      title: issueResponse.data.title,
      updated: true
    };

    return NextResponse.json(issueData);

  } catch (error) {
    console.error('Update API error:', error);
    
    // GitHubエラーの詳細を含める
    if (error && typeof error === 'object' && 'status' in error) {
      const errorMessage = 'message' in error && typeof error.message === 'string' 
        ? error.message 
        : 'Unknown GitHub error';
      
      return NextResponse.json(
        { 
          error: 'GitHub API error',
          details: errorMessage,
          status: error.status 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update GitHub issue' },
      { status: 500 }
    );
  }
}