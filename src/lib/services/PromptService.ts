import { i18nService } from '../i18n';

export class PromptService {
  static getFeedbackChatPrompt(): string {
    const t = i18nService.getTranslations();
    return t.prompts.feedbackAssistant.systemRole;
  }

  static getFeedbackAnalysisPrompt(): string {
    const t = i18nService.getTranslations();
    return t.prompts.feedbackAssistant.analysisPrompt;
  }

  static getFallbackResponse(messageCount: number): string {
    const t = i18nService.getTranslations();
    const responses = t.prompts.feedbackAssistant.fallbackResponses;

    const index = (messageCount - 1) % responses.length;
    return responses[index];
  }
}