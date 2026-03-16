# AI Media Content Generator

AI-powered social media content generator that creates platform-optimized content for **all major social media platforms** in one click.

## Supported Platforms

| Platform | Content Types |
|----------|--------------|
| **Twitter/X** | Tweets, Threads, Polls, Replies |
| **Instagram** | Captions, Reels Scripts, Carousels, Stories |
| **LinkedIn** | Posts, Articles, Thought Leadership |
| **Facebook** | Posts, Events, Stories, Group Posts |
| **TikTok** | Video Scripts, Captions, Hooks, Trend Content |
| **YouTube** | Titles, Descriptions, Script Outlines, Shorts |
| **Pinterest** | Pin Descriptions, Board Descriptions, Idea Pins |
| **Threads** | Posts, Threads, Replies |

## Features

- Generate content for a single platform or **all platforms at once**
- Platform-specific formatting, character limits, and best practices
- Customizable tone (professional, casual, witty, inspirational, etc.)
- Topic suggestions and keyword tagging
- Hashtag generation per platform
- Copy-to-clipboard and download support
- Content history tracking
- Rate limiting and API architecture ready for AI provider integration

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start development (backend + frontend)
npm run dev
```

The backend runs on `http://localhost:3001` and the React frontend on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/platforms` | List all platforms and topics |
| GET | `/api/platforms/:id` | Get single platform info |
| POST | `/api/generate` | Generate content for one platform |
| POST | `/api/generate-all` | Generate content for all platforms |
| GET | `/api/history` | View generation history |
| DELETE | `/api/history` | Clear history |

## Project Structure

```
├── server/
│   ├── index.js              # Express server entry
│   ├── config/platforms.js    # Platform definitions
│   ├── routes/api.js          # API routes
│   └── services/contentGenerator.js  # AI content engine
├── client/
│   ├── public/index.html      # HTML template
│   └── src/
│       ├── App.js             # Main React app
│       ├── components/        # UI components
│       ├── hooks/             # Custom React hooks
│       └── styles/            # CSS styles
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

The built-in generator works out of the box. To use an external AI provider, set `AI_PROVIDER` and the corresponding API key.
