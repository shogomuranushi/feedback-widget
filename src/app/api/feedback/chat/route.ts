import { NextRequest, NextResponse } from 'next/server';
import { AIResponseService } from '@/lib/services/AIResponseService';
import { Message } from '@/lib/types';
import { isValidSessionId, validateMessageContent, sanitizeInput } from '@/lib/utils/security';
import { validateApiKey } from '@/lib/utils/apiKeyAuth';

// セッション管理用の簡易インメモリストレージ（グローバル共有）
declare global {
  var feedbackSessions: Map<string, Message[]>;
}

if (!global.feedbackSessions) {
  global.feedbackSessions = new Map();
}

const sessions = global.feedbackSessions;

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
    const { session_id, message, images } = await request.json();
    
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
      return setCorsHeaders(NextResponse.json(
        { error: apiKeyValidation.error || 'Invalid API key' },
        { status: 401 }
      ));
    }

    // session_idは必須、messageまたは画像のいずれかが必要
    if (!session_id) {
      return setCorsHeaders(NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      ));
    }

    if (!message && (!images || images.length === 0)) {
      return setCorsHeaders(NextResponse.json(
        { error: 'message or images are required' },
        { status: 400 }
      ));
    }

    if (!isValidSessionId(session_id)) {
      return setCorsHeaders(NextResponse.json(
        { error: 'Invalid session ID format' }, 
        { status: 400 }
      ));
    }

    // メッセージがある場合のみバリデーション
    if (message) {
      const messageValidation = validateMessageContent(message);
      if (!messageValidation.isValid) {
        return setCorsHeaders(NextResponse.json(
          { error: messageValidation.error }, 
          { status: 400 }
        ));
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return setCorsHeaders(NextResponse.json(
        { error: 'Gemini API key not configured' }, 
        { status: 500 }
      ));
    }

    if (!sessions.has(session_id)) {
      sessions.set(session_id, []);
    }
    const sessionHistory = sessions.get(session_id)!;

    const sanitizedMessage = message ? sanitizeInput(message, 2000) : '';
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date(),
      ...(images && images.length > 0 && { images })
    };
    sessionHistory.push(userMessage);

    const aiService = new AIResponseService();
    const aiResponse = await aiService.generateFeedbackResponse(
      sessionHistory.slice(0, -1),
      sanitizedMessage,
      images
    );
    sessionHistory.push(aiResponse);

    const responseData = {
      role: aiResponse.role,
      content: aiResponse.content,
      timestamp: aiResponse.timestamp
    };
    
    return setCorsHeaders(NextResponse.json(responseData));

  } catch (error) {
    const getErrorInfo = (err: any): [string, number] => {
      if (err.message?.includes('API key')) return ['AI service configuration error', 503];
      if (err.message?.includes('Permission denied')) return ['AI service access denied', 503];
      if (err.message?.includes('quota')) return ['AI service temporarily unavailable - quota exceeded', 503];
      if (err.message?.includes('Network')) return ['Unable to connect to AI service', 503];
      return ['Internal server error', 500];
    };
    
    const [errorMessage, statusCode] = getErrorInfo(error);
    return setCorsHeaders(NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: statusCode }
    ));
  }
}