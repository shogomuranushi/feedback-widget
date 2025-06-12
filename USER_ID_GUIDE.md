# ユーザーID取得機能ガイド

ウィジェット設置先のユーザーID相当を取得する機能が実装されています。

## 実装方法

### 1. 基本的な設定（scriptタグのdata属性）

```html
<script 
  src="http://localhost:3001/widget.js"
  data-api-key="widget_dev"
  data-github-repo="owner/repo"
  data-user-id="user123"
  data-user-email="user@example.com"
  data-user-name="John Doe"
></script>
```

### 2. JavaScript動的設定

```javascript
// ユーザー情報を動的に設定
window.addEventListener('DOMContentLoaded', function() {
  const script = document.querySelector('script[src*="widget.js"]');
  if (script) {
    // ログイン状態から取得
    script.dataset.userId = getCurrentUserId();
    script.dataset.userEmail = getCurrentUserEmail();
    script.dataset.userName = getCurrentUserName();
  }
});
```

### 3. アプリケーション統合例

#### React アプリケーション
```jsx
function FeedbackWidgetComponent() {
  const { user } = useAuth(); // 認証フックから取得
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:3001/widget.js';
    script.dataset.apiKey = 'widget_dev';
    script.dataset.githubRepo = 'owner/repo';
    script.dataset.userId = user?.id;
    script.dataset.userEmail = user?.email;
    script.dataset.userName = user?.name;
    
    document.body.appendChild(script);
    
    return () => script.remove();
  }, [user]);
  
  return null;
}
```

#### Vue.js アプリケーション
```vue
<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'http://localhost:3001/widget.js';
    script.dataset.apiKey = 'widget_dev';
    script.dataset.githubRepo = 'owner/repo';
    script.dataset.userId = this.$store.state.user.id;
    script.dataset.userEmail = this.$store.state.user.email;
    script.dataset.userName = this.$store.state.user.name;
    
    document.body.appendChild(script);
  }
}
</script>
```

## 取得できる情報

| 属性 | ヘッダー名 | 説明 |
|------|-----------|------|
| `data-user-id` | `X-User-ID` | ユーザーの一意識別子 |
| `data-user-email` | `X-User-Email` | ユーザーのメールアドレス |
| `data-user-name` | `X-User-Name` | ユーザーの表示名 |

## GitHub Issueでの表示

ユーザー情報が設定されている場合、GitHub Issueに以下のセクションが追加されます：

```markdown
## ユーザー情報

**User ID**: user123
**Email**: user@example.com
**Name**: John Doe
```

## セキュリティ考慮事項

### 1. 機密情報の扱い
- ユーザーIDは内部識別子を推奨（メールアドレスより安全）
- 必要最小限の情報のみ設定する

### 2. プライバシー対応
```javascript
// 匿名化されたIDを使用
const anonymizedId = hashUserId(user.id);
script.dataset.userId = anonymizedId;
```

### 3. GDPR対応
```javascript
// ユーザー同意後のみ設定
if (userConsent.feedbackTracking) {
  script.dataset.userEmail = user.email;
}
```

## 実装の難易度

| 取得方法 | 難易度 | 説明 |
|---------|--------|------|
| 静的HTML設定 | ★☆☆ | data属性で直接指定 |
| JavaScript動的設定 | ★★☆ | DOMContentLoadedで設定 |
| 認証システム連携 | ★★★ | ログイン状態から取得 |
| SSR統合 | ★★★ | サーバーサイドでレンダリング |

## トラブルシューティング

### ユーザー情報が取得できない場合

1. **data属性の確認**
```javascript
const script = document.querySelector('script[src*="widget.js"]');
console.log('User ID:', script?.dataset.userId);
console.log('User Email:', script?.dataset.userEmail);
console.log('User Name:', script?.dataset.userName);
```

2. **ヘッダーの確認**
開発者ツールのNetworkタブでAPIリクエストのヘッダーを確認：
- `X-User-ID`
- `X-User-Email`
- `X-User-Name`

3. **タイミングの問題**
```javascript
// ユーザー情報の読み込み完了後に設定
async function setupWidget() {
  const user = await fetchUserInfo();
  const script = document.querySelector('script[src*="widget.js"]');
  script.dataset.userId = user.id;
  // ... 他の設定
}
```

この機能により、フィードバックの送信者を特定できるようになります。