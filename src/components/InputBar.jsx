import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Send, Mic, Paperclip } from 'lucide-react';

export default function InputBar({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 6 * 24; // 6 rows * ~24px line height
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  }, [text]);

  const handleSend = useCallback(() => {
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, isLoading, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
    // UI-only: visual toggle for mic recording state
  };

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <div className="shrink-0 px-4 pb-4 pt-2 relative z-30 input-bar-glass">
      <div className="max-w-3xl mx-auto">
        <div
          className="flex items-end gap-2 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Paperclip (upload) */}
          <button
            className="shrink-0 p-2 rounded-lg transition-colors duration-150 cursor-pointer mb-0.5"
            style={{ color: '#555', background: 'transparent', border: 'none' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#888';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#555';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Attach document"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message CreditAssist AI..."
            rows={1}
            className="flex-1 bg-transparent outline-none text-[14px] leading-6 py-1 placeholder-[#444]"
            style={{
              color: '#E8E8E8',
              maxHeight: 144, // 6 rows
              overflowY: 'auto',
            }}
            disabled={isLoading}
          />

          {/* Mic button */}
          <button
            onClick={toggleRecording}
            className={`shrink-0 p-2 rounded-lg transition-all duration-200 cursor-pointer mb-0.5 ${isRecording ? 'recording-btn' : ''}`}
            style={{
              color: isRecording ? '#FF4757' : '#555',
              background: isRecording ? 'rgba(255,71,87,0.1)' : 'transparent',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isRecording) {
                e.currentTarget.style.color = '#888';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRecording) {
                e.currentTarget.style.color = '#555';
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            className="shrink-0 p-2 rounded-xl transition-all duration-200 cursor-pointer mb-0.5"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #4F7CFF, #6C5CE7)'
                : 'rgba(255,255,255,0.04)',
              color: canSend ? '#fff' : '#444',
              border: 'none',
            }}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <p className="text-center text-[10px] mt-2" style={{ color: '#444' }}>
          CreditAssist AI can make mistakes. Please verify important financial information.
        </p>
      </div>
    </div>
  );
}
