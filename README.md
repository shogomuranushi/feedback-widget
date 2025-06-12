# AI-Powered Feedback Widget

An intelligent feedback collection system that transforms user conversations into GitHub Issues and enables fully automated development workflows through AI coding agents.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

</div>

## ✨ Features

- 🤖 **AI-Driven Conversations** - Natural language feedback collection powered by Gemini AI with image analysis support
- 📋 **Auto-Issue Creation** - Automatically generates GitHub Issues after the second user message
- 🎨 **Embeddable SDK** - Easy integration into any website with a single script tag
- 🔧 **AI Coding Agent Integration** - Issues are automatically tagged with @claude mentions for seamless handoff to AI coding agents like Claude Code
- ⚡ **Zero-to-Code Pipeline** - From user feedback to automated development in seconds
- 🔗 **Auto-Detect API Endpoint** - Widget automatically detects API endpoint from script source
- 👤 **Smart User Identification** - Automatic user name collection with localStorage persistence
- 📷 **Image Upload Support** - Drag & drop image attachments with AI-powered image analysis
- 💾 **Persistent User Settings** - User preferences saved across sessions

> **🚀 Complete Automation**: Once a GitHub Issue is created, AI coding agents like [Claude Code](https://claude.ai/code) can automatically analyze the requirements, implement features, write tests, and submit pull requests - creating a fully automated development pipeline from user feedback to deployed code.

---

## 📱 For End Users

### How to Submit Feedback

#### 1. Click the Feedback Button
Click the blue feedback button in the bottom-right corner of the screen to open the feedback interface.

#### 2. Set Your User Name (First Time Only)
- On your first visit, you'll be prompted to enter your name
- This name will be associated with your feedback in GitHub Issues
- Your name is saved locally and you won't need to enter it again
- You can edit your name anytime by clicking the edit button next to your name

#### 3. Chat with AI
- The AI assistant will engage in natural conversation to understand your needs
- Simply describe what you want: "I need an export feature" or "The save button isn't working"
- **Upload Images**: Drag & drop or click the image button to attach screenshots or mockups
- The AI can analyze images and provide more relevant responses

#### 4. Automatic Issue Creation
- After your second message, a GitHub Issue is automatically created
- AI coding agents immediately begin analyzing and implementing your request
- Your name and any attached images are included in the GitHub Issue
- For automatic coding implementation, refer to methods like Claude Code Actions

### Example Conversations

**💡 Feature Request**
```
User: "I need a data export feature"
AI: "What format would you like for the export?"
User: "Excel and PDF would be perfect"
→ GitHub Issue created automatically
→ Claude Code begins implementing the feature
```

**🐛 Bug Report**
```
User: "The save button isn't responding"
AI: "What happens when you click it?"
User: "Nothing happens after uploading large files"
→ Bug report Issue created automatically
→ AI agents start debugging and fixing
```

---

## 🛠️ Developer Setup

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- GitHub Personal Access Token (with repo permissions) OR GitHub App credentials
- Google Gemini API Key

### 1. Clone Repository

```bash
git clone <repository-url>
cd feedback-widget
```

### 2. Environment Configuration

```bash
# Create .env file
cat > .env << 'EOF'
# Gemini AI API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-pro-preview-06-05

# GitHub Authentication
# Choose AUTH_TYPE: 'pat' or 'github-app'
GITHUB_AUTH_TYPE=pat

# For Personal Access Token (PAT)
GITHUB_TOKEN=your-github-token

# For GitHub App
GITHUB_APP_ID=your-app-id
GITHUB_APP_INSTALLATION_ID=your-installation-id
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
# Alternative: Set the private key content directly (for Cloud Run)
# GITHUB_APP_PRIVATE_KEY=base64-encoded-private-key

# Common settings
GITHUB_MENTION=@claude

# Domain-API Key Mapping (Required)
DOMAIN_API_MAPPINGS=example.com:widget_prod_key1,widget_prod_key2;localhost:widget_dev_key;app.company.com:widget_company_prod

# Optional: Show GitHub Issue creation notification in widget (default: false)
GITHUB_NOTIFY=true
EOF
```

#### Domain-API Key Authentication Setup

Configure domain-specific API key mappings:

```bash
# Domain-specific API key mappings
DOMAIN_API_MAPPINGS=example.com:widget_prod_v1,widget_prod_v2;localhost:widget_dev_local;app.company.com:widget_company_main

# Real-world examples
DOMAIN_API_MAPPINGS=staging.myapp.com:widget_staging;production.myapp.com:widget_prod_main,widget_prod_backup;localhost:widget_dev,widget_test

# Multiple domains and keys
DOMAIN_API_MAPPINGS=app1.com:widget_app1_key;app2.com:widget_app2_key1,widget_app2_key2;internal.company.com:widget_internal
```

**Domain Mapping Format:**
- `domain:key1,key2;domain2:key3`
- Semicolon (`;`) separates domains
- Colon (`:`) separates domain from keys
- Comma (`,`) separates multiple keys for same domain

**Debug Mode (Allow All Domains):**
```bash
# WARNING: Use only for development/debugging
DOMAIN_API_MAPPINGS=all:widget_debug_key
```

**Important Notes:**
- All API keys must start with `widget_` prefix
- Keys are case-sensitive
- No spaces around separators
- `DOMAIN_API_MAPPINGS` is required - no fallback authentication
- Domain detection is automatic via widget
- Each domain must have at least one authorized API key
- `all` keyword allows any domain (debug use only)

#### GitHub Authentication Setup

You can choose between two authentication methods:

##### Option 1: Personal Access Token (PAT) - Simple Setup

1. Create a new token at [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
2. Grant `repo` permissions
3. Set the generated token as `GITHUB_TOKEN`
4. Set `GITHUB_AUTH_TYPE=pat` in your .env file

##### Option 2: GitHub App - Enterprise Recommended

1. Create a GitHub App at [GitHub Settings > Developer settings > GitHub Apps](https://github.com/settings/apps/new)
2. Configure the app:
   - **GitHub App name**: Your app name (e.g., `Feedback Widget Bot`)
   - **Homepage URL**: Your application URL
   - **Webhook**: Disable (uncheck Active)
   - **Permissions**: Repository > Issues > Read & write
   - **Where can this GitHub App be installed?**: Choose based on your needs
3. After creation:
   - Note the **App ID**
   - Generate a **Private Key** (will download a .pem file)
   - Install the app on your repository/organization
   - Note the **Installation ID** from the URL after installation
4. Configure in .env:
   ```bash
   GITHUB_AUTH_TYPE=github-app
   GITHUB_APP_ID=your-app-id
   GITHUB_APP_INSTALLATION_ID=your-installation-id
   GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
   ```

##### For Cloud Run Deployment (GitHub App)

When deploying to Cloud Run, you can use base64-encoded private key:

```bash
# Encode your private key
base64 -w 0 < /path/to/private-key.pem

# Set in .env or Cloud Run environment
GITHUB_APP_PRIVATE_KEY=base64-encoded-string
```

#### Gemini API Key Setup

1. Create an API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set the generated key as `GEMINI_API_KEY`

### 3. Application Startup

#### Using Docker (Recommended)

```bash
# Start development environment
docker compose up --build

# Start in background
docker compose up -d

# View logs
docker compose logs -f feedback-widget
```

#### Local Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 3001)
npm run dev

# Production build
npm run build
npm run start

# Code quality check
npm run lint
```

### 4. Widget Integration

#### HTML Websites

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
</head>
<body>
  <!-- Your site content -->
  
  <!-- Basic Feedback Widget -->
  <!-- API endpoint is automatically detected from widget.js location -->
  <script src="http://localhost:3001/widget.js"></script>
  
  <!-- Advanced: With API Key and Repository Specification -->
  <script src="http://localhost:3001/widget.js"
          data-api-key="widget_abc123"
          data-github-repo="company/frontend-app"
          data-position="bottom-right">
  </script>
  
  <!-- With Pre-configured User Information -->
  <script src="http://localhost:3001/widget.js"
          data-api-key="widget_abc123"
          data-github-repo="company/frontend-app"
          data-user-id="user123"
          data-user-email="user@example.com"
          data-user-name="John Doe"
          data-position="bottom-right">
  </script>
</body>
</html>
```

#### React/Next.js Applications

```jsx
// components/FeedbackWidget.jsx
import { useEffect } from 'react';

export default function FeedbackWidget({ user }) {
  useEffect(() => {
    const script = document.createElement('script');
    // API endpoint will be automatically detected from script src
    script.src = process.env.NODE_ENV === 'production' 
      ? 'https://your-widget-server.com/widget.js'
      : 'http://localhost:3001/widget.js';
    script.async = true;
    
    // Set data attributes for configuration
    script.dataset.apiKey = process.env.NEXT_PUBLIC_WIDGET_API_KEY || 'widget_dev';
    script.dataset.githubRepo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'your-org/your-app';
    
    // Optional: Pre-configure user information from your auth system
    if (user?.id) script.dataset.userId = user.id;
    if (user?.email) script.dataset.userEmail = user.email;
    if (user?.name) script.dataset.userName = user.name;
    
    document.body.appendChild(script);

    return () => {
      window.FeedbackWidget?.destroy();
      document.body.removeChild(script);
    };
  }, [user]);

  return null;
}

// _app.js or layout.tsx
import FeedbackWidget from '../components/FeedbackWidget';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <FeedbackWidget />
    </>
  );
}
```

### 5. Widget Configuration

#### Basic Integration Examples

**Production Environment:**
```html
<!-- Production site with domain-specific API key -->
<!-- API endpoint is automatically detected from script src -->
<script src="https://your-widget-server.com/widget.js"
        data-api-key="widget_prod_main"
        data-github-repo="your-org/frontend-app"
        data-position="bottom-right">
</script>
```

**Development Environment:**
```html
<!-- Development with localhost -->
<!-- API endpoint is automatically detected as http://localhost:3001 -->
<script src="http://localhost:3001/widget.js"
        data-api-key="widget_dev_local"
        data-github-repo="your-org/frontend-app"
        data-position="bottom-left">
</script>
```

#### Advanced Configuration Options

```javascript
// Custom configuration (if needed)
FeedbackWidget.init({
  position: 'bottom-right',  // 'bottom-left' | 'bottom-right'
  theme: 'auto',            // 'light' | 'dark' | 'auto'
  offset: {
    bottom: 24,
    right: 24
  }
});
```

#### User Information Configuration

The widget supports automatic user identification with multiple fallback options:

##### Priority Order:
1. **Data Attributes** (highest priority) - Set via HTML data attributes
2. **localStorage** - Automatically saved from user input
3. **Manual Input** (fallback) - Prompted when no user info is available

##### Configuration Examples:

**Pre-configured User (from Authentication System):**
```html
<!-- User information from your login system -->
<script src="http://localhost:3001/widget.js"
        data-api-key="widget_abc123"
        data-github-repo="company/frontend-app"
        data-user-id="user_12345"
        data-user-email="john.doe@company.com"
        data-user-name="John Doe">
</script>
```

**Dynamic User Information (React/Vue/etc.):**
```javascript
// Get user info from your auth system
const user = getCurrentUser();

// Set up widget with user data
const script = document.createElement('script');
script.src = 'http://localhost:3001/widget.js';
script.dataset.apiKey = 'widget_dev';
script.dataset.githubRepo = 'company/frontend-app';

// Configure user information
if (user?.id) script.dataset.userId = user.id;
if (user?.email) script.dataset.userEmail = user.email;
if (user?.name) script.dataset.userName = user.name;

document.body.appendChild(script);
```

**Anonymous Users:**
```html
<!-- For sites without authentication -->
<!-- Widget will prompt for user name on first use -->
<!-- User name will be saved in localStorage for future sessions -->
<script src="http://localhost:3001/widget.js"
        data-api-key="widget_abc123"
        data-github-repo="company/frontend-app">
</script>
```

##### User Data Attributes:

| Attribute | Description | Required | Example |
|-----------|-------------|----------|---------|
| `data-user-id` | Unique user identifier | No | `user_12345`, `auth0\|123456` |
| `data-user-email` | User's email address | No | `user@example.com` |
| `data-user-name` | User's display name | No | `John Doe`, `田中太郎` |

##### localStorage Behavior:
- User name is automatically saved when entered manually
- Persists across browser sessions
- Can be edited anytime via the widget interface
- Key: `feedback-widget-username`

##### GitHub Issue Integration:
When user information is available, it's included in GitHub Issues:

```markdown
## ユーザー情報

**User ID**: user_12345
**Email**: john.doe@company.com
**Name**: John Doe

## 概要
...rest of the issue...
```

#### API Key and Repository Configuration

For multi-tenant deployments or dynamic repository targeting, use data attributes:

```html
<!-- Specify API Key for client identification -->
<script src="http://localhost:3001/widget.js"
        data-api-key="widget_your_unique_key"
        data-github-repo="owner/repository-name">
</script>

<!-- Multiple widgets for different repositories -->
<script src="http://localhost:3001/widget.js"
        data-api-key="widget_frontend_team"
        data-github-repo="company/frontend-app"
        data-position="bottom-right">
</script>

<script src="http://localhost:3001/widget.js"
        data-api-key="widget_backend_team"
        data-github-repo="company/backend-api"
        data-position="bottom-left">
</script>
```

**API Key Format Requirements:**
- Must start with `widget_` prefix
- Must be mapped to domain in server's `DOMAIN_API_MAPPINGS` environment variable
- Example: `widget_abc123`, `widget_team_frontend`, `widget_prod_v1`

**Repository Format:**
- Must be in `owner/repository` format (specified in data-github-repo)
- Example: `company/frontend-app`, `myorg/mobile-app`

**Server-side Configuration:**
- GitHub tokens remain securely server-side in environment variables
- GitHub repository specified by client via data-github-repo attribute
- API keys validated against domain-specific mappings
- No permissions management needed (assumes full repository access)

**Security:**
- All API requests require valid domain + API key authentication
- Domain-API key pairs must be pre-configured in server environment variables
- Invalid keys or unauthorized domains return 401 Unauthorized error
- Widget automatically sends current domain with each request

#### Widget Position Adjustment

```javascript
// Bottom-right corner (default)
FeedbackWidget.init({
  position: 'bottom-right',
  offset: { bottom: 24, right: 24 }
});

// Bottom-left corner
FeedbackWidget.init({
  position: 'bottom-left',
  offset: { bottom: 24, left: 24 }
});

// Custom positioning with precise pixel control
FeedbackWidget.init({
  position: 'bottom-right',
  offset: { 
    bottom: 50,  // 50px from bottom
    right: 30    // 30px from right edge
  }
});

// HTML data attribute configuration
<script src="http://localhost:3001/widget.js"
        data-position="bottom-left"
        data-bottom="100"
        data-left="20">
</script>
```

#### Language Configuration

The widget supports multiple languages. Configure the language by setting environment variables:

```bash
# Server-side language configuration (.env)
# Supported: 'en' (English), 'ja' (Japanese)
DEFAULT_LANGUAGE=en

# Or set dynamically via API
FEEDBACK_LANGUAGE=ja
```

**Language Switching Example:**

```javascript
// For multi-language sites, the widget automatically detects browser language
// Manual language override (if needed in future versions):
FeedbackWidget.init({
  position: 'bottom-right',
  language: 'en'  // 'en' | 'ja'
});
```

#### AI Model Configuration

Configure the AI model used for conversations:

```bash
# Environment Variables (.env)

# Gemini Model Selection
GEMINI_MODEL=gemini-2.5-pro-preview-06-05        # Latest model (default)
# GEMINI_MODEL=gemini-1.5-pro                    # Alternative stable model
# GEMINI_MODEL=gemini-1.5-flash                  # Faster, lightweight model

# Model Parameters (optional - uses sensible defaults)
GEMINI_TEMPERATURE=0.7          # Creativity level (0.0-1.0)
GEMINI_MAX_TOKENS=1024          # Response length limit
GEMINI_TOP_P=0.95              # Nucleus sampling parameter
```

**Available Model Options:**

| Model | Description | Use Case |
|-------|-------------|----------|
| `gemini-2.5-pro-preview-06-05` | Latest advanced model | Best quality responses (default) |
| `gemini-1.5-pro` | Stable production model | Balanced performance and reliability |
| `gemini-1.5-flash` | Fast lightweight model | Quick responses, lower costs |

**Model Switching Example:**

```bash
# Switch to faster model for high-traffic sites
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.5
GEMINI_MAX_TOKENS=512

# Restart application to apply changes
docker compose restart feedback-widget
```

#### API Methods

```javascript
// Initialize with configuration
FeedbackWidget.init(config);

// Manual control
FeedbackWidget.show();
FeedbackWidget.hide();

// Update configuration dynamically
FeedbackWidget.updateConfig({
  position: 'bottom-left',
  offset: { bottom: 100, left: 20 }
});

// Complete removal
FeedbackWidget.destroy();
```

## 🚀 Deployment

### GitHub Container Registry

```bash
# Manual build and push
docker build -t ghcr.io/yourusername/feedback-widget .
docker push ghcr.io/yourusername/feedback-widget
```

Automated deployment with GitHub Actions:
- Auto-build on main/develop branch pushes
- Release images created on tag creation

### Production Environment Variables

```bash
# Production .env
NODE_ENV=production
GEMINI_API_KEY=prod-gemini-key
GITHUB_TOKEN=prod-github-token
GITHUB_REPOSITORY=your-org/your-repo
GITHUB_MENTION=@your-team
```

## 🔧 Development & Debugging

### Log Monitoring

```bash
# Docker logs
docker compose logs -f feedback-widget

# API logs
# Check browser developer tools Network tab
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget not displaying | Check browser console errors, verify widget.js loading |
| No AI responses | Verify GEMINI_API_KEY validity, check API limits |
| Issues not created | Check GitHub Token permissions, verify GITHUB_REPOSITORY setting |
| CORS errors | Review next.config.js CORS configuration |
| Wrong language displayed | Set DEFAULT_LANGUAGE in .env, restart application |
| Widget position incorrect | Adjust `offset` values in FeedbackWidget.init() |
| AI responses too slow | Switch to `gemini-1.5-flash` model in .env |
| AI responses too short | Increase GEMINI_MAX_TOKENS in .env |
| User name not saving | Check browser localStorage support, verify no incognito mode |
| User name prompt appearing repeatedly | Clear localStorage: `localStorage.removeItem('feedback-widget-username')` |
| User info not in GitHub Issues | Verify data attributes are set correctly, check server logs |

### Development Workflow

```bash
# Start development
npm run dev

# Code quality check
npm run lint

# Test production build
npm run build

# Test Docker environment
docker compose up --build
```

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes | `AIza...` |
| `GEMINI_MODEL` | Gemini model to use | No | `gemini-2.0-flash` |
| `GITHUB_AUTH_TYPE` | Authentication type | No | `pat` or `github-app` (default: `pat`) |
| **For PAT Authentication:** | | | |
| `GITHUB_TOKEN` | GitHub personal access token | Yes (if using PAT) | `ghp_...` |
| **For GitHub App Authentication:** | | | |
| `GITHUB_APP_ID` | GitHub App ID | Yes (if using App) | `123456` |
| `GITHUB_APP_INSTALLATION_ID` | Installation ID | Yes (if using App) | `789012` |
| `GITHUB_APP_PRIVATE_KEY_PATH` | Path to private key file | One required | `/path/to/key.pem` |
| `GITHUB_APP_PRIVATE_KEY` | Base64 encoded private key | (if using App) | `LS0tLS1CRU...` |
| **Common Settings:** | | | |
| `GITHUB_MENTION` | User/team to mention in issues | No | `@claude` |
| `GITHUB_NOTIFY` | Show Issue creation notification in widget | No | `true` |
| `DOMAIN_API_MAPPINGS` | Domain-API key mappings (required) | Yes | `example.com:widget_key1;localhost:widget_dev` |

**Note:** GitHub repository is specified by clients via `data-github-repo` attribute, not server environment variables.

## 📋 API Specification

### Endpoints

| Path | Method | Description |
|------|--------|-------------|
| `/api/feedback/chat` | POST | AI conversation |
| `/api/feedback/submit` | POST | GitHub Issue creation |

### Request Examples

```bash
# AI conversation (basic)
curl -X POST http://localhost:3001/api/feedback/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session123", "message": "I have a feature request"}'

# AI conversation (with API key and repository)
curl -X POST http://localhost:3001/api/feedback/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: widget_abc123" \
  -H "X-GitHub-Repo: company/frontend-app" \
  -d '{"session_id": "session123", "message": "I have a feature request"}'

# Issue creation (basic)
curl -X POST http://localhost:3001/api/feedback/submit \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session123",
    "title": "New feature request",
    "description": "Detailed description",
    "labels": ["enhancement", "feedback"]
  }'

# Issue creation (with API key and repository)
curl -X POST http://localhost:3001/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: widget_team_frontend" \
  -H "X-GitHub-Repo: company/frontend-app" \
  -d '{
    "session_id": "session123",
    "title": "New feature request",
    "description": "Detailed description",
    "labels": ["enhancement", "feedback"]
  }'
```

### Headers

| Header | Description | Required | Format |
|--------|-------------|----------|--------|
| `Content-Type` | Request content type | Yes | `application/json` |
| `X-API-Key` | Client identification key | Yes | `widget_*` (must start with `widget_`) |
| `X-GitHub-Repo` | Target GitHub repository | Optional | `owner/repository` |
| `X-Origin-Domain` | Widget's current domain | Auto | Hostname (e.g., `example.com`, `localhost`) |
| `X-User-ID` | User identifier | Optional | `user_12345` |
| `X-User-Email` | User email address | Optional | `user@example.com` |
| `X-User-Name` | User display name | Optional | `John Doe` |

**Note:** `X-Origin-Domain` is automatically sent by the widget.js and used for domain-API key pairing validation when `DOMAIN_API_MAPPINGS` is configured.

## 🔒 Security

- **Domain-API Key Authentication**: All requests require valid domain + API key pairs
- **Server-side Validation**: Keys validated against `DOMAIN_API_MAPPINGS` only
- **Automatic Domain Detection**: Widget automatically sends current domain for validation
- **Client-specified Repositories**: GitHub repository specified by client via data attributes
- **GitHub Token Security**: GitHub tokens remain secure in server environment variables
- **No Permissions Management**: Assumes full repository access (simplified deployment)
- **Input Validation**: All user inputs validated and sanitized
- **Session ID Validation**: Alphanumeric format validation for session IDs
- **CORS Configuration**: Configurable cross-origin request handling
- **401 Unauthorized**: Invalid keys, unauthorized domains, or missing authentication return proper error responses

## 📄 License

MIT License