import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageSquare, PanelLeftClose, PanelLeft, User } from 'lucide-react';

export default function Sidebar({ isOpen, onToggle, conversations, activeId, onSelect, onNewChat, user }) {
  const grouped = groupConversations(conversations);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            className="fixed lg:relative z-50 h-full flex flex-col"
            style={{
              width: 280,
              background: 'rgba(8,8,8,0.9)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Top section */}
            <div className="p-3 flex flex-col gap-2">
              {/* Toggle + New Chat */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{ color: '#888' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
                <button
                  onClick={onNewChat}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    color: '#E8E8E8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {conversations.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#888' }} />
                  <p className="text-xs" style={{ color: '#555' }}>No conversations yet</p>
                </div>
              ) : (
                <>
                  {grouped.today.length > 0 && (
                    <ConversationGroup label="Today" items={grouped.today} activeId={activeId} onSelect={onSelect} />
                  )}
                  {grouped.week.length > 0 && (
                    <ConversationGroup label="Previous 7 Days" items={grouped.week} activeId={activeId} onSelect={onSelect} />
                  )}
                  {grouped.older.length > 0 && (
                    <ConversationGroup label="Older" items={grouped.older} activeId={activeId} onSelect={onSelect} />
                  )}
                </>
              )}
            </div>

            {/* Bottom section */}
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

              {/* User profile */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #4F7CFF, #6C5CE7)',
                    color: '#fff',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#E8E8E8' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#555' }}>
                    {user?.memberId || 'MBR00000'}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed toggle button */}
      {!isOpen && (
        <motion.button
          className="fixed top-3 left-3 z-50 p-2 rounded-lg cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: '#888',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onClick={onToggle}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <PanelLeft className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
}

function ConversationGroup({ label, items, activeId, onSelect }) {
  return (
    <div className="mb-3">
      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: '#555' }}>
        {label}
      </p>
      {items.map((conv) => (
        <motion.button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors duration-100 cursor-pointer truncate"
          style={{
            color: conv.id === activeId ? '#E8E8E8' : '#888',
            background: conv.id === activeId ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            if (conv.id !== activeId) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
          onMouseLeave={(e) => {
            if (conv.id !== activeId) e.currentTarget.style.background = 'transparent';
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
            <span className="truncate">{conv.title}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function groupConversations(conversations) {
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
}
