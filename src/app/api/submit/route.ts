import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { FeedbackData } from '@/lib/types';
import { SessionManager } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, feedback_data } = body;

    if (!session_id || !feedback_data) {
      return NextResponse.json(
        { error: 'session_id and feedback_data are required' },
        { status: 400 }
      );
    }

    // 環境変数からリポジトリを取得
    const repository = process.env.GITHUB_REPOSITORY;
    if (!repository) {
      return NextResponse.json(
        { error: 'GITHUB_REPOSITORY environment variable is not set' },
        { status: 500 }
      );
    }

    // GitHubサービスでIssue作成
    const githubService = new GitHubService(repository);
    const issueResult = await githubService.createIssue(feedback_data);

    // セッションをクリア（Issue作成完了）
    SessionManager.clearSession(session_id);

    return NextResponse.json({
      issue_url: issueResult.url,
      issue_number: issueResult.number,
      title: issueResult.title
    });

  } catch (error) {
    console.error('Submit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}