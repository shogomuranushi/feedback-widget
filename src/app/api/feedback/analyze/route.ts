import { NextRequest, NextResponse } from 'next/server';
import { AIResponseService } from '@/lib/services/AIResponseService';
import { Message } from '@/lib/types';
import { isValidSessionId } from '@/lib/utils/security';

// セッション管理用の簡易インメモリストレージ（chat/route.tsと共有）
declare global {
  var feedbackSessions: Map<string, Message[]>;
}

if (!global.feedbackSessions) {
  global.feedbackSessions = new Map();
}

const sessions = global.feedbackSessions;

export async function POST(request: NextRequest) {
  console.log('=== Feedback Analysis API Request Started ===');
  
  try {
    const { session_id } = await request.json();
    console.log('Analysis request for session_id:', session_id);

    if (!session_id) {
      console.log('Missing session_id in request');
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Validate session ID format
    if (!isValidSessionId(session_id)) {
      console.log('Invalid session ID format:', session_id);
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // セッション履歴を取得
    const sessionHistory = sessions.get(session_id);
    console.log('Session history found:', !!sessionHistory);
    console.log('Session history length:', sessionHistory?.length || 0);
    
    if (!sessionHistory || sessionHistory.length === 0) {
      console.log('Session not found or empty for:', session_id);
      return NextResponse.json(
        { error: 'Session not found or empty' },
        { status: 404 }
      );
    }

    console.log('Session messages:', sessionHistory.map(m => ({
      role: m.role,
      contentLength: m.content?.length,
      timestamp: m.timestamp
    })));

    // AIサービスを使用してフィードバックを分析
    console.log('Starting AI analysis...');
    const aiService = new AIResponseService();
    const analysisResult = await aiService.analyzeFeedbackConversation(sessionHistory);
    
    console.log('Analysis completed:', {
      hasTitle: !!analysisResult?.title,
      hasDescription: !!analysisResult?.description,
      category: analysisResult?.category,
      priority: analysisResult?.priority
    });

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Feedback analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}