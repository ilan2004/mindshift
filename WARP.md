# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Nudge** is a personality-aware productivity platform that combats digital distraction through AI-driven personality profiling, commitment mechanisms, and personalized nudges. Unlike generic blockers, Nudge analyzes user chat patterns to generate personalized assessments and adapts interventions to individual psychology.

### Core Architecture

The system consists of four main components:

1. **Next.js Frontend** (`src/`) - React 19 app with App Router pattern
2. **FastAPI Backend** (`backend/`) - Python API with OpenAI/Groq integration  
3. **Supabase Database** - PostgreSQL with RLS policies and comprehensive schema
4. **Chrome Extension** (`extension/`) - MV3 extension for focus sessions and site blocking

## Development Commands

### Frontend (Next.js)
```powershell
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (FastAPI)
```powershell
# Setup and activation (Windows)
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt

# Start development server
cd backend
uvicorn app.main:app --reload --port 8000

# Health check
curl http://localhost:8000/healthz
```

### Database Setup
```sql
-- Apply the complete schema from database/schema.sql to Supabase
-- Set environment variables in .env.local:
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Chrome Extension
- Load unpacked extension from `extension/` directory in Chrome Developer Mode
- Extension works with both localhost:3000 and production deployments

## Key Architecture Patterns

### Frontend Flow Architecture
The app uses a sophisticated stage-based flow managed by `ClientLayout.jsx`:

**Stages**: `greeting` → `introForm` → `testRunner` → `finalReveal` → `app`

- **greeting**: GSAP-powered animated introduction
- **introForm**: User metadata collection (AuthOverlay) 
- **testRunner**: Personality assessment based on chat history analysis
- **finalReveal**: Profile assignment and character reveal
- **app**: Main application dashboard

### API Integration Pattern
All backend communication flows through `src/lib/backend.js` wrapper, never directly from components:

```javascript
// Wrong: Direct fetch from components
fetch('/api/questions')

// Correct: Use API wrapper
import { postHistory, getQuestions } from '../lib/backend'
```

### State Management Philosophy
- **Supabase**: Single source of truth for persistent data
- **Chrome Extension**: Uses chrome.storage.sync for session state
- **Local Storage**: Only for temporary UI preferences and intro completion flags
- **No global state management**: Prefer prop drilling and local component state

### Animation Architecture
Built on **GSAP + SplitType** for text animations:
- `TextReveal.jsx`: Line-by-line text reveals
- `Loader.jsx`: Preloader animations adapted from Terrene design system
- All animations use CSS custom properties for theme consistency

## Database Schema Understanding

### Core Tables
- **`profiles`**: User profiles with Supabase Auth integration, personality types
- **`users`**: Legacy users table (backward compatibility)
- **`focus_sessions`**: Timer state, Pomodoro sessions
- **`blocked_domains`**: Per-user site blocking configuration
- **`contracts`**: Commitment mechanisms (financial, peer, streak-based)

### AI Pipeline Tables  
- **`chat_history`**: Uploaded ChatGPT conversations for personality analysis
- **`generated_questions`**: LLM-generated personalized questions per user
- **`user_answers`**: Responses to generated questions
- **`traits`**: Computed personality traits and scores
- **`recommendations`**: Profile-based productivity recommendations

### Query Patterns
Most queries are user-scoped with RLS policies. Always filter by `user_id` or use `auth.uid()`:

```sql
-- User profile data
SELECT * FROM profiles WHERE id = auth.uid()

-- User's focus sessions
SELECT * FROM focus_sessions WHERE user_id = auth.uid() ORDER BY created_at DESC

-- User's blocked domains  
SELECT domain FROM blocked_domains WHERE user_id = auth.uid()
```

## Chrome Extension Architecture

### Background Script (`background.js`)
- **Session Management**: Pomodoro/break timers using chrome.alarms
- **Site Blocking**: Dynamic DNR rules based on user's blocklist
- **Storage**: chrome.storage.sync for session state and preferences
- **Messaging Bridge**: Handles messages from content script and popup

### Content Script (`content.js`)
- **Message Relay**: Forwards window.postMessage ↔ chrome.runtime messaging
- **Custom Events**: Listens for focus session events from web app
- **Domain Handling**: Extracts domains for temporary allow functionality

### Site Blocking Flow
1. User starts focus session → Background script creates DNR rules
2. Navigation to blocked domain → Redirect to `blocked.html` overlay
3. User can request temporary access → Rules updated dynamically
4. Session ends → All blocking rules removed

## API Contract Patterns

### Backend Endpoints Structure
```
/healthz - Health check
/history/* - Chat history processing and question generation  
/questions/* - MBTI question management
/answers/* - Answer processing and trait computation
/events/* - User event tracking and recommendations
/blocklist/{token} - Per-user domain blocking (GET/POST/DELETE)
```

### Request/Response Conventions
- All POST requests expect JSON bodies with proper Content-Type
- Responses follow `{data: {...}, error?: string}` pattern
- Authentication via Supabase JWT or temporary tokens
- CORS configured for localhost:3000 and Vercel deployments

## Component Architecture Patterns

### Overlay Components
Full-screen overlays with consistent z-index layering:
- `z-[100]`: Top-level overlays (AuthOverlay, TestRunner)
- `z-[90]`: Loading states and transitions  
- `z-[80]`: Background overlay prevention

### Animation Components
- **TextReveal**: Line-by-line reveals with GSAP + SplitType
- **AnimatedCard**: Hover states and micro-interactions
- **FocusRing**: Accessibility focus indicators

### Data Fetching Pattern
Components receive data as props, fetching happens at page level:

```javascript
// Good: Page-level data fetching
export default async function Dashboard() {
  const data = await getBackendData()
  return <DashboardContent data={data} />
}

// Avoid: Component-level data fetching in render
function Widget() {
  const [data, setData] = useState(null)
  useEffect(() => { fetchData().then(setData) }, [])
  return <div>{data?.value}</div>
}
```

## Testing and Development

### Running Individual Tests
```powershell
# Frontend component testing
npm test -- ComponentName

# Backend endpoint testing  
cd backend
python -m pytest tests/test_main.py::test_specific_function

# Extension testing
# Load unpacked extension and use Chrome DevTools
```

### Development Environment Setup
1. **Frontend**: Requires Node.js 18+, uses React 19 and Next.js 15
2. **Backend**: Python 3.9+, FastAPI with Groq/OpenAI integration
3. **Database**: Supabase project with applied schema from `database/schema.sql`
4. **Extension**: Chrome 88+ for Manifest V3 support

### Environment Variables Required
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Backend (backend/.env)
GROQ_API_KEY=         # For LLM question generation
SUPABASE_URL=         # For direct DB access
SUPABASE_SERVICE_ROLE=
ALLOWED_ORIGINS=      # CORS configuration
```

## Key Files and Their Purposes

- **`src/components/ClientLayout.jsx`**: Core application flow controller
- **`src/lib/supabase.js`**: Database client singleton with error handling
- **`backend/app/main.py`**: FastAPI application with CORS and route registration
- **`database/schema.sql`**: Complete database schema with RLS policies
- **`extension/background.js`**: Chrome extension service worker with session management
- **`docs/Project_Overview.md`**: Comprehensive technical documentation
- **`docs/api_contract.md`**: API endpoint specifications and examples

## Personality Assessment System

The core innovation is personality-driven productivity interventions:

1. **History Analysis**: Users upload ChatGPT conversations → LLM extracts behavioral patterns
2. **Question Generation**: Groq API creates 10-15 personalized questions based on chat patterns  
3. **Profile Assignment**: Answers mapped to archetypes (Achiever, Explorer, Diplomat, Analyst)
4. **Adaptive Nudges**: Site blocking overlays use personality-specific messaging
5. **Progress Tracking**: Dashboard shows personality-aligned productivity metrics

This system requires careful prompt engineering and consistent trait scoring across the question generation and profiling pipeline.
