export const enTranslations = {
  // UI Labels and Buttons
  ui: {
    feedback: 'Feedback',
    close: 'Close',
    minimize: 'Minimize',
    expand: 'Expand',
    send: 'Send',
    loading: 'Loading...',
    creating: 'Creating...',
    restart: 'Start new conversation',
    sendFeedback: 'Send Feedback',
    createGithubIssue: 'Create GitHub Issue',
    checkCreatedIssue: 'Check created issue',
    newFeedbackSubmission: 'Submit new feedback',
  },

  // Messages
  messages: {
    welcome: 'Hello! Please share your feature requests or feedback. What improvements would you like to see?',
    thankYou: 'Thank you for your feedback!',
    issueCreatedSuccessfully: 'GitHub issue has been created successfully.',
    pleaseShareMessage: 'Please feel free to share your message!',
    feedbackOrFeatureRequests: 'Please share your feedback or feature requests.',
    usuallyReplyWithinMinutes: 'We usually reply within a few minutes',
    temporaryError: 'Sorry, we are temporarily unavailable. Please try again.',
    messageSendFailed: 'Sorry, failed to send message. Please try again.',
    feedbackSubmissionFailed: 'Failed to submit feedback. Please try again.',
  },

  // Security and Privacy
  security: {
    privacyProtection: 'Privacy Protected',
    secureTransmission: 'Secure Transmission',
  },

  // Page Content
  page: {
    title: 'Feedback Widget Demo',
    simpleTest: 'Simple Test',
    simpleTestDescription: 'This page renders the FeedbackWidget component directly.',
    usageInstructions: 'Usage Instructions',
    technicalSpecifications: 'Technical Specifications',
    usageSteps: [
      'Click the floating feedback button',
      'Share your feedback or feature requests',
      'Our AI assistant will ask follow-up questions',
      'GitHub issue will be automatically created'
    ],
    techSpecs: [
      'Built with Next.js 14 + TypeScript',
      'AI-powered conversation using Gemini API',
      'Automatic GitHub issue creation',
      'Responsive design supporting both desktop and mobile'
    ],
  },

  // Error Messages
  errors: {
    sessionNotFound: 'Session not found or empty',
    sessionIdRequired: 'session_id is required',
    messageRequired: 'message is required',
    sessionIdAndMessageRequired: 'session_id and message are required',
    geminiApiKeyNotConfigured: 'Gemini API key not configured',
    githubApiError: 'GitHub API error',
    internalServerError: 'Internal server error',
    feedbackChatApiError: 'Feedback chat API error',
    feedbackAnalysisApiError: 'Feedback analysis API error',
    submitApiError: 'Submit API error',
    failedToCreateGithubIssue: 'Failed to create GitHub issue',
  },

  // AI Prompts
  prompts: {
    feedbackAssistant: {
      systemRole: `You are a feedback collection assistant. Users often seek "HOW (how to implement)" solutions, but your role is to deeply understand "WHY (why it's needed)" and "WHAT (what they want to solve)".

## Important Mindset:
- Don't get caught up in users' proposed solutions (HOW), but find the real underlying issues (WHY/WHAT)
- Discover more fundamental problems or inconveniences behind surface-level requests
- Once issues are clear, better solutions may be found

## Interview Strategy:
1. **Explore the essence of the problem**: "Why do you feel this is necessary?" "What kind of difficulties are you experiencing?"
2. **Understand current situation**: "How are you currently handling this?" "Where do you get stuck or spend time?"
3. **Confirm impact scope**: "Do others experience similar difficulties?" "How much does this impact your work?"
4. **Envision ideal state**: "If this problem were solved, what would the ideal state look like?"

## Conversation Examples:
❌ Bad: "I understand. I'll add that feature."
✅ Good: "I see. By the way, why do you feel this feature is necessary? What kind of work are you having trouble with currently?"

## Conversation Style:
- Act like an empathetic and curious consultant
- Show empathy with phrases like "I see" and "That sounds challenging"
- Ask questions one at a time, concisely
- Avoid technical jargon, match the user's language

## End Condition:
Add "__AUTO_CREATE_ISSUE__" when the following are understood through 2 exchanges:
1. **Root problem**: The real issue or inconvenience the user is experiencing
2. **Current difficulties**: Specifically where and why they're having trouble
3. **Current coping methods**: How they're currently dealing with the problem`,

      analysisPrompt: `Analyze the following conversation content and extract data for creating a GitHub issue based on user feedback.

## Analysis Points:
1. **Essence of the problem**: What problem does the user really want to solve?
2. **Use cases**: In what situations and by whom will this feature be used?
3. **Priority**: How urgent or important is this?
4. **Category**: Which of feature, bug, improvement, question does this fall under?

## Output Format:
Please respond in the following JSON format:

{
  "title": "Concise and clear title (within 50 characters)",
  "description": "Detailed description including problem background, current issues, and expected results",
  "labels": ["Array of appropriate labels"],
  "category": "feature|bug|improvement|question",
  "priority": "low|medium|high"
}

## Title Examples:
- Good: "Add dark mode support to reduce eye strain during night use"
- Bad: "Implement dark mode"

## Description Structure:
1. **Current Problem**: Why this feature is needed
2. **Use Cases**: In what situations will this be used
3. **Expected Benefits**: What will improve when implemented
4. **Additional Information**: Specific comments or requests from users

## Label Examples:
- "enhancement", "ui/ux", "accessibility", "performance", "security"
- "mobile", "desktop", "cross-platform"
- "high-priority", "good-first-issue", "needs-discussion"

Priority Criteria:
- high: Security, critical bugs, affects many users
- medium: Feature improvements, usability enhancements
- low: Minor improvements, future considerations

Conversation content:`,

      fallbackResponses: [
        'Thank you! Could you tell me more details?',
        'I see, that\'s an interesting perspective. What background led you to feel this way?',
        'Could you tell me more specifically about that idea?',
        'In what situations do you feel that need?',
        'What good things do you think would happen if that feature existed?'
      ],
    },
  },

  // GitHub Issue Templates
  github: {
    sections: {
      overview: '## Overview',
      category: '## Category',
      priority: '## Priority',
      rootProblem: '## 🎯 Root Problem',
      currentDifficulties: '## 📋 Current Difficulties',
      workImpactAndMethods: '## 📊 Work Impact & Current Methods',
      idealState: '## ✨ Ideal State',
      userProposedSolution: '## 💡 User Proposed Solution',
      detailedInformation: '## 📝 Detailed Information',
      conversationHistory: '## 📞 Conversation History',
      nextActions: '## 🔍 Next Actions',
    },
    
    footer: 'Please proceed with development and PR creation for the above issue.',
    
    nextActionItems: [
      'Review technical feasibility',
      'Estimate development effort',
      'Prioritize against current roadmap',
      'Consider user impact and business value'
    ],
  },
};