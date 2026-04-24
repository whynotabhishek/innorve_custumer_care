import { motion } from 'motion/react';
import { TrendingUp, Users, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';

export default function AnalyticsPanel({ analytics, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#4F7CFF' }} />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BarChart3 className="w-10 h-10 mb-3 opacity-20" style={{ color: '#888' }} />
        <p className="text-sm" style={{ color: '#555' }}>No analytics available</p>
      </div>
    );
  }

  // Backend returns: total_cases, resolved, escalated, escalation_rate_pct, top_intents, sentiment_breakdown, high_priority_cases
  const escalationRate = analytics.escalation_rate_pct ?? (analytics.escalation_rate ? (analytics.escalation_rate * 100) : 0);

  const stats = [
    { label: 'Total Cases', value: analytics.total_cases || 0, icon: Users, color: '#4F7CFF' },
    { label: 'Escalation Rate', value: `${escalationRate.toFixed ? escalationRate.toFixed(0) : escalationRate}%`, icon: AlertTriangle, color: '#FFAA2C' },
    { label: 'High Priority', value: analytics.high_priority_cases || 0, icon: TrendingUp, color: '#FF4757' },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold mb-4" style={{ color: '#E8E8E8' }}>Analytics Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={i} className="p-4 rounded-xl flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}12` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#555' }}>{stat.label}</p>
              <p className="text-xl font-semibold" style={{ color: '#E8E8E8' }}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Intents */}
      {analytics.top_intents && analytics.top_intents.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#555' }}>Top Intents</h3>
          <div className="space-y-2">
            {analytics.top_intents.map((intent, i) => {
              const maxCount = Math.max(...analytics.top_intents.map(t => t.count || 0), 1);
              const pct = ((intent.count || 0) / maxCount) * 100;
              return (
                <motion.div key={i} className="p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: '#aaa' }}>{intent.intent || intent.name}</span>
                    <span className="text-xs font-medium" style={{ color: '#4F7CFF' }}>{intent.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #4F7CFF, #6C5CE7)' }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
