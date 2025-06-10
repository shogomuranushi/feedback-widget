import { NextRequest, NextResponse } from 'next/server';
import { getSecurityMetrics } from '../../../../lib/security/validation';

export async function GET(request: NextRequest) {
  try {
    // 開発環境でのみアクセス可能
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Security metrics endpoint is only available in development mode' },
        { status: 404 }
      );
    }
    
    const metrics = getSecurityMetrics();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics,
      summary: {
        totalEvents: Object.values(metrics).reduce((sum: number, m: any) => sum + m.count, 0),
        uniqueIPs: new Set(Object.values(metrics).flatMap((m: any) => Array.from(m.ips || []))).size,
        criticalEvents: Object.entries(metrics).filter(([event, _]) => 
          ['RATE_LIMIT_EXCEEDED', 'ORIGIN_VALIDATION_FAILED', 'API_KEY_VALIDATION_FAILED'].includes(event)
        ).length
      }
    });
    
  } catch (error) {
    console.error('Admin security API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}