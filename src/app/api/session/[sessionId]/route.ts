import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session';
import { isValidSessionId } from '@/lib/utils/security';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    // Validate session ID format
    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }
    
    const messages = SessionManager.getMessages(sessionId);

    return NextResponse.json({
      session_id: sessionId,
      messages: messages,
      status: messages.length > 0 ? 'active' : 'empty'
    });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    // Validate session ID format
    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }
    
    SessionManager.clearSession(sessionId);

    return NextResponse.json({
      message: 'Session cleared successfully'
    });

  } catch (error) {
    console.error('Session delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}