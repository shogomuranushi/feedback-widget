import { Message, FeedbackData } from '../../types';

export abstract class BaseChatService {
  protected apiBase: string;

  constructor(apiBase: string) {
    this.apiBase = apiBase;
  }

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<Message> {
    console.log('[ChatService] Sending message to API:', {
      url: `${this.apiBase}/chat`,
      sessionId,
      messageLength: message.length
    });

    try {
      const response = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message,
        }),
      });

      console.log('[ChatService] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChatService] Error response:', errorText);
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ChatService] Response data:', data);

      return {
        id: Math.random().toString(36).substring(7),
        role: data.role,
        content: data.content,
        timestamp: new Date(data.timestamp),
      };
    } catch (error) {
      console.error('[ChatService] Fetch error:', error);
      throw error;
    }
  }

  async getSessionHistory(sessionId: string): Promise<Message[]> {
    const response = await fetch(`${this.apiBase}/session/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to get session history: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages.map((msg: any) => ({
      id: Math.random().toString(36).substring(7),
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
  }

  async analyzeFeedback(sessionId: string): Promise<FeedbackData> {
    const response = await fetch(`${this.apiBase}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze feedback: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async clearSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.apiBase}/session/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to clear session: ${response.status} ${response.statusText}`);
    }
  }
}