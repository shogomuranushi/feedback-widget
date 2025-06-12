import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 必須の環境変数のみチェック
    const requiredEnvs = {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
      DOMAIN_API_MAPPINGS: !!process.env.DOMAIN_API_MAPPINGS,
    };

    const missingVars = Object.entries(requiredEnvs)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        error: `以下の環境変数が設定されていません: ${missingVars.join(', ')}`,
        configured: requiredEnvs,
        missing: missingVars,
      }, { status: 400 });
    }

    // DOMAIN_API_MAPPINGSの形式チェック（値は表示しない）
    const domainMappings = process.env.DOMAIN_API_MAPPINGS;
    let domainCount = 0;
    
    try {
      if (domainMappings) {
        const pairs = domainMappings.split(';');
        domainCount = pairs.length;
        // 形式の簡単な検証のみ（値は表示しない）
        for (const pair of pairs) {
          const [domain, keysStr] = pair.split(':');
          if (!domain || !keysStr) {
            throw new Error('Invalid format');
          }
        }
      }
    } catch (error) {
      return NextResponse.json({
        error: 'DOMAIN_API_MAPPINGSの形式が正しくありません',
        configured: requiredEnvs,
      }, { status: 400 });
    }

    return NextResponse.json({
      message: '必須の環境変数が正しく設定されています',
      configured: requiredEnvs,
      domain_mappings_count: domainCount,
    });

  } catch (error) {
    console.error('Environment check error:', error);
    return NextResponse.json({
      error: '環境変数チェック中にエラーが発生しました',
    }, { status: 500 });
  }
}