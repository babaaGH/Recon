'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  id: number;
  message: string;
  status: 'analyzing' | 'complete' | 'active';
}

const LOG_MESSAGES = [
  '[ANALYZING] SEC EDGAR Filings',
  '[SCANNING] Q3 Earnings Reports',
  '[DETECTING] C-Suite Leadership Changes',
  '[PROCESSING] Financial Statements',
  '[SEARCHING] Recent Press Releases',
  '[EXTRACTING] Risk Factor Disclosures',
  '[MAPPING] Executive Network',
  '[VALIDATING] Headquarters Location',
  '[COMPILING] Intelligence Dossier',
];

export default function IntelligenceLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < LOG_MESSAGES.length) {
      const timeout = setTimeout(() => {
        // Mark previous as complete
        if (currentIndex > 0) {
          setLogs(prev =>
            prev.map((log, idx) =>
              idx === currentIndex - 1 ? { ...log, status: 'complete' } : log
            )
          );
        }

        // Add new active entry
        setTimeout(() => {
          setLogs(prev => [
            ...prev,
            {
              id: currentIndex,
              message: LOG_MESSAGES[currentIndex],
              status: 'active'
            }
          ]);
          setCurrentIndex(currentIndex + 1);
        }, 150);
      }, 400 + Math.random() * 300); // Random delay for realism

      return () => clearTimeout(timeout);
    } else {
      // Mark last one as complete
      const timeout = setTimeout(() => {
        setLogs(prev =>
          prev.map((log, idx) =>
            idx === prev.length - 1 ? { ...log, status: 'complete' } : log
          )
        );
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <div className="border border-[var(--border-slate)] rounded-lg p-8 bg-[var(--dark-slate)] bg-opacity-20">
      <div className="space-y-2 font-mono text-sm">
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              {log.status === 'active' ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-[#4a9eff]"
                >
                  ●
                </motion.span>
              ) : (
                <span className="text-[#10b981]"></span>
              )}
              <TypewriterText
                text={log.message}
                isActive={log.status === 'active'}
                className={log.status === 'complete' ? 'opacity-60' : 'opacity-90'}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {currentIndex >= LOG_MESSAGES.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-[var(--border-slate)] text-center"
          >
            <span className="text-[#10b981]">INTELLIGENCE GATHERING COMPLETE</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface TypewriterTextProps {
  text: string;
  isActive: boolean;
  className?: string;
}

function TypewriterText({ text, isActive, className }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayText(text);
      return;
    }

    if (currentCharIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentCharIndex + 1));
        setCurrentCharIndex(currentCharIndex + 1);
      }, 15 + Math.random() * 25); // Typewriter speed with variation

      return () => clearTimeout(timeout);
    }
  }, [currentCharIndex, text, isActive]);

  return <span className={className}>{displayText}</span>;
}
