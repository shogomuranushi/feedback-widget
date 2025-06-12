import { GeminiService } from '../gemini';
import { Message } from '../types';
import { ConversationService } from './ConversationService';

export class AIResponseService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  /**
   * フィードバック会話のAIレスポンスを生成
   */
  async generateFeedbackResponse(
    messages: Message[], 
    newMessage: string,
    images?: Array<{ data: string; mimeType: string }>
  ): Promise<Message> {
    try {
      // 会話フローに基づいてプロンプトを決定
      const prompt = ConversationService.processMessage(messages, newMessage);
      
      // プロンプトが会話フロー管理用の場合、Geminiを使用
      if (prompt === newMessage) {
        // フォールバック応答
        const content = ConversationService.generateFallbackResponse(messages.length + 1);
        return {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content,
          timestamp: new Date()
        };
      }

      // Geminiを使用してレスポンス生成
      const allMessages = [...messages, {
        id: Math.random().toString(36).substring(7),
        role: 'user' as const,
        content: newMessage,
        timestamp: new Date(),
        ...(images && images.length > 0 && { images })
      }];

      const response = await this.geminiService.chat(allMessages, prompt, images);
      return response;

    } catch (error) {
      console.error('AI response generation failed:', error);
      
      // エラー時のフォールバック
      return {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: 'すみません、一時的に応答できません。もう一度お試しください。',
        timestamp: new Date()
      };
    }
  }

  /**
   * フィードバック分析用のAIレスポンスを生成
   */
  async analyzeFeedbackConversation(messages: Message[]): Promise<any> {
    try {
      const result = await this.geminiService.analyzeFeedback(messages);
      return result;
    } catch (error) {
      console.error('Feedback analysis failed:', error);
      
      // エラー時のフォールバック分析
      const fallbackResult = this.generateFallbackAnalysis(messages);
      return fallbackResult;
    }
  }

  /**
   * エラー時のフォールバック分析を生成
   */
  private generateFallbackAnalysis(messages: Message[]): any {
    const userMessages = messages.filter(m => m.role === 'user');
    const firstMessage = userMessages[0]?.content || '';
    
    // 簡易的な分析
    const isFeatureRequest = /機能|追加|欲しい|したい/.test(firstMessage);
    const isBugReport = /バグ|エラー|動かない|おかしい/.test(firstMessage);
    const isImprovement = /改善|良く|使いやすく/.test(firstMessage);

    let category = 'question';
    if (isFeatureRequest) category = 'feature';
    else if (isBugReport) category = 'bug';
    else if (isImprovement) category = 'improvement';

    return {
      title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      description: `ユーザーからのフィードバック:\n\n${userMessages.map(m => `- ${m.content}`).join('\n')}`,
      labels: [category],
      category,
      priority: 'medium'
    };
  }
}