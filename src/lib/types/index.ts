export interface FeedbackWidgetConfig {
  position?: 'bottom-right' | 'bottom-left';
  offset?: {
    bottom?: number;
    right?: number;
    left?: number;
  };
  theme?: 'light' | 'dark' | 'auto';
  repository?: string;
  githubToken?: string;
  geminiApiKey?: string;
  onClose?: () => void;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: Array<{ data: string; mimeType: string; dataURL?: string; file?: any }>;
}

export interface FeedbackSession {
  id: string;
  messages: Message[];
  status: 'active' | 'submitting' | 'completed' | 'error';
  issueUrl?: string;
}

export interface FeedbackData {
  title: string;
  description: string;
  labels?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}