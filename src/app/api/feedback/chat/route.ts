import { NextRequest, NextResponse } from 'next/server';
import { AIResponseService } from '@/lib/services/AIResponseService';
import { Message } from '@/lib/types';
import { isValidSessionId, validateMessageContent, sanitizeInput } from '@/lib/utils/security';

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
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Max-Age', '86400');
  return setCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    const { session_id, message } = await request.json();

    if (!session_id || !message) {
      return NextResponse.json(
        { error: 'session_id and message are required' },
        { status: 400 }
      );
    }

    if (!isValidSessionId(session_id)) {
      return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
    }

    const messageValidation = validateMessageContent(message);
    if (!messageValidation.isValid) {
      return NextResponse.json({ error: messageValidation.error }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    if (!sessions.has(session_id)) {
      sessions.set(session_id, []);
    }
    const sessionHistory = sessions.get(session_id)!;

    const sanitizedMessage = sanitizeInput(message, 2000);
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date()
    };
    sessionHistory.push(userMessage);

    const aiService = new AIResponseService();
    const aiResponse = await aiService.generateFeedbackResponse(
      sessionHistory.slice(0, -1),
      sanitizedMessage
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