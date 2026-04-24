import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CreditCard, ShieldAlert, Landmark, HelpCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import HeroGeometric from './ui/shape-landing-hero';
import GlowCard from './ui/spotlight-card';

const QUICK_ACTIONS = [
  {
    icon: CreditCard,
    label: 'Dispute Transaction',
    description: 'Report unauthorized charges or raise a transaction dispute securely.',
    prompt: 'I want to dispute an unauthorized transaction on my account.',
    glowColor: 'rgba(79, 124, 255, 0.35)',
    iconColor: '#4F7CFF',
  },
  {
    icon: ShieldAlert,
    label: 'Check Loan Status',
    description: 'Get instant updates on your pending loan application status.',
    prompt: 'What is the status of my loan application?',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    iconColor: '#a855f7',
  },
  {
    icon: Landmark,
    label: 'Account & KYC',
    description: 'Update your address, phone number, or complete KYC verification.',
    prompt: 'I need to update my account details and KYC information.',
    glowColor: 'rgba(255, 170, 44, 0.35)',
    iconColor: '#FFAA2C',
  },
  {
    icon: HelpCircle,
    label: 'FD & Savings',
    description: 'Explore fixed deposit rates, savings options, and interest policies.',
    prompt: 'Tell me about your current FD interest rates and savings account options.',
    glowColor: 'rgba(46, 213, 115, 0.35)',
    iconColor: '#2ED573',
  },
];

export default function ChatFeed({ messages, isLoading, onQuickAction, onResolve }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      style={{ background: isEmpty ? '#030303' : 'transparent' }}
    >
      {isEmpty ? (
        /* ── Cinematic Welcome Screen ── */
        <div className="relative min-h-full flex flex-col">
          {/* Hero Background with Geometric Shapes */}
          <HeroGeometric
            badge="CreditAssist AI"
            title1="Intelligent Member Support"
            title2="Instant Resolution"
          />

          {/* Quick Action Glow Cards — floating over the hero */}
          <div
            className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6"
            style={{ marginTop: '-80px' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {QUICK_ACTIONS.map((action, i) => (
                <GlowCard
                  key={i}
                  glowColor={action.glowColor}
                  onClick={() => onQuickAction(action.prompt)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + i * 0.12, duration: 0.5 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${action.iconColor}12`,
                        border: `1px solid ${action.iconColor}20`,
                      }}
                    >
                      <action.icon
                        className="w-5 h-5"
                        style={{ color: action.iconColor }}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: '#E8E8E8' }}
                    >
                      {action.label}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: '#666' }}
                    >
                      {action.description}
                    </p>
                  </motion.div>
                </GlowCard>
              ))}
            </motion.div>

            {/* Subtle hint below cards */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="text-center text-[11px] mt-8 pb-8"
              style={{ color: '#444' }}
            >
              Click a card above or type your question below to get started
            </motion.p>
          </div>
        </div>
      ) : (
        /* ── Message List ── */
        <div className="max-w-3xl mx-auto py-6 px-4 lg:px-0">
          {messages.map((msg, index) => {
            const isLastAiMessage =
              msg.role === 'assistant' &&
              !msg.isError &&
              index === messages.length - 1;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={index}
                isLastAiMessage={isLastAiMessage}
                onResolve={onResolve}
              />
            );
          })}

          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
