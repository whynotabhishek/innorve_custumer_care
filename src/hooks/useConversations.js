import { useState, useCallback } from 'react';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const createConversation = useCallback((firstMessage) => {
    const id = Date.now().toString();
    const title = firstMessage.length > 40
      ? firstMessage.substring(0, 40) + '...'
      : firstMessage;

    const newConv = {
      id,
      title,
      createdAt: new Date().toISOString(),
      messages: [],
      conversationHistoryRef: [],
      apiConversationId: null,
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const updateConversation = useCallback((id, updates) => {
    setConversations(prev =>
      prev.map(conv => conv.id === id ? { ...conv, ...updates } : conv)
    );
  }, []);

  const switchConversation = useCallback((id) => {
    setActiveConversationId(id);
  }, []);

  const getActiveConversation = useCallback(() => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const getGroupedConversations = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = { today: [], week: [], older: [] };

    conversations.forEach(conv => {
      const date = new Date(conv.createdAt);
      if (date >= today) groups.today.push(conv);
      else if (date >= weekAgo) groups.week.push(conv);
      else groups.older.push(conv);
    });

    return groups;
  }, [conversations]);

  return {
    conversations,
    activeConversationId,
    createConversation,
    updateConversation,
    switchConversation,
    getActiveConversation,
    getGroupedConversations,
    setActiveConversationId,
  };
}
