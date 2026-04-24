# CreditAssist AI

**An AI-powered credit union member support system for Horizon Community Credit Union (HCCU), India.**

CreditAssist AI is a full-stack application with 3 logical layers:
- **Layer 1** — Member Chat Interface (React frontend, ChatGPT-style UI)
- **Layer 2** — AI Resolution Engine (FastAPI backend with RAG pipeline)
- **Layer 3** — Staff Dashboard (React frontend for case management & analytics)

---

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [How It Works (End-to-End Flow)](#how-it-works-end-to-end-flow)
- [Project Structure](#project-structure)
- [Backend (Layer 2) — Detailed Breakdown](#backend-layer-2--detailed-breakdown)
- [Frontend (Layer 1 & 3) — Detailed Breakdown](#frontend-layer-1--3--detailed-breakdown)
- [API Contract](#api-contract)
- [Tech Stack](#tech-stack)
- [Setup & Running](#setup--running)
- [Configuration](#configuration)
- [Key Design Decisions](#key-design-decisions)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│                        http://localhost:5173                     │
│                                                                 │
│  ┌──────────────────────┐    ┌────────────────────────────────┐ │
│  │   LAYER 1: Member    │    │   LAYER 3: Staff Dashboard     │ │
│  │   Chat Interface     │    │   /dashboard                   │ │
│  │   /                  │    │                                │ │
│  │   - Login screen     │    │   - Cases table (P1/P2/P3)     │ │
│  │   - ChatGPT-style UI │    │   - Case detail modal          │ │
│  │   - Sidebar + Header │    │   - Analytics panel            │ │
│  │   - Message bubbles  │    │   - Seed demo data button      │ │
│  │   - Input bar w/ mic │    │                                │ │
│  └──────────┬───────────┘    └───────────────┬────────────────┘ │
│             │                                │                  │
└─────────────┼────────────────────────────────┼──────────────────┘
              │  POST /api/chat                │ GET /api/cases
              │                                │ GET /api/analytics
              │                                │ POST /api/cases/seed
              ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI + Python)                    │
│                   http://localhost:8000                          │
│                                                                 │
│              LAYER 2: AI Resolution Engine                      │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│   │  Intent  │→ │Sentiment │→ │    KB     │→ │   Gemini     │   │
│   │Classify  │  │Detection │  │ Retrieval │  │  Response    │   │
│   │(keyword) │  │(keyword) │  │ (FAISS)  │  │  Generation  │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                 │
│   ┌──────────────────┐  ┌──────────────────────────────────┐    │
│   │  Escalation      │  │  In-Memory Case Store            │    │
│   │  Decision Logic  │  │  (dict — cases{})                │    │
│   └──────────────────┘  └──────────────────────────────────┘    │
│                                                                 │
│   Knowledge Base: 10 policy documents (kb.py)                   │
│   Vector Store: FAISS (in-memory, built at startup)             │
│   Embeddings: all-MiniLM-L6-v2 (HuggingFace, local)            │
│   LLM: Google Gemini 2.0 Flash Lite (via API)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works (End-to-End Flow)

### Member sends a message:

1. **User types** "I was overcharged for 3 months. Called twice, nobody helped." in the chat UI
2. **Frontend** sends `POST /api/chat` with:
   ```json
   {
     "message": "I was overcharged for 3 months. Called twice, nobody helped.",
     "member_id": "MBR12345",
     "member_name": "Priya Sharma",
     "conversation_id": null,         // null for first message, then reused
     "conversation_history": []       // grows each turn
   }
   ```
3. **Backend pipeline runs 5 steps:**
   - **Step 1 — Intent Classification** (keyword-based): detects `"complaint"` intent
   - **Step 2 — Sentiment Detection** (keyword-based): detects `"frustrated"` (score 4/5) because of "called twice", "nobody helped"
   - **Step 3 — KB Retrieval** (FAISS similarity search): finds top 3 relevant docs from the 10-doc knowledge base (e.g., "Grievance and Complaint Policy")
   - **Step 4 — Escalation Decision**: YES — because intent is `complaint` AND sentiment_score >= 4
   - **Step 5 — Response Generation**: Gemini generates an empathetic response using the KB context, conversation history, and escalation instructions. If Gemini quota is exceeded, a fallback generates the response directly from KB docs.

4. **Backend returns:**
   ```json
   {
     "conversation_id": "uuid-here",
     "case_id": "CAS-A1B2C3",
     "answer": "I completely understand your frustration, Priya. I've escalated your case...",
     "status": "escalated",
     "intent": "complaint",
     "sentiment": "frustrated",
     "sentiment_score": 4,
     "kb_sources": ["Grievance and Complaint Policy"],
     "escalation_summary": {
       "recommended_action": "URGENT — Assign dedicated Case Manager...",
       "priority": "P2"
     }
   }
   ```

5. **Frontend displays:**
   - AI message bubble with the response text
   - Metadata badges: "Escalated" (amber), "Frustrated" (amber), case ID reference
   - Expandable KB sources list
   - The case is now visible in the Staff Dashboard

6. **Multi-turn memory:** The frontend appends both `{role: "user", content: ...}` and `{role: "assistant", content: ...}` to a `conversationHistoryRef` (React useRef). On the next message, the full history is sent to the backend, giving Gemini multi-turn context.

---

## Project Structure

```
innorve/
├── backend/                          # LAYER 2: Python backend
│   ├── main.py                       # FastAPI app — all endpoints + AI pipeline
│   ├── kb.py                         # Knowledge base — 10 LangChain Documents
│   └── requirements.txt              # Python dependencies
│
├── src/                              # LAYER 1 & 3: React frontend
│   ├── main.jsx                      # Entry point — BrowserRouter wrapper
│   ├── App.jsx                       # Routes: / → ChatPage, /dashboard → DashboardPage
│   ├── index.css                     # Design system — tokens, animations, glassmorphism
│   │
│   ├── lib/
│   │   └── api.js                    # API client — 4 functions for backend endpoints
│   │
│   ├── hooks/
│   │   ├── useChat.js                # Chat logic — sendMessage, conversation_history (useRef)
│   │   └── useConversations.js       # Sidebar thread management
│   │
│   ├── components/
│   │   ├── LoginScreen.jsx           # Simple name + member ID input
│   │   ├── Sidebar.jsx               # Collapsible sidebar — conversations, user profile
│   │   ├── Header.jsx                # Top bar — branding + language dropdown
│   │   ├── ChatFeed.jsx              # Welcome screen + scrollable message list
│   │   ├── MessageBubble.jsx         # User/AI bubbles with metadata badges
│   │   ├── TypingIndicator.jsx       # Pulsing glow dots (loading state)
│   │   ├── InputBar.jsx              # Auto-expanding textarea + mic + paperclip + send
│   │   └── dashboard/
│   │       ├── CasesTable.jsx        # Cases list — urgency color-coded (P1🔴/P2🟡/P3🟢)
│   │       ├── CaseDetail.jsx        # Modal — case info, escalation, conversation history
│   │       └── AnalyticsPanel.jsx    # Stats cards + top intents bar chart
│   │
│   └── pages/
│       ├── ChatPage.jsx              # Layer 1 orchestrator — sidebar + header + feed + input
│       └── DashboardPage.jsx         # Layer 3 orchestrator — cases + analytics + seed
│
├── index.html                        # HTML entry — Inter font, meta tags
├── vite.config.js                    # Vite + Tailwind CSS v4 plugin
├── package.json                      # Node dependencies
└── dist/                             # Production build output
```

---

## Backend (Layer 2) — Detailed Breakdown

### File: `backend/main.py` (361 lines)

The backend is a **single-file FastAPI application** that implements a 5-step AI pipeline:

#### Step 1: Intent Classification (`classify_intent`)
- **Method:** Keyword matching (no ML model needed)
- **Intents:** `loan`, `card`, `account_update`, `dispute`, `policy`, `complaint`, `general`
- **Example:** "My debit card is blocked" → `card`

#### Step 2: Sentiment Detection (`detect_sentiment`)
- **Method:** Keyword matching across all user messages in conversation
- **Output:** Label (`neutral`/`mild`/`frustrated`/`distressed`) + Score (1-5)
- **Example:** "Called twice, nobody helped" → `frustrated`, score 4

#### Step 3: KB Retrieval (`retrieve_docs`)
- **Method:** FAISS similarity search using `all-MiniLM-L6-v2` embeddings (runs locally, no API)
- **Returns:** Top 3 most relevant documents from the 10-doc knowledge base
- **The KB** (`kb.py`) covers: FD policy, loans, card block/unblock, disputes, KYC, savings accounts, FD rates, personal loans, failed transactions, grievances

#### Step 4: Escalation Decision (`should_escalate`)
- **Escalates when ANY of:**
  - Intent is `complaint`
  - Sentiment score >= 4 (frustrated/distressed)
  - Repeat signals detected ("called twice", "still not resolved", etc.)

#### Step 5: Response Generation (`generate_response`)
- **Primary:** Google Gemini 2.0 Flash Lite via `google-generativeai` SDK
  - Receives a structured prompt with: KB context, conversation history (last 6 turns), member name, intent, escalation instructions, empathy notes
  - Constrained to: answer only from KB, max 150 words, use INR
- **Fallback** (`_fallback_response`): When Gemini quota is exceeded (429 error), generates a structured response directly from the top KB document with appropriate empathy prefix based on sentiment

#### In-Memory Case Store
- All conversations are saved as "cases" in a Python dict (`cases = {}`)
- Each case tracks: `case_id`, `member_id`, `intent`, `resolution_status`, `sentiment`, `sentiment_score`, `priority` (P1/P2/P3), `conversation_history`, `escalation_summary`, `kb_sources`
- Cases are lost on server restart (in-memory only — no database)

#### Endpoints:
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/chat` | Main chat — runs the full 5-step pipeline |
| `GET` | `/api/cases` | All cases sorted by urgency (for dashboard) |
| `GET` | `/api/cases/{conversation_id}` | Single case detail |
| `GET` | `/api/analytics` | Stats: total cases, escalation rate, top intents, sentiment breakdown |
| `POST` | `/api/cases/seed` | Loads 6 demo cases for dashboard demo |
| `GET` | `/health` | Health check |

### File: `backend/kb.py` (92 lines)

Contains 10 `langchain_core.documents.Document` objects — the entire knowledge base:

| # | Document Title | Category |
|---|----------------|----------|
| 1 | FD Premature Withdrawal Policy | products |
| 2 | Loan Application and Status Policy | loans |
| 3 | Card Block and Unblock Policy | card |
| 4 | Transaction Dispute and Fraud Policy | dispute |
| 5 | Account Update and KYC Policy | account |
| 6 | Savings Account and Minimum Balance Policy | account |
| 7 | FD Interest Rates | products |
| 8 | Personal Loan Policy | loans |
| 9 | Failed Transaction Refund Policy | dispute |
| 10 | Grievance and Complaint Policy | complaint |

Each document contains real policy text with specific numbers (interest rates, timelines, phone numbers, URLs).

---

## Frontend (Layer 1 & 3) — Detailed Breakdown

### Design System (`index.css`)
- **Ultra-dark theme:** Background `#0A0A0A`, surfaces `#111111`-`#1A1A1A`
- **Glassmorphism:** `backdrop-blur` + `rgba(255,255,255,0.03)` backgrounds + subtle borders
- **AI Aura:** `aura-pulse` keyframe — soft pulsing `box-shadow` with azure/purple gradient on AI avatar
- **Animations:** `shimmer`, `glow-breathe`, `recording-pulse`, `float-in` keyframes
- **Custom scrollbar:** 6px thin, `rgba(255,255,255,0.08)` thumb
- **Font:** Inter (Google Fonts)

### Layer 1: Member Chat Interface (`/`)

**Login Flow:**
- Simple name + optional member ID input (no auth)
- Stored in React state, passed to all API calls

**Chat Layout (mimics ChatGPT):**
- **Sidebar** (collapsible): "New Chat" button, conversation threads grouped by Today/Previous 7 Days/Older, user profile at bottom, "Staff Dashboard" link
- **Header**: "CreditAssist AI" branding with sparkle icon, multilingual dropdown (English, ಕನ್ನಡ, हिन्दी, தமிழ்)
- **ChatFeed**: Welcome screen with quick-action cards when empty → scrollable message list when active
- **InputBar**: Auto-expanding textarea, paperclip icon (visual only), mic icon (visual toggle with recording pulse animation), gradient send button. Enter = send, Shift+Enter = newline

**Message Bubbles:**
- **User messages:** Right-aligned, `rgba(255,255,255,0.06)` glass background
- **AI messages:** Left-aligned, transparent with left accent border, sparkle avatar with aura glow
- **AI metadata:** Resolution status badge (Resolved🟢/Escalated🟡/Needs Info🔵), sentiment badge, case ID reference, expandable KB sources list

**Conversation History Logic (`useChat.js`):**
- Uses `useRef` (not `useState`) for `conversationHistory` to avoid stale closures
- Before API call: appends `{role: "user", content: text}` to history
- After API response: appends both user turn AND `{role: "assistant", content: response}` to ref
- This ref is sent as `conversation_history` in the next API call, giving multi-turn memory

### Layer 3: Staff Dashboard (`/dashboard`)

- **Header:** Back arrow to chat, Refresh button, "Seed Demo Data" button
- **Split layout:** 60% cases table / 40% analytics panel
- **Cases table:** Each case shows urgency badge (P1🔴/P2🟡/P3🟢), case ID, member name, intent, status, sentiment bar (1-5). Click → opens case detail modal
- **Case detail modal:** Info grid (urgency, status, sentiment, intent), escalation summary with recommended action, full conversation history
- **Analytics panel:** Stat cards (total cases, escalation rate %, high priority count), top intents with animated bar chart

---

## API Contract

### `POST /api/chat`

**Request:**
```json
{
  "message": "string — user's message text",
  "member_id": "string — e.g. MBR12345 (optional, defaults to MBR00001)",
  "member_name": "string — e.g. Priya Sharma (optional, defaults to Member)",
  "conversation_id": "string|null — null for first message, then reuse from response",
  "conversation_history": "array — grows each turn, format: [{role, content}, ...]"
}
```

**Response:**
```json
{
  "conversation_id": "uuid — reuse this in subsequent messages",
  "case_id": "CAS-XXXXXX — reference number for the member",
  "answer": "string — the AI response text",
  "status": "resolved | escalated",
  "intent": "loan | card | account_update | dispute | policy | complaint | general",
  "sentiment": "neutral | mild | frustrated | distressed",
  "sentiment_score": "integer 1-5",
  "kb_sources": ["array of policy document titles used"],
  "escalation_summary": "object|null — present only when escalated"
}
```

### `GET /api/cases`
Returns `{ total, resolved, escalated, cases: [...] }` sorted by urgency.

### `GET /api/analytics`
Returns `{ total_cases, resolved, escalated, escalation_rate_pct, top_intents, sentiment_breakdown, high_priority_cases }`.

### `POST /api/cases/seed`
Returns `{ total, resolved, escalated, cases: [...] }` sorted by urgency.

---

## Deployment

### 1. Initialize Git
1. Open a terminal in the project root.
2. Run:
   ```bash
git init
git add .
git commit -m "chore: initialize repository"
```
3. Create a repository on GitHub and add it as a remote:
   ```bash
git remote add origin https://github.com/<username>/<repo>.git
git branch -M main
git push -u origin main
```

### 2. Deploy Frontend to Vercel
1. Sign in to https://vercel.com.
2. Import the repository from GitHub.
3. Use the following settings for the project:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set environment variables in Vercel:
   - `GEMINI_API_KEY` = your Gemini API key
   - `VITE_API_BASE` = the public URL of your deployed backend, for example `https://your-backend.example.com`

### 3. Backend Deployment
- This repository currently contains a static Vite frontend and a separate FastAPI backend.
- Vercel is configured here for the frontend only.
- Deploy the backend separately to a Python-friendly host such as Render, Railway, Fly, or any VM with `uvicorn`.
- Start the backend with:
   ```bash
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 4. Notes
- `vercel.json` is configured to build the frontend from `dist`.
- The backend is not deployed on Vercel in this setup because it requires a long-running FastAPI service.
Loads 6 hardcoded demo cases (P1/P2/P3 mix) into the in-memory store.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.13** | Runtime |
| **FastAPI** | Web framework / API server |
| **Uvicorn** | ASGI server |
| **LangChain** | Document abstraction + FAISS integration |
| **FAISS (faiss-cpu)** | Vector similarity search for KB retrieval |
| **HuggingFace Embeddings** | `all-MiniLM-L6-v2` — local sentence embeddings (no API needed) |
| **Google Generative AI** | Gemini 2.0 Flash Lite — LLM for response generation |
| **Pydantic** | Request/response validation |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool + dev server + HMR |
| **Tailwind CSS v4** | Utility-first styling (via `@tailwindcss/vite` plugin) |
| **Framer Motion** (`motion`) | Animations — message fade-in, sidebar slide, typing indicator |
| **Lucide React** | Icon library (Sparkles, Send, Mic, Paperclip, etc.) |
| **React Router DOM v7** | Client-side routing (`/` and `/admin-dashboard-secure`) |

---

## Setup & Running

### Prerequisites
- **Node.js** >= 18
- **Python** >= 3.10
- **A Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file from the example:
```bash
cp .env.example .env
```

Edit `backend/.env` — set your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

> **⚠️ Security:** Never commit `.env` to version control. It is already in `.gitignore`.

Start the backend:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend loads the KB into FAISS on startup (~5-10 seconds for embedding model download on first run). You'll see:
```
Loading knowledge base...
✅ Knowledge base ready — 10 documents loaded
```

### 2. Frontend Setup

```bash
cd innorve          # project root
npm install
npm run dev
```

Opens at `http://localhost:5173/`.

### 3. Usage

1. Open `http://localhost:5173/`
2. Enter your name and (optional) member ID → click "Start Chatting"
3. Type a question like "What is the penalty for breaking my FD early?"
4. The AI responds with KB-sourced information + metadata badges + "Did this resolve your issue?"
5. Reply "Yes, thanks!" to mark the case as resolved, or continue the conversation
6. Staff: Navigate to `/admin-dashboard-secure` and enter passcode `innorve2026`
7. Click "Seed Demo Data" to populate sample cases for the dashboard demo

---

## Configuration

| Setting | Location | Default |
|---|---|---|
| Gemini API key | `backend/.env` | Must be set via `GEMINI_API_KEY` env var |
| Gemini model | `backend/main.py` line 27 | `gemini-2.0-flash-lite` |
| Backend URL | `src/lib/api.js` line 1 | `http://localhost:8000` |
| Frontend port | `vite.config.js` | `5173` |
| Backend port | Uvicorn command | `8000` |
| CORS | `backend/main.py` line 40 | `allow_origins=["*"]` |
| Admin passcode | `src/components/AdminLogin.jsx` | `innorve2026` |
| Dashboard route | `src/App.jsx` | `/admin-dashboard-secure` |

---

## Key Design Decisions

1. **Conversation history uses `useRef` not `useState`** — Avoids stale closure bugs in the async `sendMessage` callback. The ref always has the latest history.

2. **Fallback response system** — When Gemini quota is exceeded (429), the backend generates structured responses directly from KB documents instead of failing. This ensures the demo always works.

3. **In-memory case store** — No database. Cases live in a Python dict and are lost on restart. This is intentional for a demo/prototype. For production, replace with MongoDB/PostgreSQL.

4. **Voice input is UI-only** — The mic button toggles a recording visual state (red pulse animation) but does not implement Web Speech API. This is a placeholder for future implementation.

5. **File upload is visual-only** — The paperclip icon is present but non-functional since the backend has no file upload endpoint.

6. **Keyword-based intent/sentiment** — Intent classification and sentiment detection use simple keyword matching, not ML models. This is fast and deterministic but less flexible than an LLM-based approach.

7. **FAISS is rebuilt on every startup** — The vector store is not persisted to disk. For 10 documents this takes <1 second. For larger KBs, consider saving/loading the FAISS index.

8. **State machine for case resolution** — Cases start as `open` and only transition to `resolved` when the user explicitly confirms ("Yes, thanks!"). The AI always asks "Did this resolve your issue?" to prompt confirmation. Denied or continued issues remain `open` or escalate.

9. **Admin dashboard isolation** — The staff dashboard is on a hidden route (`/admin-dashboard-secure`) behind a passcode gate. No links to it exist in the member-facing UI.

10. **Environment variable security** — The Gemini API key is loaded from `backend/.env` via `python-dotenv`, never hardcoded. A `.env.example` template is provided, and `.env` is in `.gitignore`.
