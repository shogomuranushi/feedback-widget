import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini';
import { SessionManager } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // セッションメッセージを取得
    const messages = SessionManager.getMessages(session_id);
    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Geminiサービスでフィードバックを分析
    const geminiService = new GeminiService();
    const analysisResult = await geminiService.analyzeFeedback(messages);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}