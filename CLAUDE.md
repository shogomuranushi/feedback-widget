# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development server (runs on port 3001)
npm run dev

# Production build and start
npm run build
npm run start

# Code quality and linting
npm run lint

# Testing (Note: Test files exist but no test script configured in package.json)
# Tests are located in src/lib/__tests__/ for individual service testing

# Docker development
docker compose up --build
docker compose logs -f feedback-widget

# Environment setup
cp .env.example .env  # Create and configure environment variables
```

## Architecture Overview

This is a Next.js 14 TypeScript application that provides an AI-powered feedback widget system with the following key components:

### Core Architecture

**Client-Side Widget (`/public/widget.js`)**
- Standalone JavaScript SDK that can be embedded in any website
- Automatically detects domain and sends with API requests for authentication
- Reads configuration from HTML data attributes (`data-api-key`, `data-github-repo`, etc.)
- Provides floating button UI with chat interface

**API Layer (`/src/app/api/feedback/`)**
- `chat/route.ts`: Handles AI conversations via Gemini API
- `submit/route.ts`: Creates GitHub Issues from feedback conversations
- Domain + API Key authentication system for security

**Service Layer (`/src/lib/services/`)**
- `AIResponseService.ts`: Orchestrates AI conversations
- `GeminiService.ts`: Direct integration with Google Gemini AI
- `ConversationService.ts`: Manages conversation flow logic

**Authentication System (`/src/lib/utils/apiKeyAuth.ts`)**
- Two-tier security: Basic API key list OR Domain+API key pairing
- Environment variable configuration: `VALID_API_KEYS` or `DOMAIN_API_MAPPINGS`

### Key Workflows

1. **Widget Integration**: Single script tag with data attributes for configuration
2. **Conversation Flow**: User messages → AI analysis → Automatic GitHub Issue creation after 2nd user message
3. **Authentication**: Domain detection → API key validation → GitHub token (server-side only)

### Environment Configuration

Required variables in `.env`:
```bash
GEMINI_API_KEY=your-gemini-api-key    # Google AI API key
GITHUB_TOKEN=your-github-token        # GitHub personal access token
GITHUB_MENTION=@claude                # User/team to mention in issues

# Domain + API key pairing (required)
DOMAIN_API_MAPPINGS=example.com:widget_prod_v1,widget_prod_v2;localhost:widget_dev;app.company.com:widget_company
```

**Important:** GitHub repository is specified by clients via `data-github-repo` attribute, not server environment variables.

### Security Model

- Client-side API keys (`widget_*` prefix) for identification only
- Server-side GitHub tokens for actual repository access
- Domain-based access control via `DOMAIN_API_MAPPINGS` (required)
- GitHub repository specified by client via `data-github-repo` attribute
- All API keys validated server-side before processing requests

### Widget Authentication Flow

1. Widget automatically detects domain via `window.location.hostname`
2. Sends domain + API key + repository in request headers (`X-Origin-Domain`, `X-API-Key`, `X-GitHub-Repo`)
3. Server validates domain+key pair against `DOMAIN_API_MAPPINGS` (required)
4. Invalid combinations or missing domain mappings return 401 Unauthorized

### Testing and Debugging

The widget can be tested by:
1. Starting dev server: `npm run dev`
2. Creating test HTML file with widget script tag and proper data attributes
3. Using browser developer tools to monitor API requests and responses
4. Checking server logs for authentication and AI processing details

### Important Implementation Notes

- Widget automatically detects API endpoint from its own script src URL
- Widget automatically detects domain via `window.location.hostname`
- All API requests include `X-Origin-Domain` header for validation
- GitHub Issue creation is automatic after 2nd user message
- Conversation history is maintained in server memory (not persisted)
- CORS is configured to allow cross-origin widget embedding
- Authentication uses domain+API key pairing exclusively (no fallback)

### Debugging and Development Tips

- Use browser DevTools Network tab to monitor API requests (`X-API-Key`, `X-Origin-Domain` headers)
- Server logs show authentication validation details and Gemini API interactions
- Widget SDK is a standalone JavaScript file - no build process needed for widget changes
- Test authentication by temporarily modifying `DOMAIN_API_MAPPINGS` in `.env`
- For widget integration testing, create simple HTML files in `/public/` folder

### Session Management Architecture

The application uses a global in-memory session store (`global.feedbackSessions`) that:
- Maps session IDs to conversation message arrays
- Persists only during server runtime (resets on restart)
- Automatically generates session IDs in widget (`session` + random string)
- Validates session ID format server-side (alphanumeric + underscore/hyphen only)

### AI Integration Patterns

The Gemini AI integration follows a layered approach:
- `GeminiService`: Direct Google AI API integration with safety settings
- `AIResponseService`: Orchestrates conversation flow and handles fallbacks
- `ConversationService`: Manages conversation state and generates contextual prompts
- Error handling includes specific Gemini API error types (quota, permission, network)