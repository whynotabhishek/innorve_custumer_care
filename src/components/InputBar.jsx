import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, Paperclip, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : '');

export default function InputBar({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 6 * 24; // 6 rows * ~24px line height
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = useCallback(() => {
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Build audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) {
          console.warn('[VOICE] Audio too short, ignoring');
          return;
        }

        // Send to backend for transcription
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          const res = await fetch(`${API_BASE}/api/transcribe`, {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (data.text) {
            setText(prev => (prev ? prev + ' ' : '') + data.text);
          } else if (data.error) {
            console.error('[VOICE]', data.error);
          }
        } catch (err) {
          console.error('[VOICE] Transcription request failed:', err);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(250); // collect data every 250ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('[VOICE] Microphone access denied:', err);
      alert('Microphone access is required for voice input. Please allow microphone access in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const canSend = text.trim().length > 0 && !isLoading && !isTranscribing;

  return (
    <div className="shrink-0 px-4 pb-4 pt-2 relative z-30 input-bar-glass">
      <div className="max-w-3xl mx-auto">
        {/* Transcribing indicator */}
        <AnimatePresence>
          {isTranscribing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ color: '#8B5CF6', background: 'rgba(139,92,246,0.08)' }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Transcribing your voice...
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="flex items-end gap-2 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isRecording
              ? '1px solid rgba(255,71,87,0.3)'
              : '1px solid rgba(255,255,255,0.06)',
            transition: 'border-color 0.3s ease',
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
            placeholder={isRecording ? 'Listening...' : 'Message CreditAssist AI...'}
            rows={1}
            className="flex-1 bg-transparent outline-none text-[14px] leading-6 py-1 placeholder-[#444]"
            style={{
              color: '#E8E8E8',
              maxHeight: 144, // 6 rows
              overflowY: 'auto',
            }}
            disabled={isLoading || isRecording}
          />

          {/* Recording timer */}
          <AnimatePresence>
            {isRecording && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs font-mono mb-1.5 shrink-0"
                style={{ color: '#FF4757' }}
              >
                {formatTime(recordingTime)}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Mic button */}
          <motion.button
            onClick={toggleRecording}
            disabled={isTranscribing}
            className="shrink-0 p-2 rounded-lg cursor-pointer mb-0.5"
            style={{
              color: isRecording ? '#fff' : isTranscribing ? '#666' : '#555',
              background: isRecording ? 'rgba(255,71,87,0.9)' : 'transparent',
              border: 'none',
            }}
            animate={isRecording ? {
              boxShadow: [
                '0 0 0 0 rgba(255,71,87,0.4)',
                '0 0 0 8px rgba(255,71,87,0)',
              ],
            } : {}}
            transition={isRecording ? {
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
            } : {}}
            onMouseEnter={(e) => {
              if (!isRecording && !isTranscribing) {
                e.currentTarget.style.color = '#888';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRecording && !isTranscribing) {
                e.currentTarget.style.color = '#555';
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Voice input'}
          >
            {isTranscribing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>

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
