import { motion } from 'motion/react';
import { X, Sparkles, User, AlertTriangle } from 'lucide-react';

export default function CaseDetail({ caseData, onClose }) {
  const c = caseData;
  const urgencyColor = c.urgency_tier === 'P1' ? '#FF4757' : c.urgency_tier === 'P2' ? '#FFAA2C' : '#2ED573';
  const statusColor = c.resolution_status === 'escalated' ? '#FFAA2C' : '#2ED573';

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}>

        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#E8E8E8' }}>{c.case_id || 'Case Details'}</h2>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>{c.member_name} · {c.urgency_tier || 'P3'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg cursor-pointer" style={{ color: '#888', background: 'rgba(255,255,255,0.04)', border: 'none' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCard label="Urgency" value={c.urgency_tier || 'P3'} color={urgencyColor} />
            <InfoCard label="Status" value={c.resolution_status || 'pending'} color={statusColor} />
            <InfoCard label="Sentiment" value={`${c.sentiment_score || 0}/5`} color="#4F7CFF" />
            <InfoCard label="Intent" value={c.intent || 'N/A'} color="#888" />
          </div>

          {c.escalation_summary && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,170,44,0.04)', border: '1px solid rgba(255,170,44,0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: '#FFAA2C' }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFAA2C' }}>Escalation Summary</h3>
              </div>
              {c.escalation_summary.reason && <p className="text-xs mb-2" style={{ color: '#888' }}>{c.escalation_summary.reason}</p>}
              {c.escalation_summary.recommended_action && <p className="text-xs" style={{ color: '#E8E8E8' }}>Action: {c.escalation_summary.recommended_action}</p>}
            </div>
          )}

          {c.conversation_history?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#555' }}>Conversation History</h3>
              <div className="space-y-3">
                {c.conversation_history.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'user' && (
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(79,124,255,0.1)' }}>
                        <Sparkles className="w-3 h-3" style={{ color: '#4F7CFF' }} />
                      </div>
                    )}
                    <div className="max-w-[80%] px-3 py-2 rounded-xl text-xs" style={{
                      background: msg.role === 'user' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                      borderLeft: msg.role !== 'user' ? '2px solid rgba(79,124,255,0.15)' : 'none', color: '#ccc'
                    }}>{msg.content}</div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <User className="w-3 h-3" style={{ color: '#888' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#555' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color }}>{value}</p>
    </div>
  );
}
