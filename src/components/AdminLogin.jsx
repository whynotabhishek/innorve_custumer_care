import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onAuthenticated }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const ADMIN_PASSCODE = 'innorve2026';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      onAuthenticated(true);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#030303' }}>
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, #FF4757 0%, #FFAA2C 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Icon */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,71,87,0.12), rgba(255,170,44,0.12))',
              border: '1px solid rgba(255,71,87,0.15)',
            }}
          >
            <ShieldCheck className="w-7 h-7" style={{ color: '#FF4757' }} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#E8E8E8' }}>
            Staff Access
          </h1>
          <p className="text-xs mt-1.5" style={{ color: '#666' }}>
            CreditAssist AI — Authorized Personnel Only
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${error ? 'rgba(255,71,87,0.3)' : 'rgba(255,255,255,0.06)'}`,
            transition: 'border-color 0.3s ease',
          }}
          animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#888' }}>
              <Lock className="w-3 h-3 inline mr-1.5 mb-0.5" />
              Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(false); }}
              placeholder="Enter staff passcode"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? 'rgba(255,71,87,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: '#E8E8E8',
              }}
              onFocus={(e) => e.target.style.borderColor = error ? 'rgba(255,71,87,0.5)' : 'rgba(79,124,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = error ? 'rgba(255,71,87,0.3)' : 'rgba(255,255,255,0.08)'}
              autoFocus
            />
            {error && (
              <motion.p
                className="text-xs mt-2"
                style={{ color: '#FF4757' }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Invalid passcode. Access denied.
              </motion.p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={!passcode.trim()}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: passcode.trim()
                ? 'linear-gradient(135deg, #FF4757, #FFAA2C)'
                : 'rgba(255,255,255,0.06)',
              color: passcode.trim() ? '#fff' : '#555',
              border: 'none',
            }}
            whileHover={passcode.trim() ? { scale: 1.01 } : {}}
            whileTap={passcode.trim() ? { scale: 0.98 } : {}}
          >
            Authenticate
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
