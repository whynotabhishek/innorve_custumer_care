const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : '');

export async function sendChatMessage({ message, memberId, memberName, conversationId, conversationHistory }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      member_id: memberId,
      member_name: memberName,
      conversation_id: conversationId || null,
      conversation_history: conversationHistory || [],
    }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getCases() {
  const res = await fetch(`${API_BASE}/api/cases`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/api/analytics`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function seedCases() {
  const res = await fetch(`${API_BASE}/api/cases/seed`, { method: 'POST' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
