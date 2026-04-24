# CreditAssist AI — Intelligence Engine Overhaul

Transform the backend from a basic keyword pipeline into a multi-prompt AI system with confidence awareness, member context, learning loops, and time-decay urgency.

## Current State vs. Target

| Feature | Current | Target |
|---|---|---|
| Intent detection | Keyword matching (`if "loan" in q`) | **Prompt 1**: Gemini classifies intent + urgency 1-10 + confidence % |
| Sentiment scoring | Keyword lists → 1-5 scale | **Prompt 1**: Gemini scores emotional urgency 1-10 |
| Escalation | Simple rule-based | **Prompt 2**: Structured escalation packet with recommended actions |
| KB learning | Static (hardcoded) | **Prompt 3**: Staff resolutions → pending KB entries → admin approval |
| Confidence | None — resolve or escalate only | Below 80% → `soft_resolve` status with "verify" flag |
| Member history | Anonymous (no tracking) | Member profile with prior contact count, repeat-contact flag |
| Resolution feedback | Yes/No buttons exist | "No" auto-escalates with reason (currently just keeps "open") |
| Pattern detection | None | 5+ escalations on same topic → admin alert |
| Time pressure | None | Cases auto-climb priority after 2h unanswered |

---

## Open Questions

> [!IMPORTANT]
> **Q1: Gemini quota** — The API key has had quota issues. The multi-prompt approach means 1-2 Gemini calls per message (Prompt 1 always, Prompt 2 on escalation). Should I keep the smart fallback for when Gemini is down? (I recommend **yes** — the keyword-based pipeline becomes the fallback, not the primary.)

> [!IMPORTANT]
> **Q2: Prompt 3 scope** — The Learning Gate requires a staff-facing UI for writing resolutions and an admin-facing UI for approving KB entries. This adds 2 new pages + 3 new endpoints. Should I build it fully, or stub the backend endpoints and skip the UI for now?

> [!WARNING]
> **Q3: Persistence** — All data is currently in-memory (`cases = {}`). The member history, KB pending entries, and pattern tracking features benefit massively from a database. Should I add SQLite for persistence, or keep everything in-memory for demo purposes?

---

## Proposed Changes

### Phase 1: Backend Intelligence Engine

#### [MODIFY] [main.py](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/backend/main.py)

**1A — Prompt 1: The Classifier + Resolver (replaces steps 1-5)**

Replace the current 5-step keyword pipeline with a single structured Gemini prompt that returns JSON:

```python
PROMPT_1_TEMPLATE = """You are CreditAssist AI's classification engine for Horizon Community Credit Union (HCCU), India.

Analyze the member's message and return a JSON object with these exact fields:

KNOWLEDGE BASE:
{kb_context}

MEMBER HISTORY:
- Member ID: {member_id}
- Prior contacts this week: {prior_contact_count}  
- Prior intents: {prior_intents}
- Repeat contact: {is_repeat}

CONVERSATION HISTORY:
{history_text}

MEMBER MESSAGE: {message}

Return ONLY valid JSON:
{{
  "intent": "loan|card|account_update|dispute|policy|complaint|general",
  "urgency_score": <1-10 integer>,
  "confidence_pct": <0-100 integer>,
  "is_kb_sufficient": <true|false>,
  "should_escalate": <true|false>,
  "escalation_reason": "<reason or null>",
  "response": "<your empathetic response to the member, under 150 words>",
  "resolution_type": "resolved|soft_resolve|escalated|needs_info"
}}

RULES:
- urgency_score: 1=routine query, 5=frustrated, 8=distressed, 10=legal threat
- confidence_pct: how confident you are the KB answer is correct and complete
- if confidence_pct < 80, set resolution_type to "soft_resolve"
- if should_escalate is true, set resolution_type to "escalated"
- if is_repeat is true, add +2 to urgency_score (cap at 10)
- NEVER invent policies. If KB doesn't cover it, set is_kb_sufficient to false
- Always end response with "Did this resolve your issue?"
"""
```

The current keyword functions (`classify_intent`, `detect_sentiment`, `should_escalate`) become the **fallback** when Gemini is unavailable.

---

**1B — Prompt 2: The Escalation Formatter**

When Prompt 1 returns `should_escalate: true`, a second Gemini call generates a structured staff summary:

```python
PROMPT_2_TEMPLATE = """You are generating an escalation summary for staff at HCCU.

CHAT CONTEXT:
{conversation_history}

CLASSIFICATION:
- Intent: {intent}
- Urgency: {urgency_score}/10
- Confidence: {confidence_pct}%
- Member: {member_name} ({member_id})
- Prior contacts this week: {prior_contact_count}
- Repeat contact: {is_repeat}

Return ONLY valid JSON:
{{
  "issue_type": "<brief category>",
  "issue_summary": "<2-3 sentence summary of the problem>",
  "priority_score": <1-10 combined score>,
  "priority_label": "P1|P2|P3",
  "recommended_action": "<specific steps for staff>",
  "member_risk": "low|medium|high|critical",
  "sla_hours": <recommended response time in hours>
}}

RULES:
- priority_score = urgency_score + (2 if repeat_contact) + (1 if confidence < 50)
- P1: score >= 8, P2: score >= 5, P3: score < 5
- sla_hours: P1=1, P2=4, P3=24
"""
```

---

**1C — Member History Tracking**

Add a `member_profiles` dict that tracks per-member context:

```python
member_profiles = {}  # member_id -> {contacts_this_week, intents[], case_ids[], first_seen, last_seen}
```

On each chat request:
- Look up `member_profiles[req.member_id]`
- Count contacts this week
- Check if any prior intent matches current intent (repeat flag)
- Pass this context to Prompt 1

---

**1D — Confidence Threshold + Soft Resolve**

New status: `soft_resolve` — the AI thinks it answered correctly but isn't 100% sure.

- `confidence_pct >= 80` → `resolved` (current behavior)
- `confidence_pct 50-79` → `soft_resolve` (staff should verify)
- `confidence_pct < 50` or `should_escalate` → `escalated`

---

**1E — Pattern Detection**

Track escalation topics in a `pattern_tracker` dict:

```python
pattern_tracker = {}  # normalized_topic -> {count, first_seen, last_seen, sample_messages[]}
```

New endpoint `GET /api/patterns` returns topics escalated 5+ times:
```json
[{
  "topic": "credit card annual fee waiver",
  "escalation_count": 7,
  "first_seen": "2026-04-20T...",
  "last_seen": "2026-04-24T...",
  "suggested_kb_entry": "Consider adding policy for credit card annual fee waiver requests",
  "sample_messages": ["Can I get my annual fee waived?", ...]
}]
```

---

**1F — Time Decay Urgency**

In `GET /api/cases`, compute effective priority by adding time pressure:

```python
def compute_effective_priority(case):
    base_score = case["urgency_score"]  # 1-10
    hours_waiting = (now - case["created_at"]).total_seconds() / 3600
    
    # Every 2 hours adds +1 to priority (cap at 10)
    time_bonus = min(int(hours_waiting / 2), 3)
    effective = min(base_score + time_bonus, 10)
    
    # Re-classify: P1 >= 8, P2 >= 5, P3 < 5
    return effective, "P1" if effective >= 8 else "P2" if effective >= 5 else "P3"
```

Cases auto-climb the queue. A P3 case sitting for 6 hours becomes P2. Staff sees "waiting 4h" badge.

---

**1G — Auto-Escalation on Denial**

When user clicks "No" (denial intent), instead of just keeping status "open":
1. Auto-escalate the case
2. Include the AI's failed response as context
3. Generate Prompt 2 escalation summary
4. Priority gets +2 boost (the AI failed, staff must intervene)

---

#### [MODIFY] [kb.py](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/backend/kb.py)

Add a function to dynamically add approved KB entries to the FAISS index at runtime:

```python
def add_kb_entry(title, content, category):
    doc = Document(page_content=content, metadata={"title": title, "category": category})
    DOCUMENTS.append(doc)
    return doc
```

---

#### [NEW] backend/prompts.py

Extract all prompt templates into a dedicated file for maintainability:
- `PROMPT_1_CLASSIFIER` — intent + urgency + confidence + response
- `PROMPT_2_ESCALATION` — structured staff summary
- `PROMPT_3_KB_FORMATTER` — staff solution → KB entry draft

---

### Phase 2: Frontend Updates

#### [MODIFY] [MessageBubble.jsx](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/src/components/MessageBubble.jsx)

- Add `soft_resolve` status badge (amber "Verify" with eye icon)
- Add `confidence` display: small percentage badge next to status
- On "No" click → show a text input for reason before auto-escalating

---

#### [MODIFY] [useChat.js](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/src/hooks/useChat.js)

- Map new backend fields: `confidence_pct`, `urgency_score`, `resolution_type`
- Pass reason text when denial auto-escalates

---

#### [MODIFY] [DashboardPage.jsx](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/src/pages/DashboardPage.jsx)

- Show "waiting time" per case with color coding (green < 1h, amber 1-2h, red > 2h)
- Show effective priority (with time decay) not just static priority
- Add "Pattern Alerts" section showing topics escalated 5+ times
- Show structured Prompt 2 summaries instead of raw chat in case detail

---

#### [MODIFY] [CasesTable.jsx](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/src/components/dashboard/CasesTable.jsx)

- Add "Waiting" column with elapsed time badge
- Add "Confidence" column for soft-resolve cases
- Sort by effective priority (time-decayed) by default

---

#### [MODIFY] [CaseDetail.jsx](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/src/components/dashboard/CaseDetail.jsx)

- Show Prompt 2 structured summary (issue type, recommended action, SLA)
- Show member history (prior contacts, repeat flag)
- Add "Write Resolution" textarea for staff → triggers Prompt 3
- Show confidence breakdown

---

#### [MODIFY] [AnalyticsPanel.jsx](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/src/components/dashboard/AnalyticsPanel.jsx)

- Add "Pattern Alerts" card showing repeated escalation topics
- Add "Average Confidence" stat
- Add "Auto-Escalated (Denial)" count
- Add "Soft Resolve (Verify)" count

---

#### [MODIFY] [api.js](file:///c:/Users/abhis/OneDrive/Desktop/my%20projects/innorve/src/lib/api.js)

Add new API functions:
```js
export async function getPatterns()     // GET /api/patterns
export async function submitResolution(caseId, resolution)  // POST /api/cases/{id}/resolve
export async function getPendingKB()    // GET /api/kb/pending
export async function approveKBEntry(entryId)  // POST /api/kb/approve/{id}
```

---

### Phase 3: Prompt 3 — Learning Gate (if approved)

#### [NEW] New endpoints in main.py

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/cases/{id}/resolve` | Staff writes resolution → Prompt 3 formats as KB draft |
| GET | `/api/kb/pending` | List pending KB entries awaiting approval |
| POST | `/api/kb/approve/{id}` | Admin approves → entry added to FAISS live |
| DELETE | `/api/kb/reject/{id}` | Admin rejects draft |

#### Prompt 3 Template

```python
PROMPT_3_KB_FORMATTER = """A staff member resolved a member's issue. 
Format their solution as a knowledge base entry.

ORIGINAL ISSUE: {issue_summary}
STAFF RESOLUTION: {staff_resolution}
INTENT CATEGORY: {intent}

Return ONLY valid JSON:
{{
  "title": "<Policy or Procedure Title>",
  "content": "<formatted KB entry, factual, under 100 words>",
  "category": "<loans|card|account|dispute|products|complaint>"
}}
"""
```

---

## New Backend Response Shape (after changes)

```json
{
  "conversation_id": "uuid",
  "case_id": "CAS-XXXX",
  "answer": "Thank you for reaching out...",
  "status": "open | soft_resolve | resolved | escalated | greeting",
  "intent": "loan | card | ...",
  "sentiment": "neutral | frustrated | distressed",
  "urgency_score": 7,
  "confidence_pct": 65,
  "resolution_type": "soft_resolve",
  "is_repeat_contact": true,
  "prior_contact_count": 3,
  "kb_sources": ["FD Policy"],
  "escalation_summary": { /* Prompt 2 structured output */ },
  "pattern_alert": null
}
```

---

## Verification Plan

### Automated Tests

```bash
# 1. Test Prompt 1 classification accuracy
curl -X POST http://localhost:8000/api/chat \
  -d '{"message":"My card is blocked after wrong PIN","member_id":"MBR001"}'
# Expected: intent=card, confidence>=80, resolution_type=resolved

# 2. Test confidence threshold
curl -X POST http://localhost:8000/api/chat \
  -d '{"message":"What is the process for NRI account opening?","member_id":"MBR002"}'
# Expected: confidence<80 (not in KB), resolution_type=soft_resolve

# 3. Test repeat contact detection
# Send 3 messages with same member_id on dispute topic
# Expected: prior_contact_count=3, is_repeat=true, urgency_score boosted

# 4. Test denial auto-escalation
# Send "No, that didn't help" after a response
# Expected: status=escalated, escalation_summary present

# 5. Test time decay
# Seed old cases, GET /api/cases
# Expected: old cases show boosted effective_priority

# 6. Build test
npm run build  # must compile with zero errors
```

### Manual Verification
- Browser test: send greetings, queries, denials — check badges and buttons
- Dashboard: verify waiting time badges, pattern alerts section
- Soft resolve: check amber "Verify" badge appears for low-confidence answers
