import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Shield } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin({
        name: name.trim(),
        memberId: memberId.trim() || `MBR${Date.now().toString().slice(-5)}`,
      });
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #4F7CFF 0%, #6C5CE7 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 aura-avatar"
            style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.15), rgba(108,92,231,0.15))' }}
          >
            <Sparkles className="w-8 h-8" style={{ color: '#4F7CFF' }} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#E8E8E8' }}>
            CreditAssist AI
          </h1>
          <p className="text-sm mt-2" style={{ color: '#888' }}>
            Your intelligent credit union assistant
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 glass-strong"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="mb-6">
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#888' }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#E8E8E8',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(79,124,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              autoFocus
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#888' }}>
              Member ID <span className="font-normal opacity-60">(optional)</span>
            </label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="e.g. MBR12345"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#E8E8E8',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(79,124,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, #4F7CFF, #6C5CE7)'
                : 'rgba(255,255,255,0.06)',
              color: name.trim() ? '#fff' : '#555',
              border: 'none',
            }}
            whileHover={name.trim() ? { scale: 1.01 } : {}}
            whileTap={name.trim() ? { scale: 0.98 } : {}}
          >
            Start Chatting
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield className="w-3.5 h-3.5" style={{ color: '#555' }} />
            <span className="text-xs" style={{ color: '#555' }}>End-to-end encrypted</span>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
