import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../lib/api';

export function useChat(memberId, memberName) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // Use ref to always have the latest conversation_history without stale closures
  const conversationHistoryRef = useRef([]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // 1. Append user message to display
    setMessages(prev => [...prev, userMessage]);

    // 2. Build the conversation_history payload BEFORE the API call
    //    This includes all previous turns + the new user turn
    const historyForRequest = [
      ...conversationHistoryRef.current,
      { role: 'user', content: text.trim() },
    ];

    setIsLoading(true);

    try {
      const data = await sendChatMessage({
        message: text.trim(),
        memberId,
        memberName,
        conversationId,
        conversationHistory: historyForRequest,
      });

      // Backend returns: answer, status, intent, sentiment, sentiment_score,
      //                  kb_sources, case_id, conversation_id, escalation_summary
      const aiResponse = data.answer || data.response || 'I apologize, I could not process your request.';
      const resStatus = data.status || data.resolution_status || 'resolved';

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        metadata: {
          resolutionStatus: resStatus,
          sentiment: data.sentiment,
          kbSources: data.kb_sources || [],
          caseId: data.case_id,
          intent: data.intent,
          sentimentScore: data.sentiment_score,
        },
      };

      // 3. Append AI message to display
      setMessages(prev => [...prev, aiMessage]);

      // 4. Update conversation_id from response (for multi-turn)
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // 5. Explicitly append BOTH turns to conversation_history ref
      //    This ensures the next request has the full history
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: 'user', content: text.trim() },
        { role: 'assistant', content: aiResponse },
      ];

    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [memberId, memberName, conversationId, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    conversationHistoryRef.current = [];
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    clearChat,
    setMessages,
    setConversationId,
    conversationHistoryRef,
  };
}
