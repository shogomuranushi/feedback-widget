import { BaseChatService } from '../../services/base/BaseChatService';

export class ChatService extends BaseChatService {
  constructor(apiBase?: string) {
    super(apiBase || '/api');
  }
}