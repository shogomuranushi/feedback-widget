import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini';
import { Message } from '@/lib/types';
import { SessionManager } from '@/lib/session';
import { isValidSessionId, validateMessageContent, sanitizeInput } from '@/lib/utils/security';

export async function POST(request: NextRequest) {
  console.log('=== Chat API Request Started ===');
  
  try {
    const body = await request.json();
    const { session_id, message } = body;
    
    console.log('Request body:', { 
      session_id: session_id?.substring(0, 8) + '...', 
      messageLength: message?.length,
      messagePreview: message?.substring(0, 50) + '...'
    });

    if (!session_id || !message) {
      return NextResponse.json(
        { error: 'session_id and message are required' },
        { status: 400 }
      );
    }

    // Validate session ID format
    if (!isValidSessionId(session_id)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Validate message content
    const messageValidation = validateMessageContent(message);
    if (!messageValidation.isValid) {
      return NextResponse.json(
        { error: messageValidation.error },
        { status: 400 }
      );
    }

    // Sanitize and add user message to session
    const sanitizedMessage = sanitizeInput(message, 2000);
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date()
    };
    SessionManager.addMessage(session_id, userMessage);

    // Geminiサービスを初期化してAIレスポンスを取得
    console.log('Initializing GeminiService...');
    const geminiService = new GeminiService();
    
    console.log('Getting session messages...');
    const messages = SessionManager.getMessages(session_id);
    console.log('Session has', messages.length, 'messages');
    
    console.log('Calling Gemini chat...');
    const aiResponse = await geminiService.chat(messages);
    console.log('Gemini response received:', {
      role: aiResponse.role,
      contentLength: aiResponse.content?.length,
      contentPreview: aiResponse.content?.substring(0, 100) + '...'
    });

    // AIレスポンスをセッションに追加
    SessionManager.addMessage(session_id, aiResponse);
    console.log('AI response added to session');

    return NextResponse.json({
      role: aiResponse.role,
      content: aiResponse.content,
      timestamp: aiResponse.timestamp
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // より具体的なエラーメッセージをクライアントに返す
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message?.includes('API key')) {
      errorMessage = 'AI service configuration error';
      statusCode = 503;
    } else if (error.message?.includes('Permission denied')) {
      errorMessage = 'AI service access denied';
      statusCode = 503;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'AI service temporarily unavailable - quota exceeded';
      statusCode = 503;
    } else if (error.message?.includes('Network')) {
      errorMessage = 'Unable to connect to AI service';
      statusCode = 503;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}