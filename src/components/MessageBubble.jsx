import { motion } from 'motion/react';
import { Sparkles, FileText, ChevronDown, AlertCircle, CheckCircle2, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

const STATUS_CONFIG = {
  open: { icon: Clock, color: '#4F7CFF', label: 'Open' },
  resolved: { icon: CheckCircle2, color: '#2ED573', label: 'Resolved' },
  escalated: { icon: AlertCircle, color: '#FFAA2C', label: 'Escalated' },
  needs_info: { icon: Clock, color: '#4F7CFF', label: 'Needs Info' },
};

const SENTIMENT_CONFIG = {
  neutral: { color: '#888', label: 'Neutral' },
  frustrated: { color: '#FFAA2C', label: 'Frustrated' },
  distressed: { color: '#FF4757', label: 'Distressed' },
};

export default function MessageBubble({ message, index, isLastAiMessage, onResolve }) {
  const isUser = message.role === 'user';
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [resolved, setResolved] = useState(null); // 'yes' | 'no' | null

  // Should we show resolution buttons?
  const showResolutionButtons =
    isLastAiMessage &&
    onResolve &&
    message.metadata?.resolutionStatus === 'open' &&
    resolved === null;

  const handleResolve = (isResolved) => {
    setResolved(isResolved ? 'yes' : 'no');
    if (isResolved) {
      onResolve('Yes, that resolved my issue. Thanks!');
    } else {
      onResolve('No, that did not resolve my issue.');
    }
  };

  return (
    <motion.div
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: index === 0 ? 0 : 0.05,
      }}
    >
      {isUser ? (
        /* ── User Message ── */
        <div
          className="max-w-[75%] lg:max-w-[60%] px-4 py-3 rounded-2xl rounded-br-md"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: '#E8E8E8' }}>
            {message.content}
          </p>
          <p className="text-[10px] mt-1.5 text-right" style={{ color: '#444' }}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      ) : (
        /* ── AI Message ── */
        <div className="max-w-[85%] lg:max-w-[70%] flex gap-3">
          {/* Avatar */}
          <div className="shrink-0 mt-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center aura-avatar"
              style={{
                background: 'linear-gradient(135deg, rgba(79,124,255,0.15), rgba(108,92,231,0.15))',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#4F7CFF' }} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-md"
              style={{
                background: message.isError
                  ? 'rgba(255,71,87,0.06)'
                  : 'rgba(255,255,255,0.02)',
                borderLeft: message.isError
                  ? '2px solid rgba(255,71,87,0.3)'
                  : '2px solid rgba(79,124,255,0.15)',
              }}
            >
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: '#E8E8E8' }}>
                {message.content}
              </p>

              {/* ── Resolution Buttons ── */}
              {showResolutionButtons && (
                <motion.div
                  className="flex items-center gap-2 mt-4 pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-[11px] mr-1" style={{ color: '#666' }}>
                    Did this help?
                  </span>
                  <motion.button
                    onClick={() => handleResolve(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                    style={{
                      background: 'rgba(46,213,115,0.08)',
                      color: '#2ED573',
                      border: '1px solid rgba(46,213,115,0.2)',
                    }}
                    whileHover={{
                      background: 'rgba(46,213,115,0.15)',
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Yes, Resolved
                  </motion.button>
                  <motion.button
                    onClick={() => handleResolve(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                    style={{
                      background: 'rgba(255,71,87,0.08)',
                      color: '#FF4757',
                      border: '1px solid rgba(255,71,87,0.2)',
                    }}
                    whileHover={{
                      background: 'rgba(255,71,87,0.15)',
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    No
                  </motion.button>
                </motion.div>
              )}

              {/* Resolved/Denied feedback inline */}
              {resolved && (
                <motion.div
                  className="flex items-center gap-2 mt-3 pt-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {resolved === 'yes' ? (
                    <span className="text-[11px] flex items-center gap-1.5" style={{ color: '#2ED573' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marked as resolved
                    </span>
                  ) : (
                    <span className="text-[11px] flex items-center gap-1.5" style={{ color: '#FF4757' }}>
                      <AlertCircle className="w-3.5 h-3.5" /> Looking into it further...
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Metadata */}
            {message.metadata && message.metadata.resolutionStatus !== 'greeting' && (
              <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
                {/* Status badge */}
                {message.metadata.resolutionStatus && (
                  <StatusBadge status={message.metadata.resolutionStatus} />
                )}

                {/* Sentiment */}
                {message.metadata.sentiment && (
                  <SentimentBadge sentiment={message.metadata.sentiment} />
                )}

                {/* Case ID */}
                {message.metadata.caseId && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#555' }}
                  >
                    Ref: {message.metadata.caseId}
                  </span>
                )}

                {/* KB Sources */}
                {message.metadata.kbSources?.length > 0 && (
                  <div className="w-full mt-1">
                    <button
                      onClick={() => setSourcesExpanded(!sourcesExpanded)}
                      className="flex items-center gap-1.5 text-[10px] cursor-pointer"
                      style={{ color: '#555', background: 'none', border: 'none' }}
                    >
                      <FileText className="w-3 h-3" />
                      {message.metadata.kbSources.length} source{message.metadata.kbSources.length > 1 ? 's' : ''}
                      <ChevronDown
                        className="w-3 h-3 transition-transform duration-200"
                        style={{ transform: sourcesExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
                      />
                    </button>
                    {sourcesExpanded && (
                      <motion.div
                        className="flex flex-wrap gap-1.5 mt-1.5"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        {message.metadata.kbSources.map((src, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-1 rounded-md"
                            style={{
                              background: 'rgba(79,124,255,0.06)',
                              color: '#4F7CFF',
                              border: '1px solid rgba(79,124,255,0.1)',
                            }}
                          >
                            {src}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="text-[10px] mt-1.5 px-1" style={{ color: '#444' }}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.needs_info;
  const Icon = config.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
      style={{
        background: `${config.color}12`,
        color: config.color,
        border: `1px solid ${config.color}20`,
      }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function SentimentBadge({ sentiment }) {
  const config = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full"
      style={{
        background: `${config.color}12`,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
