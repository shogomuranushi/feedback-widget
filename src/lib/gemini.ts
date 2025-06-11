import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from './types';
import { ConfigService } from './config';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    try {
      const config = ConfigService.getGeminiConfig();
      
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: config.model,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to initialize GeminiService:', error);
      throw error;
    }
  }

  async chat(messages: Message[]): Promise<Message> {
    try {
      if (messages.length === 1) {
        // 最初のメッセージの場合
        const prompt = this.createInitialPrompt(messages[0].content);
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        return {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
      } else {
        // 会話の継続の場合
        const chatHistory = this.convertToGeminiHistory(messages.slice(0, -1));
        
        const chat = this.model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(messages[messages.length - 1].content);
        const response = await result.response;
        const responseText = response.text();
        
        return {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Gemini API error details:', error);
      
      // より具体的なエラーメッセージを返す
      if (error instanceof Error) {
        if (error.message?.includes('API_KEY')) {
          throw new Error('Gemini API key is invalid or missing');
        } else if (error.message?.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied - check API key permissions');
        } else if (error.message?.includes('QUOTA_EXCEEDED')) {
          throw new Error('API quota exceeded - please try again later');
        } else if (error.message?.includes('NETWORK') || (error as any).code === 'ENOTFOUND') {
          throw new Error('Network connection failed - please check your internet connection');
        } else {
          throw new Error(`Gemini API error: ${error.message}`);
        }
      } else {
        throw new Error('Gemini API error: Unknown error');
      }
    }
  }

  async analyzeFeedback(messages: Message[]): Promise<any> {
    try {
      const conversation = this.formatConversationForAnalysis(messages);
      
      const prompt = `
以下はユーザーとAIアシスタントの会話です。この会話から、GitHub Issueを作成するための情報を抽出してください。

会話:
${conversation}

以下のJSON形式で回答してください:
{
    "title": "簡潔で分かりやすいIssueタイトル",
    "description": "ユーザーの要望や問題を簡潔にまとめた説明",
    "labels": ["適切なラベルのリスト"],
    "category": "feature/bug/enhancement/question",
    "priority": "low/medium/high",
    "conversation_history": "${conversation.replace(/"/g, '\\"')}"
}

重要な要件:
1. titleは具体的で分かりやすく、50文字以内にしてください
2. descriptionはユーザーの要望を簡潔にまとめてください
3. conversation_historyには元の会話内容をそのまま含めてください
4. categoryとpriorityは会話内容から適切に判断してください
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSONレスポンスをパース
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
        throw new Error('No JSON found in response');
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error('Failed to analyze feedback');
    }
  }

  private createInitialPrompt(userMessage: string): string {
    return `
あなたは機能改善のフィードバックを収集するAIアシスタントです。
ユーザーからの要望を詳しくヒアリングし、GitHub Issueに必要な情報を収集することが目的です。

ユーザーの最初のメッセージ: "${userMessage}"

以下の点について詳しく聞いてください:
1. 具体的にどのような機能や改善を求めているか
2. なぜその機能が必要なのか（背景や動機）
3. どの画面や機能に関連するか
4. 想定される利用シーン
5. 優先度や緊急度

まずは簡潔に応答し、1つの質問から始めてください。
`;
  }

  private convertToGeminiHistory(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }

  private formatConversationForAnalysis(messages: Message[]): string {
    return messages.map(msg => {
      const role = msg.role === 'user' ? 'ユーザー' : 'アシスタント';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
  }
}