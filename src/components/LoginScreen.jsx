import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Shield, User, ShieldCheck } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('customer');
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const ADMIN_PASSCODE = 'innorve2026';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'staff') {
      if (passcode.trim() === ADMIN_PASSCODE) {
        onLogin({ role: 'staff', name: 'Staff', memberId: 'STAFF' });
      } else {
        setError('Invalid staff passcode.');
      }
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    onLogin({
      role: 'customer',
      name: name.trim(),
      memberId: memberId.trim() || `MBR${Date.now().toString().slice(-5)}`,
    });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
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
        <motion.div
          className="text-center mb-8"
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
            Continue as customer or staff with the secure login option.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl p-8 glass-strong"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="flex gap-3 justify-center mb-8">
            <button
              type="button"
              onClick={() => { setMode('customer'); setError(''); }}
              className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{
                background: mode === 'customer' ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: mode === 'customer' ? '#4F7CFF' : '#AAA',
                border: mode === 'customer' ? '1px solid rgba(79,124,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <User className="w-4 h-4 inline mr-2" /> Customer
            </button>
            <button
              type="button"
              onClick={() => { setMode('staff'); setError(''); }}
              className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{
                background: mode === 'staff' ? 'rgba(255,71,87,0.12)' : 'rgba(255,255,255,0.04)',
                color: mode === 'staff' ? '#FF6B81' : '#AAA',
                border: mode === 'staff' ? '1px solid rgba(255,71,87,0.2)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <ShieldCheck className="w-4 h-4 inline mr-2" /> Staff
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'customer' ? (
              <>
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
              </>
            ) : (
              <div className="mb-8">
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#888' }}>
                  Staff Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter staff passcode"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#E8E8E8',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,124,100,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  autoFocus
                />
              </div>
            )}

            {error && (
              <div className="mb-4 text-sm text-red-400">{error}</div>
            )}

            <motion.button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #4F7CFF, #6C5CE7)',
                color: '#fff',
                border: 'none',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {mode === 'staff' ? 'Enter Staff Dashboard' : 'Start Chatting'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield className="w-3.5 h-3.5" style={{ color: '#555' }} />
            <span className="text-xs" style={{ color: '#555' }}>Staff access protected by passcode</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
