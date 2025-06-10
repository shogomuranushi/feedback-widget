import { BaseChatService } from './base/BaseChatService';

export class ChatService extends BaseChatService {
  constructor(apiBase: string = '/api/feedback') {
    super(apiBase);
  }
}