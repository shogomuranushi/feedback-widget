import { NextResponse } from 'next/server';

export async function POST() {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({
        error: 'GITHUB_TOKEN環境変数が設定されていません',
      }, { status: 400 });
    }

    // GitHub APIで認証をテスト（/user エンドポイント）
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'feedback-widget-test',
      },
    });

    if (!response.ok) {
      let errorMessage = 'GitHub APIへの接続に失敗しました';
      
      if (response.status === 401) {
        errorMessage = 'GitHub トークンが無効です';
      } else if (response.status === 403) {
        errorMessage = 'GitHub APIのレート制限またはアクセス拒否';
      } else if (response.status === 404) {
        errorMessage = 'GitHub APIエンドポイントが見つかりません';
      }

      return NextResponse.json({
        error: errorMessage,
        status_code: response.status,
        success: false,
      }, { status: response.status });
    }

    const userData = await response.json();

    // レート制限情報を取得
    const rateLimit = {
      remaining: response.headers.get('x-ratelimit-remaining'),
      limit: response.headers.get('x-ratelimit-limit'),
      reset: response.headers.get('x-ratelimit-reset'),
    };

    return NextResponse.json({
      message: 'GitHub APIに正常に接続できました',
      user: {
        login: userData.login,
        name: userData.name,
        type: userData.type,
      },
      rate_limit: rateLimit,
      success: true,
    });

  } catch (error: any) {
    console.error('GitHub API test error:', error);
    
    let errorMessage = 'GitHub APIテスト中にエラーが発生しました';
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'GitHub APIに接続できません（ネットワークエラー）';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'GitHub APIへの接続が拒否されました';
    }

    return NextResponse.json({
      error: errorMessage,
      error_type: error.constructor.name,
      success: false,
    }, { status: 500 });
  }
}