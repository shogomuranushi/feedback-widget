import { GeminiService } from '../gemini';
import { Message } from '../types';
import { ConversationService } from './ConversationService';

export class AIResponseService {
  private geminiService: GeminiService;

  constructor() {
    console.log('Initializing AIResponseService...');
    this.geminiService = new GeminiService();
    console.log('AIResponseService initialized');
  }

  /**
   * フィードバック会話のAIレスポンスを生成
   */
  async generateFeedbackResponse(
    messages: Message[], 
    newMessage: string
  ): Promise<Message> {
    console.log('Generating feedback response...');
    console.log('Input:', {
      messagesCount: messages.length,
      newMessage: newMessage?.substring(0, 50) + '...'
    });
    
    try {
      // 会話フローに基づいてプロンプトを決定
      console.log('Processing message with ConversationService...');
      const prompt = ConversationService.processMessage(messages, newMessage);
      console.log('Prompt processed:', prompt === newMessage ? 'Using original message' : 'Using processed prompt');
      console.log('Generated prompt:', prompt.substring(0, 200) + '...');
      
      // プロンプトが会話フロー管理用の場合、Geminiを使用
      if (prompt === newMessage) {
        console.log('Using fallback response');
        // フォールバック応答
        const content = ConversationService.generateFallbackResponse(messages.length + 1);
        console.log('Fallback content:', content);
        return {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content,
          timestamp: new Date()
        };
      }

      // Geminiを使用してレスポンス生成
      console.log('Preparing messages for Gemini...');
      const allMessages = [...messages, {
        id: Math.random().toString(36).substring(7),
        role: 'user' as const,
        content: newMessage,
        timestamp: new Date()
      }];
      console.log('Total messages for Gemini:', allMessages.length);

      console.log('Calling Gemini service...');
      const response = await this.geminiService.chat(allMessages);
      console.log('Gemini response received successfully');
      return response;

    } catch (error) {
      console.error('AI response generation failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // エラー時のフォールバック
      console.log('Returning fallback response due to error');
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
    console.log('Starting feedback conversation analysis...');
    console.log('Messages to analyze:', messages.length);
    
    try {
      console.log('Calling Gemini for feedback analysis...');
      const result = await this.geminiService.analyzeFeedback(messages);
      console.log('Gemini analysis result:', {
        hasTitle: !!result?.title,
        hasDescription: !!result?.description,
        category: result?.category,
        priority: result?.priority,
        labels: result?.labels
      });
      return result;
    } catch (error) {
      console.error('Feedback analysis failed:', error);
      console.log('Falling back to simple analysis...');
      
      // エラー時のフォールバック分析
      const fallbackResult = this.generateFallbackAnalysis(messages);
      console.log('Fallback analysis result:', fallbackResult);
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