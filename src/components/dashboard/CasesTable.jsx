import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Clock, ChevronRight, Loader2 } from 'lucide-react';

const URGENCY_CONFIG = {
  P1: { color: '#FF4757', bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.2)', label: 'P1 — Critical' },
  P2: { color: '#FFAA2C', bg: 'rgba(255,170,44,0.1)', border: 'rgba(255,170,44,0.2)', label: 'P2 — High' },
  P3: { color: '#2ED573', bg: 'rgba(46,213,115,0.1)', border: 'rgba(46,213,115,0.2)', label: 'P3 — Normal' },
};

const STATUS_ICONS = {
  resolved: CheckCircle2,
  escalated: AlertTriangle,
  needs_info: Clock,
};

export default function CasesTable({ cases, loading, onSelectCase }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#4F7CFF' }} />
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Clock className="w-10 h-10 mb-3 opacity-20" style={{ color: '#888' }} />
        <p className="text-sm" style={{ color: '#555' }}>No cases found</p>
        <p className="text-xs mt-1" style={{ color: '#444' }}>Click "Seed Demo Data" to populate sample cases</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: '#E8E8E8' }}>
        Active Cases
        <span className="ml-2 text-xs font-normal" style={{ color: '#555' }}>({cases.length})</span>
      </h2>

      <div className="flex flex-col gap-2">
        {cases.map((c, i) => {
          const urgency = URGENCY_CONFIG[c.urgency_tier] || URGENCY_CONFIG.P3;
          const StatusIcon = STATUS_ICONS[c.resolution_status] || Clock;

          return (
            <motion.button
              key={c.case_id || c._id || i}
              onClick={() => onSelectCase(c)}
              className="w-full text-left p-4 rounded-xl cursor-pointer transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              whileHover={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Urgency badge */}
                  <span
                    className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md"
                    style={{
                      background: urgency.bg,
                      color: urgency.color,
                      border: `1px solid ${urgency.border}`,
                    }}
                  >
                    {c.urgency_tier || 'P3'}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: '#E8E8E8' }}>
                        {c.case_id || c._id || `Case ${i + 1}`}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                        background: c.resolution_status === 'escalated' ? 'rgba(255,170,44,0.1)' : 'rgba(46,213,115,0.1)',
                        color: c.resolution_status === 'escalated' ? '#FFAA2C' : '#2ED573',
                      }}>
                        {c.resolution_status || 'pending'}
                      </span>
                    </div>
                    <p className="text-xs mt-1 truncate" style={{ color: '#666' }}>
                      {c.member_name || 'Unknown Member'}
                      {c.intent && <span style={{ color: '#555' }}> · {c.intent}</span>}
                    </p>
                  </div>
                </div>

                {/* Sentiment */}
                <div className="flex items-center gap-3 shrink-0">
                  {c.sentiment_score && (
                    <div className="flex items-center gap-1">
                      <SentimentBar score={c.sentiment_score} />
                      <span className="text-[10px]" style={{ color: '#555' }}>{c.sentiment_score}/5</span>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4" style={{ color: '#444' }} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SentimentBar({ score }) {
  const maxBars = 5;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxBars }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-3 rounded-sm"
          style={{
            background: i < score
              ? score <= 2 ? '#FF4757' : score <= 3 ? '#FFAA2C' : '#2ED573'
              : 'rgba(255,255,255,0.06)',
          }}
        />
      ))}
    </div>
  );
}
