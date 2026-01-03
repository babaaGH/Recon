'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LinkedInTarget {
  name: string;
  title: string;
  linkedinUrl: string;
  snippet: string;
  location: string;
  connection: string;
}

interface PersonDetailDrawerProps {
  person: LinkedInTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CareerSummary {
  summary: string;
  recentMentions: Array<{
    date: string;
    source: string;
    snippet: string;
  }>;
  keyAchievements: string[];
}

export default function PersonDetailDrawer({ person, isOpen, onClose }: PersonDetailDrawerProps) {
  const [careerData, setCareerData] = useState<CareerSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && person) {
      setLoading(true);

      // Simulate AI-generated career summary
      setTimeout(() => {
        setCareerData({
          summary: `${person.name} is a seasoned executive with extensive experience in ${person.title.includes('CTO') || person.title.includes('CIO') ? 'technology leadership and digital transformation' : person.title.includes('CFO') ? 'financial strategy and corporate governance' : 'strategic leadership and business operations'}. Known for driving innovation and leading high-performing teams across ${person.location.split(',')[0]} and beyond.`,
          recentMentions: [
            {
              date: '2024-12-15',
              source: 'TechCrunch',
              snippet: `Speaking at the Cloud Summit 2024, discussing the future of AI in enterprise...`
            },
            {
              date: '2024-11-28',
              source: 'LinkedIn',
              snippet: `Shared insights on digital transformation strategies in financial services...`
            },
            {
              date: '2024-10-10',
              source: 'Industry Report',
              snippet: `Named as one of the top innovators in the ${person.title.includes('Tech') ? 'technology' : 'financial'} sector...`
            }
          ],
          keyAchievements: [
            '15+ years of executive leadership experience',
            'Led digital transformation initiatives at Fortune 500 companies',
            'Speaker at major industry conferences',
            'Published thought leader on LinkedIn (50K+ followers)'
          ]
        });
        setLoading(false);
      }, 800);
    }
  }, [isOpen, person]);

  return (
    <AnimatePresence>
      {isOpen && person && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-[var(--bg-primary)] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{person.name}</h2>
                  <p className="text-sm text-[#9ca3af] mb-1">{person.title}</p>
                  <p className="text-xs text-[#6b7280]">{person.location}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-2xl opacity-60 hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              {/* LinkedIn Link */}
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded bg-[#0077b5] text-white text-sm font-medium hover:bg-[#006399] transition-colors"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                View LinkedIn Profile
              </a>

              {loading ? (
                <div className="text-center py-12">
                  <div className="text-sm opacity-60">[ ANALYZING PROFILE... ]</div>
                </div>
              ) : careerData ? (
                <>
                  {/* AI Career Summary */}
                  <div className="mb-6 border border-white/10 rounded-lg p-4 bg-[var(--dark-slate)] bg-opacity-20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-60">AI Career Summary</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-[#4a9eff] bg-opacity-10 text-[#4a9eff]">Generated</span>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">{careerData.summary}</p>
                  </div>

                  {/* Key Achievements */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-3">Key Achievements</h3>
                    <div className="space-y-2">
                      {careerData.keyAchievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-[#10b981] mt-1">✓</span>
                          <span className="text-sm opacity-80">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Public Mentions */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-3">Recent Public Mentions</h3>
                    <div className="space-y-3">
                      {careerData.recentMentions.map((mention, idx) => (
                        <div
                          key={idx}
                          className="border border-white/10 rounded-lg p-4 bg-black bg-opacity-40"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#4a9eff]">{mention.source}</span>
                            <span className="text-xs opacity-60">{mention.date}</span>
                          </div>
                          <p className="text-sm opacity-80 leading-relaxed">{mention.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Suggestions */}
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-3">Engagement Suggestions</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm opacity-80">
                        <span>📧</span>
                        <span>Personalized email referencing recent conference talk</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm opacity-80">
                        <span>💼</span>
                        <span>LinkedIn connection request with mutual interest mention</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm opacity-80">
                        <span>🎯</span>
                        <span>Schedule meeting around upcoming industry event</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
