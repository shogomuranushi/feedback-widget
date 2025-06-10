# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 基本コマンド

### 開発・ビルド
```bash
npm run dev       # 開発サーバーを開始（ポート3001）
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー開始
npm run lint      # ESLintによるコード検査
```

### Docker環境
```bash
docker compose up --build         # Dockerでアプリケーション起動
docker compose up -d              # バックグラウンドで起動
docker compose logs feedback-widget  # ログ確認
```

### CI/CD
- GitHub Actionsでmain/developブランチpush時に自動ビルド
- Dockerイメージは`ghcr.io/[owner]/[repo]`にpush
- マルチステージビルドで本番最適化済み

## アーキテクチャ概要

このプロジェクトは、AI駆動のフィードバック収集からGitHub Issue自動作成を行うNext.jsアプリケーションです。

### コア機能フロー
1. **ウィジェットSDK** (`public/widget.js`) - クライアント埋め込み型SDK
2. **AI会話管理** - Gemini APIによるインタラクティブなヒアリング  
3. **自動Issue化** - 2回目のユーザーメッセージで自動的にGitHub Issue作成
4. **Claude Code連携** - 作成されたIssueに@claudeメンション自動挿入

### 重要なアーキテクチャパターン

#### セッション管理
- インメモリセッション（`global.feedbackSessions`）
- セッションIDベースの会話履歴管理
- サーバー再起動でリセット（永続化なし）

#### AI応答サービス階層
- `AIResponseService` - Gemini API統合とレスポンス生成
- `ConversationService` - 会話フロー管理とプロンプト生成
- フォールバック機能内蔵（Gemini API障害時）

#### ウィジェット統合パターン
```javascript
// 自動初期化パターン（推奨）
<script src="http://localhost:3001/widget.js"></script>

// 手動初期化パターン
window.FeedbackWidget.init({ position: 'bottom-right' });
```

### 環境変数
必須設定：
```bash
GEMINI_API_KEY=your-gemini-api-key    # Gemini AI API
GITHUB_TOKEN=your-github-token        # GitHub API（repo権限必要）
GITHUB_REPOSITORY=owner/repo          # Issue作成先リポジトリ
GITHUB_MENTION=@claude                # Issue作成時のメンション（デフォルト）
```

### API設計
- `/api/feedback/chat` - AIとの会話
- `/api/feedback/submit` - GitHub Issue作成
- 全APIでCORS有効（`setCorsHeaders`関数）
- 入力値検証とサニタイゼーション実装

### セキュリティ実装
- セッションID形式検証（`isValidSessionId`）
- メッセージ内容検証（`validateMessageContent`）
- フィードバックデータ検証（`validateFeedbackData`）
- 入力値サニタイゼーション（`sanitizeInput`）
- APIキーはサーバーサイドのみアクセス

### デプロイメント設定
- Next.js `output: 'standalone'`でDocker最適化
- 非rootユーザー（nextjs:1001）で実行
- マルチステージビルドで最小イメージサイズ