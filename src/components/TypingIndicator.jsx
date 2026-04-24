import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <motion.div
      className="flex items-start gap-3 mb-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 aura-avatar"
        style={{
          background: 'linear-gradient(135deg, rgba(79,124,255,0.15), rgba(108,92,231,0.15))',
        }}
      >
        <Sparkles className="w-4 h-4" style={{ color: '#4F7CFF' }} />
      </div>

      {/* Typing dots */}
      <div
        className="px-4 py-3.5 rounded-2xl rounded-tl-md flex items-center gap-1.5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderLeft: '2px solid rgba(79,124,255,0.15)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: 7,
              height: 7,
              background: 'linear-gradient(135deg, #4F7CFF, #6C5CE7)',
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
