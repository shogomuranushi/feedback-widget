import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY環境変数が設定されていません',
      }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      }
    });

    // 簡単なテストメッセージを送信
    const testPrompt = 'テスト用の質問です。「接続成功」と返答してください。';
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      message: 'Gemini APIに正常に接続できました',
      test_response: text.substring(0, 100), // レスポンスの最初の100文字のみ表示
      model: modelName,
      success: true,
    });

  } catch (error: any) {
    console.error('Gemini API test error:', error);
    
    let errorMessage = 'Gemini APIへの接続に失敗しました';
    let statusCode = 500;

    // Gemini API特有のエラーをチェック
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'Gemini API キーが無効です';
      statusCode = 401;
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Gemini API のクォータを超過しています';
      statusCode = 429;
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'Gemini API へのアクセスが拒否されました';
      statusCode = 403;
    }

    return NextResponse.json({
      error: errorMessage,
      error_type: error.constructor.name,
      success: false,
    }, { status: statusCode });
  }
}