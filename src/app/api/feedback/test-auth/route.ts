import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // ヘッダーから認証情報を取得
    const apiKey = request.headers.get('X-API-Key');
    const originDomain = request.headers.get('X-Origin-Domain');
    const githubRepo = request.headers.get('X-GitHub-Repo');

    if (!apiKey || !originDomain || !githubRepo) {
      return NextResponse.json({
        error: '必要なヘッダーが不足しています',
        required_headers: ['X-API-Key', 'X-Origin-Domain', 'X-GitHub-Repo'],
        received: {
          'X-API-Key': !!apiKey,
          'X-Origin-Domain': !!originDomain,
          'X-GitHub-Repo': !!githubRepo,
        },
        success: false,
      }, { status: 400 });
    }

    // DOMAIN_API_MAPPINGSの設定をチェック
    const domainApiMappings = process.env.DOMAIN_API_MAPPINGS;
    if (!domainApiMappings) {
      return NextResponse.json({
        error: 'DOMAIN_API_MAPPINGS環境変数が設定されていません',
        success: false,
      }, { status: 500 });
    }

    // ドメインとAPIキーのマッピングをパース
    let domainToKeys: Record<string, string[]> = {};
    try {
      const pairs = domainApiMappings.split(';');
      for (const pair of pairs) {
        const [domain, keysStr] = pair.split(':');
        if (domain && keysStr) {
          domainToKeys[domain.trim()] = keysStr.split(',').map(k => k.trim());
        }
      }
    } catch (error) {
      return NextResponse.json({
        error: 'DOMAIN_API_MAPPINGSの形式が正しくありません',
        success: false,
      }, { status: 500 });
    }

    // ドメイン認証をチェック
    const allowedKeys = domainToKeys[originDomain];
    if (!allowedKeys || !allowedKeys.includes(apiKey)) {
      return NextResponse.json({
        error: `ドメイン '${originDomain}' とAPIキーの組み合わせが無効です`,
        domain: originDomain,
        configured_domains: Object.keys(domainToKeys),
        success: false,
      }, { status: 401 });
    }

    // GitHub リポジトリ形式の簡単なチェック
    const repoPattern = /^[\w\-\.]+\/[\w\-\.]+$/;
    if (!repoPattern.test(githubRepo)) {
      return NextResponse.json({
        error: 'GitHub リポジトリの形式が正しくありません（例: owner/repo）',
        repo: githubRepo,
        success: false,
      }, { status: 400 });
    }

    return NextResponse.json({
      message: 'ドメイン認証が成功しました',
      domain: originDomain,
      repo: githubRepo,
      api_key_valid: true,
      success: true,
    });

  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      error: '認証テスト中にエラーが発生しました',
      success: false,
    }, { status: 500 });
  }
}