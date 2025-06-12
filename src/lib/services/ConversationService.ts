import { Message } from '../types';
import { PromptService } from './PromptService';

export class ConversationService {
  /**
   * フィードバック用の会話フローを管理
   */
  static processMessage(messages: Message[], newMessage: string): string {
    const messageCount = messages.length + 1; // 新しいメッセージを含めたカウント

    // 最初のメッセージの場合
    if (messageCount === 1) {
      return this.getFirstResponsePrompt(newMessage);
    }

    // 2回目以降のメッセージの場合
    if (messageCount === 2) {
      return this.getSecondResponsePrompt(newMessage);
    }

    // 3回目以降はGeminiに委ねる
    return PromptService.getFeedbackChatPrompt();
  }

  /**
   * 最初のメッセージに対するレスポンス
   */
  private static getFirstResponsePrompt(message: string): string {
    const basePrompt = PromptService.getFeedbackChatPrompt();
    return `${basePrompt}

ユーザーからの最初のメッセージ: "${message}"

このメッセージに対して、短文でポジティブに反応し、なぜその機能を実装したいのか背景を聞いてください。
例: 「いいアイデアですね！✨ なぜその機能を実装したいと思われたのですか？」`;
  }

  /**
   * 2回目のメッセージに対するレスポンス
   */
  private static getSecondResponsePrompt(message: string): string {
    const basePrompt = PromptService.getFeedbackChatPrompt();
    return `${basePrompt}

ユーザーからの2回目のメッセージ: "${message}"

短文で感謝の気持ちを表現し、エンジニアチームへのフィードバック伝達を約束して終了してください。
例: 「ありがとうございました。エンジニアチームにフィードバックしておきます😊」`;
  }

  /**
   * フォールバック応答の生成
   */
  static generateFallbackResponse(messageCount: number): string {
    return PromptService.getFallbackResponse(messageCount);
  }

  /**
   * 会話終了の判定
   */
  static shouldEndConversation(messages: Message[]): boolean {
    // 5回以上のやり取りがあり、十分な情報が得られたと判断される場合
    if (messages.length >= 10) { // ユーザー5回 + AI5回
      return true;
    }

    // ユーザーが明示的に終了を示すキーワードを使った場合
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content.toLowerCase();

    if (lastUserMessage) {
      const endKeywords = ['以上です', 'おわり', '終了', 'イシューを作成', '作成してください'];
      return endKeywords.some(keyword => lastUserMessage.includes(keyword));
    }

    return false;
  }

  /**
   * 会話の質を評価
   */
  static evaluateConversationQuality(messages: Message[]): {
    hasEnoughDetail: boolean;
    hasUseCases: boolean;
    hasPriority: boolean;
    score: number;
  } {
    const userMessages = messages.filter(m => m.role === 'user');
    const conversationText = userMessages.map(m => m.content).join(' ').toLowerCase();

    // 詳細な背景情報があるか
    const hasEnoughDetail = conversationText.length > 100 && userMessages.length >= 2;

    // ユースケースが含まれているか
    const useCaseKeywords = ['使う', '利用', '場面', '時', 'とき', '場合', '状況'];
    const hasUseCases = useCaseKeywords.some(keyword => conversationText.includes(keyword));

    // 優先度を判断できる情報があるか
    const priorityKeywords = ['困る', '不便', '必要', '重要', '急', '問題'];
    const hasPriority = priorityKeywords.some(keyword => conversationText.includes(keyword));

    // スコア計算（0-100）
    let score = 0;
    if (hasEnoughDetail) score += 40;
    if (hasUseCases) score += 30;
    if (hasPriority) score += 30;

    return { hasEnoughDetail, hasUseCases, hasPriority, score };
  }
}