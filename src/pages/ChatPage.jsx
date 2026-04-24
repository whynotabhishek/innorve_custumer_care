import { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatFeed from '../components/ChatFeed';
import InputBar from '../components/InputBar';
import { useChat } from '../hooks/useChat';

export default function ChatPage({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [conversationStates, setConversationStates] = useState({});

  const { messages, isLoading, sendMessage, clearChat, conversationId, conversationHistoryRef, setMessages, setConversationId } = useChat(
    user.memberId,
    user.name
  );

  // Save current conversation state before switching
  const saveCurrentState = useCallback(() => {
    if (activeConvId) {
      setConversationStates(prev => ({
        ...prev,
        [activeConvId]: {
          messages: [...messages],
          conversationId,
          conversationHistory: [...conversationHistoryRef.current],
        },
      }));
    }
  }, [activeConvId, messages, conversationId, conversationHistoryRef]);

  // Handle sending a message
  const handleSend = useCallback((text) => {
    // If no active conversation, create one
    if (!activeConvId) {
      const newId = Date.now().toString();
      const title = text.length > 40 ? text.substring(0, 40) + '...' : text;
      setConversations(prev => [{
        id: newId,
        title,
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setActiveConvId(newId);
    }

    sendMessage(text);
  }, [activeConvId, sendMessage]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    saveCurrentState();
    clearChat();
    setActiveConvId(null);
  }, [saveCurrentState, clearChat]);

  // Handle switching conversation
  const handleSwitchConversation = useCallback((id) => {
    saveCurrentState();

    const state = conversationStates[id];
    if (state) {
      setMessages(state.messages);
      setConversationId(state.conversationId);
      conversationHistoryRef.current = state.conversationHistory || [];
    } else {
      clearChat();
    }

    setActiveConvId(id);
  }, [saveCurrentState, conversationStates, setMessages, setConversationId, conversationHistoryRef, clearChat]);

  // Handle quick action from welcome screen
  const handleQuickAction = useCallback((text) => {
    handleSend(text);
  }, [handleSend]);

  return (
    <div className="h-screen flex" style={{ background: '#030303' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
        conversations={conversations}
        activeId={activeConvId}
        onSelect={handleSwitchConversation}
        onNewChat={handleNewChat}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header sidebarOpen={sidebarOpen} />
        <ChatFeed
          messages={messages}
          isLoading={isLoading}
          onQuickAction={handleQuickAction}
          onResolve={handleSend}
        />
        <InputBar onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
