# AI-Powered Feedback Widget

An intelligent feedback collection system that transforms user conversations into GitHub Issues and enables fully automated development workflows through AI coding agents.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

</div>

## ✨ Features

- 🤖 **AI-Driven Conversations** - Natural language feedback collection powered by Gemini AI
- 📋 **Auto-Issue Creation** - Automatically generates GitHub Issues after the second user message
- 🎨 **Embeddable SDK** - Easy integration into any website with a single script tag
- 🔧 **AI Coding Agent Integration** - Issues are automatically tagged with @claude mentions for seamless handoff to AI coding agents like Claude Code
- ⚡ **Zero-to-Code Pipeline** - From user feedback to automated development in seconds

> **🚀 Complete Automation**: Once a GitHub Issue is created, AI coding agents like [Claude Code](https://claude.ai/code) can automatically analyze the requirements, implement features, write tests, and submit pull requests - creating a fully automated development pipeline from user feedback to deployed code.

---

## 📱 For End Users

### How to Submit Feedback

#### 1. Click the Feedback Button
Click the blue feedback button in the bottom-right corner of the screen to open the feedback interface.

#### 2. Chat with AI
- The AI assistant will engage in natural conversation to understand your needs
- Simply describe what you want: "I need an export feature" or "The save button isn't working"

#### 3. Automatic Issue Creation
- After your second message, a GitHub Issue is automatically created
- AI coding agents immediately begin analyzing and implementing your request

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
- GitHub Personal Access Token (with repo permissions)
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

# GitHub Configuration
GITHUB_TOKEN=your-github-token
GITHUB_REPOSITORY=owner/repo
GITHUB_MENTION=@claude
EOF
```

#### GitHub Token Setup

1. Create a new token at [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
2. Grant `repo` permissions
3. Set the generated token as `GITHUB_TOKEN`

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

# Start development server
npm run dev

# Production build
npm run build
npm run start
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
  
  <!-- Feedback Widget -->
  <script src="http://localhost:3001/widget.js"></script>
</body>
</html>
```

#### React/Next.js Applications

```jsx
// components/FeedbackWidget.jsx
import { useEffect } from 'react';

export default function FeedbackWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com/widget.js'
      : 'http://localhost:3001/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.FeedbackWidget?.destroy();
      document.body.removeChild(script);
    };
  }, []);

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

### 5. API Configuration

#### Configuration Options

```javascript
// Custom configuration
FeedbackWidget.init({
  position: 'bottom-right',  // 'bottom-left' | 'bottom-right'
  theme: 'auto',            // 'light' | 'dark' | 'auto'
  offset: {
    bottom: 24,
    right: 24
  }
});
```

#### API Methods

```javascript
// Initialize
FeedbackWidget.init(config);

// Manual show/hide
FeedbackWidget.show();
FeedbackWidget.hide();

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

## 📋 API Specification

### Endpoints

| Path | Method | Description |
|------|--------|-------------|
| `/api/feedback/chat` | POST | AI conversation |
| `/api/feedback/submit` | POST | GitHub Issue creation |

### Request Examples

```bash
# AI conversation
curl -X POST http://localhost:3001/api/feedback/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session123", "message": "I have a feature request"}'

# Issue creation
curl -X POST http://localhost:3001/api/feedback/submit \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session123",
    "title": "New feature request",
    "description": "Detailed description",
    "labels": ["enhancement", "feedback"]
  }'
```

## 🔒 Security

- API keys managed server-side only
- Input validation and sanitization implemented
- Session ID format validation
- CORS configuration for origin restrictions

## 📄 License

MIT License