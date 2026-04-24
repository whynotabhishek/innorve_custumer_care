"""
CreditAssist AI — Layer 2: AI Resolution Engine
Horizon Community Credit Union
Stack: FastAPI + LangChain + FAISS + Gemini

"""
CreditAssist AI — Layer 2: AI Resolution Engine
Horizon Community Credit Union
Stack: FastAPI + lightweight keyword retrieval
"""

from pydantic import BaseModel
from pathlib import Path
from typing import Optional, List
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from kb import DOCUMENTS
import os

# ── LOAD ENV VARIABLES ────────────────────────────────────────────────────────
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("[WARNING] GEMINI_API_KEY not found in .env -- LLM responses will use fallback mode.")

# ── LOAD ENV VARIABLES ────────────────────────────────────────────────────────
load_dotenv()

# ── LOAD KB ───────────────────────────────────────────────────────────────────
print("Loading knowledge base...")
print(f"[OK] Knowledge base ready -- {len(DOCUMENTS)} documents loaded")
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.from_documents(DOCUMENTS, embedding)
print(f"[OK] Knowledge base ready -- {len(DOCUMENTS)} documents loaded")

# ── FASTAPI APP ───────────────────────────────────────────────────────────────
app = FastAPI(title="CreditAssist AI — Layer 2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── IN-MEMORY CASE STORE ──────────────────────────────────────────────────────
cases = {}

# ── SCHEMAS ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    member_id: Optional[str] = "MBR00001"
    member_name: Optional[str] = "Member"
    conversation_id: Optional[str] = None
    conversation_history: Optional[List[dict]] = []

# ── STEP 1: INTENT CLASSIFICATION (AI-POWERED) ──────────────────────────────
import json as _json

INTENT_CLASSIFIER_PROMPT = """You are an intent classifier for a credit union customer support chatbot.

Analyze the user's message and classify it into EXACTLY ONE of these categories:
- "greeting" — Any form of hello, hi, good morning, hey, howdy, how are you, or any casual/social opener with no actual support question
- "confirmation" — User is confirming their issue is resolved (yes, thanks, that helped, perfect, etc.)
- "denial" — User is saying their issue is NOT resolved (no, didn't help, still not working, etc.)
- "loan" — Questions about loans, EMI, borrowing, personal/home/vehicle loans
- "card" — Questions about debit/credit cards, blocked cards, PIN, ATM
- "account_update" — Requests to update address, phone, name, KYC
- "dispute" — Transaction disputes, fraud, unrecognised charges, refunds
- "policy" — Questions about FD, interest rates, savings, account policies, balance
- "complaint" — Complaints, escalation requests, overcharging, unresolved issues, wanting to speak to manager
- "general" — Anything else that doesn't fit the above categories

CONVERSATION HISTORY:
{history}

CURRENT MESSAGE: {message}

RULES:
1. Return ONLY the intent category as a single word (e.g. greeting). No quotes, no JSON, no explanation.
2. If the message is purely social/casual with no support question, classify as "greeting".
3. If the message starts with a greeting BUT also contains a support question (e.g. "hi, my card is blocked"), classify based on the support question, NOT as greeting.
4. Be case-insensitive. Handle typos, slang, emoji, and informal language.
"""

def classify_intent(query: str, conversation_history: list = None) -> str:
    """AI-powered intent classification using Gemini, with keyword fallback."""
    try:
        # Build minimal history context (last 4 turns)
        history_text = "None"
        if conversation_history:
            recent = conversation_history[-4:]
            history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in recent])

        prompt = INTENT_CLASSIFIER_PROMPT.format(
            history=history_text,
            message=query
        )

        response = gemini.generate_content(prompt)
        raw = response.text.strip().lower().strip('"').strip("'").strip()

        # Validate the response is a known intent
        valid_intents = {
            "greeting", "confirmation", "denial",
            "loan", "card", "account_update", "dispute",
            "policy", "complaint", "general"
        }

        if raw in valid_intents:
            print(f"[AI INTENT] '{query[:50]}' -> {raw}")
            return raw

        # If AI returned something unexpected, try to extract a valid intent from it
        for intent in valid_intents:
            if intent in raw:
                print(f"[AI INTENT] '{query[:50]}' -> {intent} (extracted from '{raw}')")
                return intent

        # If AI response is completely unrecognizable, fall back
        print(f"[WARN] AI returned unrecognized intent '{raw}', falling back to keyword classifier")
        return _keyword_classify_intent(query)

    except Exception as e:
        print(f"[WARN] AI intent classification failed: {e}, falling back to keyword classifier")
        return _keyword_classify_intent(query)


def _keyword_classify_intent(query: str) -> str:
    """Keyword-based fallback classifier — used when Gemini API is unavailable."""
    q = query.lower().strip()
    import re
    q_clean = re.sub(r'[^\w\s]', '', q).strip()
    words = q_clean.split()

    if not words:
        return "greeting"

    # Quick greeting check (simplified)
    greeting_words = {
        "hi", "hello", "hey", "hii", "hiii", "howdy", "namaste", "hola",
        "sup", "yo", "heya", "hiya", "morning", "evening", "afternoon",
        "gm", "greetings", "hai", "bonjour",
    }
    greeting_phrases = [
        "good morning", "good afternoon", "good evening", "good night",
        "how are you", "how r u", "hey there", "hi there", "hello there",
    ]

    if len(words) <= 3 and words[0] in greeting_words:
        return "greeting"
    if any(q_clean.startswith(p) for p in greeting_phrases) and len(words) <= 6:
        return "greeting"

    # Confirmation / Denial
    confirm_words = ["yes", "thanks", "thank you", "that helped", "resolved",
                     "great", "perfect", "awesome", "got it", "all good"]
    if any(w in q for w in confirm_words) and len(words) <= 15:
        return "confirmation"
    deny_words = ["no", "not resolved", "didn't help", "still", "not working",
                  "didn't fix", "wrong", "incorrect"]
    if any(w in q for w in deny_words) and len(words) <= 15:
        return "denial"

    # Topic intents
    if any(w in q for w in ["loan", "emi", "borrow", "personal loan", "home loan", "vehicle"]):
        return "loan"
    elif any(w in q for w in ["card", "blocked", "unblock", "pin", "debit", "atm"]):
        return "card"
    elif any(w in q for w in ["address", "mobile", "phone", "name", "update", "kyc", "change"]):
        return "account_update"
    elif any(w in q for w in ["transaction", "charge", "dispute", "unrecognised", "fraud", "refund", "deducted"]):
        return "dispute"
    elif any(w in q for w in ["fd", "fixed deposit", "interest rate", "savings", "balance", "minimum"]):
        return "policy"
    scored_docs = []

    for doc in DOCUMENTS:
        text = f"{doc.metadata.get('title', '')} {doc.page_content}".lower()
        score = sum(1 for word in query.lower().split() if word in text)
        scored_docs.append((score, doc))

    scored_docs.sort(key=lambda item: item[0], reverse=True)
    top_docs = [doc for score, doc in scored_docs[:k] if score > 0]
    if not top_docs:
        top_docs = DOCUMENTS[:k]

    return [{"content": d.page_content, "title": d.metadata["title"]} for d in top_docs]
    else:
        return "general"

# ── STEP 2: SENTIMENT DETECTION ───────────────────────────────────────────────
def detect_sentiment(message: str, history: List[dict]) -> tuple[str, int]:
    """Returns (sentiment_label, score 1-5)"""
    all_text = " ".join([m["content"] for m in history if m["role"] == "user"] + [message]).lower()

    distressed_words = ["furious", "terrible", "useless", "pathetic", "disgusting", "worst", "cheated", "fraud", "scam", "immediately", "lawyer", "court"]
    frustrated_words = ["frustrated", "angry", "fed up", "still not", "called twice", "called again", "nobody helped", "unresolved", "overcharged", "third time", "keep waiting", "ridiculous"]
    mild_words = ["disappointed", "concerned", "worried", "why is", "how come", "not working", "issue", "problem"]

    if any(w in all_text for w in distressed_words):
        return "distressed", 5
    elif any(w in all_text for w in frustrated_words):
        return "frustrated", 4
    elif any(w in all_text for w in mild_words):
        return "mild", 3
    else:
        return "neutral", 2

# ── STEP 3: RETRIEVE FROM KB ──────────────────────────────────────────────────
def retrieve_docs(query: str, k: int = 3) -> list:
    docs = db.similarity_search(query, k=k)
    return [{"content": d.page_content, "title": d.metadata["title"]} for d in docs]

# ── STEP 4: ESCALATION DECISION ───────────────────────────────────────────────
def should_escalate(intent: str, sentiment_score: int, message: str, history: List[dict]) -> bool:
    # Always escalate complaints
    if intent == "complaint":
        return True
    # Escalate distressed/frustrated members
    if sentiment_score >= 4:
        return True
    # Escalate if repeat signals in conversation
    all_text = " ".join([m["content"] for m in history] + [message]).lower()
    repeat_signals = ["called twice", "called again", "still not resolved", "nobody helped",
                      "third time", "already raised", "second time", "keep calling"]
    if any(s in all_text for s in repeat_signals):
        return True
    return False

# ── STEP 5: GENERATE RESPONSE WITH GEMINI ────────────────────────────────────
def generate_response(message: str, member_name: str, intent: str,
                      docs: list, history: List[dict], escalating: bool, sentiment: str) -> str:

    # Build KB context
    kb_context = "\n\n".join([f"[{d['title']}]\n{d['content']}" for d in docs])
    if not kb_context:
        kb_context = "No specific policy found."

    # Build conversation history (last 6 turns)
    history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history[-6:]])

    escalation_note = (
        "You are escalating this case to a human staff agent. Tell the member clearly and reassure them a specialist will follow up within 1-2 hours."
        if escalating else
        "Resolve this directly using the knowledge base context."
    )

    empathy_note = (
        "IMPORTANT: This member is frustrated or distressed. Start with genuine empathy before any solution."
        if sentiment in ("frustrated", "distressed") else ""
    )

    prompt = f"""You are CreditAssist AI for Horizon Community Credit Union (HCCU), India.
You are professional, empathetic, and concise.

RULES:
- Answer ONLY from the Knowledge Base context below. Never invent policies.
- If KB does not have the answer, say so honestly and direct to 1800-123-4567.
- Use numbered steps when giving instructions.
- Keep response under 150 words.
- Use INR rupees for amounts.
- At the END of your response, ALWAYS ask: "Did this resolve your issue?"
- {escalation_note}
{empathy_note}

KNOWLEDGE BASE:
{kb_context}

CONVERSATION HISTORY:
{history_text}

MEMBER NAME: {member_name}
INTENT: {intent}

MEMBER: {message}

CREDITASSIST AI:"""

    try:
        response = gemini.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[WARN] Gemini API error: {e}")
        # Smart fallback: generate response from KB docs directly
        return _fallback_response(message, member_name, intent, docs, escalating, sentiment)

# ── FALLBACK RESPONSE (when Gemini quota exceeded) ────────────────────────────
def _fallback_response(message: str, member_name: str, intent: str,
                       docs: list, escalating: bool, sentiment: str) -> str:
    """Generate a helpful response from KB docs when Gemini is unavailable."""

    # Empathy prefix for frustrated/distressed members
    empathy = ""
    if sentiment == "distressed":
        empathy = f"I completely understand your frustration, {member_name}, and I sincerely apologise for the experience. "
    elif sentiment == "frustrated":
        empathy = f"I'm sorry you're facing this issue, {member_name}. Let me help you right away. "
    else:
        empathy = f"Thank you for reaching out, {member_name}. "

    # If escalating
    if escalating:
        return (f"{empathy}I've flagged your case as high priority and a specialist from our team "
                f"will contact you within 1-2 hours to resolve this personally. "
                f"Your reference number has been generated for tracking. "
                f"In the meantime, you can also reach us at 1800-123-4567.")

    # Build response from KB docs
    if docs:
        # Use the most relevant doc
        top_doc = docs[0]
        content = top_doc["content"].strip()
        title = top_doc["title"]

        # Clean up the content (remove extra whitespace)
        content = " ".join(content.split())

        # Truncate if too long
        if len(content) > 400:
            content = content[:400] + "..."

        return (f"{empathy}Based on our **{title}**:\n\n"
                f"{content}\n\n"
                f"Did this resolve your issue?")
    else:
        return (f"{empathy}I don't have specific information about that in our knowledge base. "
                f"Please contact us at 1800-123-4567 or email support@horizoncu.in for detailed assistance.\n\n"
                f"Did this resolve your issue?")

# ── MAIN ENDPOINT ─────────────────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest):
    conversation_id = req.conversation_id or str(uuid.uuid4())

    # Run pipeline
    intent          = classify_intent(req.message, req.conversation_history)
    sentiment, score = detect_sentiment(req.message, req.conversation_history)

    # Short-circuit for greetings — no KB retrieval needed
    if intent == "greeting":
        docs = []
        escalating = False
        answer = (f"Hello {req.member_name}! 👋 Welcome to CreditAssist AI. "
                  f"I'm here to help you with anything related to your credit union account — "
                  f"loans, FDs, cards, transactions, or any other queries. "
                  f"How can I assist you today?")
    else:
        docs            = retrieve_docs(req.message)
        escalating      = should_escalate(intent, score, req.message, req.conversation_history)
        answer          = generate_response(
                            req.message, req.member_name, intent,
                            docs, req.conversation_history, escalating, sentiment
                          )

    # Resolution status — State Machine
    # Default is "open". Only moves to "resolved" when user confirms.
    existing_case = cases.get(conversation_id, {})
    prev_status = existing_case.get("resolution_status", "open")

    if intent == "greeting":
        # Greetings don't need case tracking
        status = "greeting"
    elif escalating:
        status = "escalated"
    elif intent == "confirmation" and prev_status == "open":
        # User confirmed the issue is resolved
        status = "resolved"
        answer = f"Wonderful, {req.member_name}! I'm glad I could help. Your case has been marked as resolved. If you ever need assistance again, don't hesitate to reach out. Have a great day! 🙏"
    elif intent == "denial":
        # User says it's NOT resolved — keep open or escalate
        status = "open"
    else:
        # Default: keep case open until user confirms
        status = prev_status if prev_status in ("open", "escalated") else "open"

    # Build escalation summary if needed
    escalation_summary = None
    if escalating:
        escalation_summary = {
            "member_id":          req.member_id,
            "member_name":        req.member_name,
            "intent":             intent,
            "sentiment":          sentiment,
            "sentiment_score":    score,
            "issue_summary":      req.message[:300],
            "kb_sources":         [d["title"] for d in docs],
            "recommended_action": _recommend_action(intent, score),
            "escalated_at":       _now(),
            "priority":           "P1" if score >= 5 else "P2" if score >= 4 else "P3",
        }

    # Update history
    updated_history = req.conversation_history + [
        {"role": "user",      "content": req.message},
        {"role": "assistant", "content": answer},
    ]

    # Save case
    existing = cases.get(conversation_id, {})
    case_id  = existing.get("case_id") or ("CAS-" + str(uuid.uuid4())[:6].upper())
    cases[conversation_id] = {
        "case_id":             case_id,
        "conversation_id":     conversation_id,
        "member_id":           req.member_id,
        "member_name":         req.member_name,
        "intent":              intent,
        "resolution_status":   status,
        "sentiment":           sentiment,
        "sentiment_score":     score,
        "priority":            escalation_summary["priority"] if escalation_summary else "P3",
        "created_at":          existing.get("created_at", _now()),
        "updated_at":          _now(),
        "conversation_history": updated_history,
        "escalation_summary":  escalation_summary,
        "kb_sources":          [d["title"] for d in docs],
    }

    return {
        "conversation_id":   conversation_id,
        "case_id":           case_id,
        "answer":            answer,
        "status":            status,
        "intent":            intent,
        "sentiment":         sentiment,
        "sentiment_score":   score,
        "kb_sources":        [d["title"] for d in docs],
        "escalation_summary": escalation_summary,
    }

# ── CASES ENDPOINTS (for Layer 3 dashboard) ───────────────────────────────────
@app.get("/api/cases")
async def get_cases():
    sorted_cases = sorted(
        list(cases.values()),
        key=lambda x: ({"P1": 0, "P2": 1, "P3": 2}.get(x.get("priority", "P3"), 2), -x.get("sentiment_score", 0))
    )
    return {
        "total":     len(cases),
        "resolved":  sum(1 for c in cases.values() if c["resolution_status"] == "resolved"),
        "escalated": sum(1 for c in cases.values() if c["resolution_status"] == "escalated"),
        "cases":     sorted_cases,
    }

@app.get("/api/cases/{conversation_id}")
async def get_case(conversation_id: str):
    case = cases.get(conversation_id)
    if not case:
        return {"error": "Case not found"}
    return case

@app.get("/api/analytics")
async def analytics():
    from collections import Counter
    if not cases:
        return {"message": "No cases yet"}
    all_cases = list(cases.values())
    total     = len(all_cases)
    escalated = sum(1 for c in all_cases if c["resolution_status"] == "escalated")
    resolved  = sum(1 for c in all_cases if c["resolution_status"] == "resolved")
    return {
        "total_cases":            total,
        "resolved":               resolved,
        "escalated":              escalated,
        "escalation_rate_pct":    round(escalated / total * 100, 1) if total else 0,
        "top_intents":            [{"intent": k, "count": v} for k, v in Counter(c["intent"] for c in all_cases).most_common(5)],
        "sentiment_breakdown":    dict(Counter(c["sentiment"] for c in all_cases)),
        "high_priority_cases":    sum(1 for c in all_cases if c.get("sentiment_score", 0) >= 4),
    }

@app.post("/api/cases/seed")
async def seed():
    """Loads demo cases for dashboard demo"""
    now = _now()
    demo = [
        {"case_id": "CAS-DEMO1", "conversation_id": "demo-1", "member_id": "MBR10042", "member_name": "Priya Sharma",   "intent": "complaint",     "resolution_status": "escalated", "sentiment": "distressed", "sentiment_score": 5, "priority": "P1", "created_at": now, "updated_at": now, "conversation_history": [{"role": "user", "content": "I have been overcharged for 3 months. Called twice, nothing resolved."}, {"role": "assistant", "content": "I'm truly sorry Priya. I'm escalating this to a senior case manager who will contact you within the hour."}], "escalation_summary": {"recommended_action": "URGENT — Review overcharge history and refund. Contact within 1 hour.", "priority": "P1", "issue_summary": "Overcharged for 3 months, two prior contacts unresolved."}, "kb_sources": ["Grievance and Complaint Policy"]},
        {"case_id": "CAS-DEMO2", "conversation_id": "demo-2", "member_id": "MBR20187", "member_name": "Arjun Menon",    "intent": "dispute",       "resolution_status": "escalated", "sentiment": "frustrated", "sentiment_score": 4, "priority": "P2", "created_at": now, "updated_at": now, "conversation_history": [{"role": "user", "content": "I see a charge I don't recognise for Rs 3200. I didn't make this."}, {"role": "assistant", "content": "I understand Arjun. Under RBI Zero Liability Policy you will not be liable. A staff agent will process your dispute within 3 business days."}], "escalation_summary": {"recommended_action": "Review transaction, process dispute form, issue provisional credit.", "priority": "P2", "issue_summary": "Unrecognised charge of Rs 3200."}, "kb_sources": ["Transaction Dispute and Fraud Policy"]},
        {"case_id": "CAS-DEMO3", "conversation_id": "demo-3", "member_id": "MBR30091", "member_name": "Neha Iyer",      "intent": "card",          "resolution_status": "resolved",  "sentiment": "neutral",   "sentiment_score": 2, "priority": "P3", "created_at": now, "updated_at": now, "conversation_history": [{"role": "user", "content": "My debit card is blocked after 3 wrong PINs."}, {"role": "assistant", "content": "You can unblock via the HCCU app or website using Aadhaar OTP, or call 1800-123-4567 option 2."}], "escalation_summary": None, "kb_sources": ["Card Block and Unblock Policy"]},
        {"case_id": "CAS-DEMO4", "conversation_id": "demo-4", "member_id": "MBR40563", "member_name": "Ravi Kumar",     "intent": "loan",          "resolution_status": "resolved",  "sentiment": "neutral",   "sentiment_score": 2, "priority": "P3", "created_at": now, "updated_at": now, "conversation_history": [{"role": "user", "content": "I applied for a personal loan 5 days ago, no update."}, {"role": "assistant", "content": "Check status at members.horizoncu.in/loans/status. If no update email loan.grievance@horizoncu.in."}], "escalation_summary": None, "kb_sources": ["Loan Application and Status Policy"]},
        {"case_id": "CAS-DEMO5", "conversation_id": "demo-5", "member_id": "MBR55291", "member_name": "Divya Nair",     "intent": "policy",        "resolution_status": "resolved",  "sentiment": "neutral",   "sentiment_score": 2, "priority": "P3", "created_at": now, "updated_at": now, "conversation_history": [{"role": "user", "content": "What is the penalty for closing my FD early?"}, {"role": "assistant", "content": "1% penalty is deducted from the applicable interest rate for the period held. Your principal is always safe."}], "escalation_summary": None, "kb_sources": ["FD Premature Withdrawal Policy"]},
        {"case_id": "CAS-DEMO6", "conversation_id": "demo-6", "member_id": "MBR67812", "member_name": "Suresh Pillai",  "intent": "account_update","resolution_status": "resolved",  "sentiment": "neutral",   "sentiment_score": 2, "priority": "P3", "created_at": now, "updated_at": now, "conversation_history": [{"role": "user", "content": "I need to update my address. I recently moved."}, {"role": "assistant", "content": "Update online at members.horizoncu.in Profile section using Aadhaar OTP for instant processing."}], "escalation_summary": None, "kb_sources": ["Account Update and KYC Policy"]},
    ]
    for c in demo:
        cases[c["conversation_id"]] = c
    return {"seeded": len(demo), "message": "Demo cases loaded."}

@app.get("/health")
async def health():
    return {"status": "ok", "kb_documents": len(DOCUMENTS), "active_cases": len(cases)}

frontend_dist = Path(__file__).resolve().parent.parent / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")

# ── HELPERS ───────────────────────────────────────────────────────────────────
def _now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()

def _recommend_action(intent: str, score: int) -> str:
    actions = {
        "loan":          "Pull loan application from underwriting queue and update member.",
        "card":          "Verify identity and manually unblock card or issue replacement.",
        "account_update":"Verify KYC documents and process update in core banking system.",
        "dispute":       "Review transaction history, process dispute form, issue provisional credit if over Rs 10000.",
        "policy":        "Provide personalised policy clarification in writing.",
        "complaint":     "Assign dedicated Case Manager, review all prior contacts, initiate refund review.",
        "general":       "Review and respond to member query.",
    }
    base = actions.get(intent, "Review and respond.")
    if score >= 4:
        base = f"URGENT — {base} Member is distressed. Contact within 1 hour."
    return base

# ── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
