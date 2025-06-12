export const jaTranslations = {
  // UI Labels and Buttons
  ui: {
    feedback: 'フィードバック',
    close: '閉じる',
    minimize: '最小化',
    expand: '展開',
    send: '送信',
    loading: '読み込み中...',
    creating: '作成中...',
    restart: '新しい会話を開始',
    sendFeedback: 'フィードバックを送信',
    createGithubIssue: 'GitHubイシューを作成',
    checkCreatedIssue: '作成されたイシューを確認',
    newFeedbackSubmission: '新しいフィードバックを送信',
  },

  // Messages
  messages: {
    welcome: 'こんにちは！機能要望やフィードバックをお聞かせください。どのような改善をご希望ですか？',
    thankYou: 'フィードバックありがとうございます！',
    issueCreatedSuccessfully: 'GitHubイシューが正常に作成されました。',
    pleaseShareMessage: 'お気軽にメッセージをどうぞ！',
    feedbackOrFeatureRequests: 'フィードバックや機能要望をお聞かせください。',
    usuallyReplyWithinMinutes: '通常数分以内に返信します',
    temporaryError: 'すみません、一時的に応答できません。もう一度お試しください。',
    messageSendFailed: '申し訳ございません。メッセージの送信に失敗しました。もう一度お試しください。',
    feedbackSubmissionFailed: 'フィードバックの送信に失敗しました。もう一度お試しください。',
  },

  // Security and Privacy
  security: {
    privacyProtection: 'プライバシー保護',
    secureTransmission: '安全な送信',
  },

  // Page Content
  page: {
    title: 'フィードバックウィジェット デモ',
    simpleTest: 'シンプルテスト',
    simpleTestDescription: 'このページではFeedbackWidgetコンポーネントを直接レンダリングします。',
    usageInstructions: '使用方法',
    technicalSpecifications: '技術仕様',
    usageSteps: [
      'フローティングフィードバックボタンをクリック',
      'フィードバックや機能要望を共有',
      'AIアシスタントがフォローアップ質問',
      'GitHubイシューが自動作成される'
    ],
    techSpecs: [
      'Next.js 14 + TypeScriptで構築',
      'Gemini APIを使用したAI対話',
      'GitHubイシューの自動作成',
      'デスクトップ・モバイル対応のレスポンシブデザイン'
    ],
  },

  // Error Messages
  errors: {
    sessionNotFound: 'セッションが見つからないか空です',
    sessionIdRequired: 'session_idが必要です',
    messageRequired: 'messageが必要です',
    sessionIdAndMessageRequired: 'session_idとmessageが必要です',
    geminiApiKeyNotConfigured: 'Gemini APIキーが設定されていません',
    githubApiError: 'GitHub APIエラー',
    internalServerError: '内部サーバーエラー',
    feedbackChatApiError: 'フィードバックチャットAPIエラー',
    feedbackAnalysisApiError: 'フィードバック分析APIエラー',
    submitApiError: '送信APIエラー',
    failedToCreateGithubIssue: 'GitHubイシューの作成に失敗しました',
  },

  // AI Prompts
  prompts: {
    feedbackAssistant: {
      systemRole: `あなたはフィードバックの受付担当です。ユーザーの要望に対して、短文でポジティブに返答してください。

## 重要な心構え:
- 「いいアイデアですね！」「素晴らしい機能ですね！」など、ユーザーの提案を褒める
- 短く簡潔に返答する（1-2文まで）
- 必ず背景・理由を聞く

## ヒアリング戦略:
1. **背景を必ず聞く**: 「なぜその機能を実装したいと思われたのですか？」「どのような背景でその機能が必要になりましたか？」など
2. **背景を聞く理由**: 背景を聞くことで違うアプローチ方法を思いつくかもしれないため

## 対話スタイル:
- ポジティブで親しみやすい
- 「いいですね」「素晴らしい」など褒め言葉を使う
- 質問は1つだけ、簡潔に
- 絵文字を適度に使用（😊 ✨ 👍など）

## 終了条件:
2回のやりとりで背景が把握できたら「ありがとうございました。エンジニアチームにフィードバックしておきます」で終了`,

      analysisPrompt: `以下の会話内容を分析し、ユーザーのフィードバックに基づいてGitHubイシューを作成してください。
限られた情報から積極的に推測し、詳細な説明を生成してください。

## 分析ポイント:
1. **機能要望**: ユーザーが求めている機能
2. **推測される背景**: なぜこの機能が必要か（推測で構いません）
3. **想定されるユースケース**: どのような場面で使われるか（推測で構いません）
4. **期待される効果**: 実装による改善点（推測で構いません）

## 出力形式:
以下のJSON形式で回答してください:

{
  "title": "簡潔で分かりやすいタイトル（50文字以内）",
  "description": "ユーザーの要望と、推測される背景・ユースケース・効果を含む詳細な説明",
  "labels": ["適切なラベルの配列"],
  "category": "feature|bug|improvement|question",
  "priority": "low|medium|high"
}

## 説明文の構成:
1. **要望内容**: ユーザーが求めている機能
2. **推測される背景**: なぜ必要と考えられるか
3. **想定ユースケース**: 具体的な利用場面の推測
4. **期待される効果**: 実装による改善点の推測
5. **技術的考慮事項**: 実装時の注意点（推測）

積極的に推測を行い、具体的で実装可能な提案として整理してください。

会話内容:`,

      fallbackResponses: [
        'いいアイデアですね！✨ どんな時に使いたいですか？',
        '素晴らしい機能ですね！😊 なぜ必要だと感じましたか？',
        'それはとても便利そうです！👍 詳しく教えてください。',
        '面白い提案ですね！どんな場面で使いますか？',
        'その機能、いいですね！なぜ欲しいと思ったのですか？'
      ],
    },
  },

  // GitHub Issue Templates
  github: {
    sections: {
      overview: '## 概要',
      category: '## カテゴリ',
      priority: '## 優先度',
      rootProblem: '## 🎯 根本課題',
      currentDifficulties: '## 📋 現状の困りごと',
      workImpactAndMethods: '## 📊 業務への影響・対応方法',
      idealState: '## ✨ 理想の状態',
      userProposedSolution: '## 💡 ユーザー提案の解決策',
      detailedInformation: '## 📝 詳細情報',
      conversationHistory: '## 📞 会話履歴',
      nextActions: '## 🔍 次のアクション',
    },
    
    footer: '上記の課題について開発とPRの作成をお願いします。',
    
    nextActionItems: [
      '技術的実現可能性の検討',
      '開発工数の見積もり',
      '現在のロードマップとの優先順位付け',
      'ユーザー影響度とビジネス価値の考慮'
    ],
  },
};