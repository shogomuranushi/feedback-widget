import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { i18nService } from '../../../../lib/i18n';
import { isValidSessionId, validateFeedbackData, sanitizeInput } from '../../../../lib/utils/security';
import { validateApiKey } from '../../../../lib/utils/apiKeyAuth';
import { Message } from '../../../../lib/types';

// セッション管理用の簡易インメモリストレージ（グローバル共有）
declare global {
  var feedbackSessions: Map<string, Message[]>;
}

const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-GitHub-Repo, X-Origin-Domain, X-User-ID, X-User-Email, X-User-Name');
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
    console.log('Issue作成リクエスト受信:', { session_id: requestData.session_id });
    
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

    // ヘッダーからAPI Key、GitHubリポジトリ、ドメイン、ユーザー情報を取得
    const apiKey = request.headers.get('X-API-Key');
    const githubRepo = request.headers.get('X-GitHub-Repo');
    const originDomain = request.headers.get('X-Origin-Domain');
    const userId = request.headers.get('X-User-ID');
    const userEmail = request.headers.get('X-User-Email');
    const userName = request.headers.get('X-User-Name');
    
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

    // セッションストアから実際の会話履歴を取得（画像データを含む）
    const sessions = global.feedbackSessions || new Map();
    const sessionHistory = sessions.get(session_id) || [];
    
    // 会話履歴から画像を抽出（実際の画像データも保持）
    const attachedImages: Array<{ mimeType: string; data: string }> = [];
    const imageDescriptions: string[] = [];
    let conversationText = '';
    
    sessionHistory.forEach((message, index) => {
      const speaker = message.role === 'user' ? 'ユーザー' : 'アシスタント';
      const timestamp = new Date(message.timestamp).toLocaleString('ja-JP');
      conversationText += `**${speaker}** (${timestamp})\n${message.content}\n\n`;
      
      // 画像がある場合は画像データと情報を保存
      if (message.images && message.images.length > 0) {
        message.images.forEach((image, imgIndex) => {
          const imageNumber = attachedImages.length + 1;
          attachedImages.push({
            mimeType: image.mimeType,
            data: image.data
          });
          imageDescriptions.push(`画像${imageNumber}: ${image.mimeType} (サイズ: ${Math.round(image.data.length * 0.75 / 1024)}KB)`);
          conversationText += `[添付画像${imageNumber}: ${image.mimeType}]\n\n`;
        });
      }
    });
    
    // ユーザー情報セクションを準備
    let userInfoSection = '';
    if (userId || userEmail || userName) {
      userInfoSection = `## ユーザー情報

${userId ? `**User ID**: ${userId}` : ''}
${userEmail ? `**Email**: ${userEmail}` : ''}
${userName ? `**Name**: ${userName}` : ''}

`;
    }

    const issueBody = `## 概要

${feedback_data.description || 'ユーザーからのフィードバックです。'}

## カテゴリ
${feedback_data.category || 'feature'}

## 優先度
${feedback_data.priority || 'medium'}

${userInfoSection}## 添付画像

${imageDescriptions.length > 0 ? imageDescriptions.join('\n') : '添付画像はありません。'}


## 会話履歴

<details>
<summary>詳細な会話内容</summary>

\`\`\`
${conversationText || feedback_data.conversation_history || 'No conversation history available'}
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

    console.log('GitHub Issue作成開始:', { owner, repo, title: sanitizedTitle });

    const issueResponse = await octokit.rest.issues.create({
      owner,
      repo,
      title: sanitizedTitle,
      body: issueBody,
      labels: sanitizedLabels,
    });

    console.log('GitHub Issue作成成功:', issueResponse.data.number, issueResponse.data.html_url);

    // 画像がある場合は、画像情報をIssue本文に含める
    if (attachedImages.length > 0) {
      console.log(`${attachedImages.length}枚の画像情報を記録`);
    }

    const issueData = {
      issue_url: issueResponse.data.html_url,
      issue_number: issueResponse.data.number,
      title: issueResponse.data.title,
      notify_enabled: process.env.GITHUB_NOTIFY === 'true',
    };

    return setCorsHeaders(NextResponse.json(issueData));

  } catch (error) {
    console.error('Issue作成エラー:', error);
    
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