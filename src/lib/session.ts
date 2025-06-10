import { Message } from './types';

// セッション管理用のメモリストレージ（本来はRedisなどを使用）
const sessions: Map<string, Message[]> = new Map();

export class SessionManager {
  static addMessage(sessionId: string, message: Message): void {
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    sessions.get(sessionId)!.push(message);
  }

  static getMessages(sessionId: string): Message[] {
    return sessions.get(sessionId) || [];
  }

  static clearSession(sessionId: string): void {
    sessions.delete(sessionId);
  }

  static hasSession(sessionId: string): boolean {
    return sessions.has(sessionId);
  }
}