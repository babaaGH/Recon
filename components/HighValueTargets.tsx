'use client';

import { useEffect, useState } from 'react';
import PersonDetailDrawer from './PersonDetailDrawer';

interface LinkedInTarget {
  name: string;
  title: string;
  linkedinUrl: string;
  snippet: string;
  location: string;
  connection: string;
}

interface ConferenceAppearance {
  eventName: string;
  date: string;
  role: string;
  location?: string;
  url?: string;
}

interface HighValueTargetsProps {
  companyName: string;
  targets?: LinkedInTarget[];
  loading?: boolean;
}

// Categorize contact by title
function categorizeContact(title: string): 'C-Suite' | 'Head' | 'VP/SVP' | 'Director' | 'Other' {
  const titleLower = title.toLowerCase();

  // C-Suite: CEO, CFO, CTO, COO, CIO, CISO, CMO, CPO, etc.
  if (titleLower.match(/\b(ceo|cfo|cto|coo|cio|ciso|cmo|cpo|chief|president|founder)\b/)) {
    return 'C-Suite';
  }

  // Head: Head of X, Global Head, etc.
  if (titleLower.match(/\bhead\b/)) {
    return 'Head';
  }

  // VP/SVP: Vice President, Senior Vice President, EVP
  if (titleLower.match(/\b(vp|vice president|svp|evp)\b/)) {
    return 'VP/SVP';
  }

  // Director: Director, Senior Director
  if (titleLower.match(/\bdirector\b/)) {
    return 'Director';
  }

  return 'Other';
}

export default function HighValueTargets({ companyName, targets: propTargets, loading: propLoading }: HighValueTargetsProps) {
  const [internalTargets, setInternalTargets] = useState<LinkedInTarget[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<LinkedInTarget | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingConferences, setLoadingConferences] = useState<Record<string, boolean>>({});
  const [conferences, setConferences] = useState<Record<string, ConferenceAppearance[]>>({});

  // Use prop targets if provided, otherwise fetch internally
  const targets = propTargets !== undefined ? propTargets : internalTargets;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  useEffect(() => {
    // If targets are provided via props, skip fetching
    if (propTargets !== undefined) {
      return;
    }

    let cancelled = false;

    const loadTargets = async () => {
      if (cancelled) return;

      setInternalLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/targets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company: companyName }),
        });

        if (cancelled) return;

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load targets');
          setInternalTargets([]);
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setInternalTargets(data.targets || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load targets');
          setInternalTargets([]);
        }
      } finally {
        if (!cancelled) {
          setInternalLoading(false);
        }
      }
    };

    loadTargets();

    return () => {
      cancelled = true;
    };
  }, [companyName, propTargets]);

  // Search for conference appearances
  const searchConferences = async (targetName: string) => {
    setLoadingConferences(prev => ({ ...prev, [targetName]: true }));

    try {
      const response = await fetch('/api/conference-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetName }),
      });

      if (response.ok) {
        const data = await response.json();
        setConferences(prev => ({ ...prev, [targetName]: data.conferences || [] }));
      }
    } catch (error) {
      console.error('Error searching conferences:', error);
    } finally {
      setLoadingConferences(prev => ({ ...prev, [targetName]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="label-caps opacity-60">[ GATHERING CONTACTS... ]</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="label-caps opacity-60">MANUAL SEARCH REQUIRED</div>
        <div className="font-ui text-xs opacity-40 mt-2">{error}</div>
      </div>
    );
  }

  if (targets.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="label-caps opacity-60">MANUAL SEARCH REQUIRED</div>
        <div className="font-ui text-xs opacity-40 mt-2">No executive profiles found</div>
      </div>
    );
  }

  // Calculate counts by category
  const counts = {
    total: targets.length,
    cSuite: targets.filter(t => categorizeContact(t.title) === 'C-Suite').length,
    head: targets.filter(t => categorizeContact(t.title) === 'Head').length,
    vpSvp: targets.filter(t => categorizeContact(t.title) === 'VP/SVP').length,
    director: targets.filter(t => categorizeContact(t.title) === 'Director').length,
  };

  return (
    <>
      {/* Collapsed Vertical Summary Card */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-[var(--border-primary)] rounded-lg p-6 bg-black bg-opacity-40 hover:border-[#007AFF] transition-all cursor-pointer"
      >
        {/* Key Contacts - Top */}
        <div className="text-center mb-6">
          <div className="label-caps opacity-60 mb-2">Key Contacts</div>
          <div className="font-mono-data text-4xl text-[var(--text-primary)]" style={{ letterSpacing: '0.02em' }}>
            {counts.total}
          </div>
        </div>

        {/* Vertical Role List */}
        <div className="space-y-3">
          {counts.cSuite > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-[#333333]">
              <span className="font-ui text-sm text-[var(--text-secondary)]">C-Suite</span>
              <span className="font-mono-data text-lg text-[#007AFF]" style={{ letterSpacing: '0.02em' }}>
                {counts.cSuite}
              </span>
            </div>
          )}

          {counts.head > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-[#333333]">
              <span className="font-ui text-sm text-[var(--text-secondary)]">Head</span>
              <span className="font-mono-data text-lg text-[#10b981]" style={{ letterSpacing: '0.02em' }}>
                {counts.head}
              </span>
            </div>
          )}

          {counts.vpSvp > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-[#333333]">
              <span className="font-ui text-sm text-[var(--text-secondary)]">VP/SVP</span>
              <span className="font-mono-data text-lg text-[#fb923c]" style={{ letterSpacing: '0.02em' }}>
                {counts.vpSvp}
              </span>
            </div>
          )}

          {counts.director > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-[#333333] last:border-b-0">
              <span className="font-ui text-sm text-[var(--text-secondary)]">Director</span>
              <span className="font-mono-data text-lg text-[#6366f1]" style={{ letterSpacing: '0.02em' }}>
                {counts.director}
              </span>
            </div>
          )}
        </div>

        {/* Expand Indicator */}
        <div className="text-center mt-4 text-[#007AFF] text-sm font-ui">
          Click to expand →
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-8"
          style={{ backdropFilter: 'blur(10px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal Container */}
          <div
            className="bg-[#000000] border border-[#333333] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[#333333] p-6 flex items-center justify-between">
              <div>
                <h3 className="font-ui text-xl font-semibold text-[var(--text-primary)]">
                  Key Contacts
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  <span className="font-mono-data" style={{ letterSpacing: '0.02em' }}>{counts.total}</span> total contacts
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Vertical Card Stack */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-4">
              {targets.map((target, index) => (
                <div
                  key={index}
                  className="border border-[#333333] rounded-lg p-5 hover:border-[#007AFF] hover:bg-[#007AFF] hover:bg-opacity-5 cursor-pointer transition-all"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPerson(target);
                    setIsDrawerOpen(true);
                  }}
                >
                  {/* Name & Designation */}
                  <div className="mb-4">
                    <a
                      href={target.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-ui font-semibold text-lg text-[var(--text-primary)] hover:text-[#007AFF] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {target.name}
                    </a>
                    <div className="font-ui text-sm text-[#888888] mt-1">
                      {target.title}
                    </div>
                  </div>

                  {/* Connection & Interaction Row */}
                  <div className="flex items-center gap-4">
                    {/* Connection Badge */}
                    <div>
                      <div className="label-caps opacity-60 mb-1">Connection</div>
                      <span className="inline-block px-3 py-1 rounded bg-[#007AFF] text-[#000000] font-ui font-bold text-xs">
                        {target.connection}
                      </span>
                    </div>

                    {/* Interaction Button */}
                    <div className="flex-1">
                      <div className="label-caps opacity-60 mb-1">Interaction</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          searchConferences(target.name);
                        }}
                        disabled={loadingConferences[target.name]}
                        className="px-4 py-1 rounded border border-[#007AFF] bg-[#007AFF] bg-opacity-10 text-[#007AFF] font-ui font-bold text-xs uppercase hover:bg-opacity-20 transition-all disabled:opacity-50"
                      >
                        {loadingConferences[target.name] ? 'Searching...' : 'Find Events'}
                      </button>
                    </div>
                  </div>

                  {/* Conference Results */}
                  {conferences[target.name] && conferences[target.name].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#333333] space-y-2">
                      <div className="label-caps opacity-60">Recent Events</div>
                      {conferences[target.name].slice(0, 2).map((conf, idx) => (
                        <div
                          key={idx}
                          className="text-sm font-ui text-[#10b981] flex items-center gap-2"
                        >
                          <span></span>
                          <span>{conf.eventName}</span>
                          <span className="font-mono-data text-xs text-[var(--text-secondary)]" style={{ letterSpacing: '0.02em' }}>
                            • {conf.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Person Detail Drawer */}
      <PersonDetailDrawer
        person={selectedPerson}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPerson(null);
        }}
      />
    </>
  );
}
