# MindfulChat - Mental Health Chatbot

A supportive AI-powered mental wellness chatbot built with Next.js, featuring multiple support modes, user authentication, chat history, and text-to-speech capabilities.

## Features

- **Multiple Support Modes**: 6 specialized modes for different mental health needs
  - General Support - Talk about anything on your mind
  - Anxiety Relief - Calm racing thoughts with grounding techniques
  - Stress Management - Handle life pressures with practical tips
  - Sleep Support - Improve rest and relaxation
  - Mindfulness - Practice present-moment awareness
  - Mood Support - Gentle support for low moods
  
- **AI-Powered Conversations**: Uses Perplexity Sonar API with mode-specific prompts
- **Beautiful Dashboard**: Modern UI for selecting support modes
- **User Authentication**: Secure login/signup with bcrypt password hashing
- **Text-to-Speech**: Listen to responses using browser's Web Speech API
- **Chat History**: Persistent conversation history per user
- **Clean Responses**: Automatically removes reference numbers and URLs from AI output

## Demo Credentials

You can use these accounts to test the application:

| Email | Password | Name |
|-------|----------|------|
| demo@example.com | demo123 | Demo User |
| test@example.com | test123 | Test User |

## Support Modes

Each mode has a specialized AI prompt optimized for that type of support:

| Mode | Description | Focus |
|------|-------------|-------|
| General Support | Open-ended conversations | Empathy, validation, general wellness |
| Anxiety Relief | Calming anxious thoughts | Grounding techniques, breathing exercises |
| Stress Management | Handling pressure | Time management, boundaries, self-care |
| Sleep Support | Better rest | Sleep hygiene, relaxation, bedtime routines |
| Mindfulness | Present awareness | Meditation, gratitude, acceptance |
| Mood Support | Low mood support | Validation, small steps, gentle encouragement |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI API**: Perplexity Sonar
- **Authentication**: JWT with jose library
- **Password Hashing**: bcryptjs
- **Database**: JSON file-based storage

## Environment Variables

Create a `.env.local` file with:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key
```

Get your Perplexity API key from: https://www.perplexity.ai/settings/api

## Project Structure

```
/app
  /api
    /auth           - Authentication endpoints
    /chat           - Chat and history endpoints
  /dashboard        - Mode selection dashboard
  /chat             - Chat interface page
  /login            - Login page
  /signup           - Registration page

/components
  /chat-interface.tsx  - Main chat UI with TTS and mode support

/lib
  /chat-modes.ts    - Mode configurations and prompts
  /db.ts            - Database operations (CRUD)
  /session.ts       - JWT session management

/data
  /database.json    - Persistent storage file
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Chat
- `POST /api/chat` - Send message with mode parameter
- `GET /api/chat/history` - Get user's chat history
- `DELETE /api/chat/history` - Clear user's chat history

## Running Locally

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run development server: `pnpm dev`
5. Open http://localhost:3000

## Disclaimer

This chatbot is designed for general mental wellness support and is NOT a substitute for professional mental health care. If you are experiencing a mental health crisis, please contact a mental health professional or crisis helpline.
