import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

export default function Header({ sidebarOpen }) {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="relative z-30 flex items-center justify-between px-4 h-14 shrink-0"
      style={{
        background: 'rgba(3,3,3,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-3" style={{ marginLeft: sidebarOpen ? 0 : 40 }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.15), rgba(108,92,231,0.15))' }}
        >
          <Sparkles className="w-4.5 h-4.5" style={{ color: '#4F7CFF' }} />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight" style={{ color: '#E8E8E8' }}>
            CreditAssist AI
          </h1>
          <p className="text-[10px] leading-tight" style={{ color: '#555' }}>
            Intelligent Member Support
          </p>
        </div>
      </div>

      {/* Right: Language selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer"
          style={{
            color: '#888',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language.native}</span>
          <ChevronDown className="w-3 h-3" style={{
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }} />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden py-1 min-w-[160px]"
              style={{
                background: 'rgba(26,26,26,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors duration-100 cursor-pointer"
                  style={{
                    color: lang.code === language.code ? '#E8E8E8' : '#888',
                    background: lang.code === language.code ? 'rgba(79,124,255,0.1)' : 'transparent',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (lang.code !== language.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (lang.code !== language.code) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{lang.label}</span>
                  <span style={{ color: '#555' }}>{lang.native}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
