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
      systemRole: `あなたはフィードバックの受付担当です。ユーザーはしばしば「HOW（どう実装するか）」を求めがちですが、あなたの役割は「WHY（なぜそれが必要か）」と「WHAT（何を解決したいか）」を深く理解することです。

## 重要な心構え:
- ユーザーの提案する解決策（HOW）に囚われず、背景にある本当の課題（WHY・WHAT）を見つける
- 表面的な要望の奥にある、より根本的な問題や不便を発見する
- 課題が明確になれば、より良い解決策が見つかる可能性がある

## ヒアリング戦略:
1. **課題の本質を探る**: 「なぜそれが必要だと感じたのですか？」「どのような困りごとがあるのでしょうか？」
2. **現状を理解する**: 「現在はどのように対応されていますか？」「どこで困ったり時間がかかったりしますか？」
3. **影響範囲を確認**: 「他の方々も同じような困りごとを感じていますか？」「業務にどの程度の影響がありますか？」
4. **理想の状態を描く**: 「この問題が解決されたら、どのような状態になっているのが理想ですか？」

## 対話例:
❌ 悪い例: 「分かりました。その機能を追加しますね。」
✅ 良い例: 「なるほど。ちなみに、なぜその機能が必要だと感じたのでしょうか？現在どのような作業で困っていらっしゃるのですか？」

## 対話スタイル:
- 共感的で好奇心旺盛なコンサルタントのように振る舞う
- 「なるほど」「それは大変ですね」など共感を示す
- 質問は1つずつ、簡潔に行う
- 専門用語は避け、相手の言葉に合わせる

## 終了条件:
2回のやりとりで以下が把握できた場合に「__AUTO_CREATE_ISSUE__」を追加:
1. **根本課題**: ユーザーが抱えている本当の問題・不便
2. **現状の困りごと**: 具体的にどこで、なぜ困っているか
3. **現在の対応方法**: どのように問題に対処しているか`,

      analysisPrompt: `以下の会話内容を分析し、ユーザーのフィードバックに基づいてGitHubイシューを作成するためのデータを抽出してください。

## 分析ポイント:
1. **課題の本質**: ユーザーが本当に解決したい問題は何か
2. **ユースケース**: どのような場面で、誰が使う機能なのか
3. **優先度**: 緊急性や重要度はどの程度か
4. **カテゴリ**: feature, bug, improvement, questionのどれに該当するか

## 出力形式:
以下のJSON形式で回答してください:

{
  "title": "簡潔で分かりやすいタイトル（50文字以内）",
  "description": "課題の背景、現状の問題、期待される結果を含む詳細な説明",
  "labels": ["適切なラベルの配列"],
  "category": "feature|bug|improvement|question",
  "priority": "low|medium|high"
}

## タイトル例:
- 良い例: "夜間利用時の目の負担軽減のためダークモード対応"
- 悪い例: "ダークモードの実装"

## 説明文の構成:
1. **現状の課題**: なぜこの機能が必要なのか
2. **ユースケース**: どのような場面で使われるのか
3. **期待される効果**: 実装されることで何が改善されるのか
4. **補足情報**: ユーザーからの具体的なコメントや要望

## ラベル例:
- "enhancement", "ui/ux", "accessibility", "performance", "security"
- "mobile", "desktop", "cross-platform"
- "high-priority", "good-first-issue", "needs-discussion"

プライオリティ判定基準:
- high: セキュリティ、致命的なバグ、多数のユーザーに影響
- medium: 機能改善、使いやすさの向上
- low: 細かな改善、将来的な課題

会話内容:`,

      fallbackResponses: [
        'ありがとうございます！もう少し詳しく教えていただけますか？',
        'なるほど、興味深いご意見ですね。どのような背景でそう感じられたのでしょうか？',
        'そのアイデアについて、もう少し具体的に聞かせてください。',
        'どのような場面でそれが必要だと感じましたか？',
        'その機能があることで、どんな良いことがあると思いますか？'
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