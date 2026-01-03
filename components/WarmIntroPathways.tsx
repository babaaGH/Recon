'use client';

import { useState, useEffect } from 'react';

interface LinkedInTarget {
  name: string;
  title: string;
  linkedinUrl: string;
  snippet: string;
}

interface ConferenceAppearance {
  eventName: string;
  date: string;
  role: string; // speaking, keynote, panel
  location?: string;
  url?: string;
}

interface WarmIntroPath {
  targetName: string;
  pathType: 'WARM_INTRO' | 'SECOND_DEGREE' | 'CUSTOMER_OVERLAP' | 'CONFERENCE' | 'BOARD_CONNECTION' | 'COLD';
  description: string;
  mutualConnection?: string;
  notes?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface WarmIntroPathwaysProps {
  companyName: string;
  targets: LinkedInTarget[];
}

export default function WarmIntroPathways({ companyName, targets }: WarmIntroPathwaysProps) {
  const [pathways, setPathways] = useState<Record<string, WarmIntroPath[]>>({});
  const [conferences, setConferences] = useState<Record<string, ConferenceAppearance[]>>({});
  const [loadingConferences, setLoadingConferences] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [customerOverlap, setCustomerOverlap] = useState<Record<string, string>>({});

  // Search for conference appearances
  const searchConferences = async (targetName: string) => {
    setLoadingConferences(true);
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
      setLoadingConferences(false);
    }
  };

  // Open LinkedIn search for 2nd degree connections
  const openLinkedInSearch = (targetName: string) => {
    const query = encodeURIComponent(`2nd degree connections to ${targetName} ${companyName}`);
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${query}`, '_blank');
  };

  // Save manual notes
  const saveNotes = (targetName: string, note: string) => {
    setNotes(prev => ({ ...prev, [targetName]: note }));
    // Here you could also save to localStorage or backend
    localStorage.setItem(`intro-notes-${targetName}`, note);
  };

  // Save customer overlap
  const saveCustomerOverlap = (targetName: string, client: string) => {
    setCustomerOverlap(prev => ({ ...prev, [targetName]: client }));
    localStorage.setItem(`customer-overlap-${targetName}`, client);
  };

  // Load saved data on mount
  useEffect(() => {
    targets.forEach(target => {
      const savedNotes = localStorage.getItem(`intro-notes-${target.name}`);
      const savedOverlap = localStorage.getItem(`customer-overlap-${target.name}`);

      if (savedNotes) {
        setNotes(prev => ({ ...prev, [target.name]: savedNotes }));
      }
      if (savedOverlap) {
        setCustomerOverlap(prev => ({ ...prev, [target.name]: savedOverlap }));
      }
    });
  }, [targets]);

  // Calculate pathway status for each target
  const getPathwayStatus = (targetName: string): { icon: string; color: string; label: string; description: string } => {
    const hasNotes = notes[targetName]?.trim().length > 0;
    const hasCustomer = customerOverlap[targetName]?.trim().length > 0;
    const hasConference = conferences[targetName]?.length > 0;

    if (hasNotes && notes[targetName].toLowerCase().includes('warm')) {
      return { icon: '🟢', color: 'text-[#10b981]', label: 'WARM INTRO AVAILABLE', description: notes[targetName] };
    }
    if (hasNotes || hasCustomer) {
      return { icon: '🟡', color: 'text-[#f59e0b]', label: 'SECOND-DEGREE', description: hasNotes ? notes[targetName] : `Customer overlap: ${customerOverlap[targetName]}` };
    }
    if (hasConference) {
      return { icon: '📍', color: 'text-[#06b6d4]', label: 'UPCOMING EVENT', description: `${conferences[targetName][0].eventName}` };
    }
    return { icon: '🔴', color: 'text-[#ef4444]', label: 'COLD OUTREACH REQUIRED', description: 'No warm path identified yet' };
  };

  if (targets.length === 0) {
    return null;
  }

  return (
    <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
      <div className="bg-[var(--dark-slate)] px-6 py-4">
        <h3 className="text-lg font-medium opacity-90 mb-1">
          🤝 WARM INTRO PATHWAYS
        </h3>
        <p className="text-xs opacity-50">
          Track connection paths and networking opportunities • Warm intros convert 5-10x better
        </p>
      </div>

      <div className="p-6 space-y-6">
        {targets.map((target, index) => {
          const pathway = getPathwayStatus(target.name);

          return (
            <div
              key={index}
              className="border border-[var(--border-slate)] rounded-lg p-4 bg-black bg-opacity-40"
            >
              {/* Target Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-base mb-1">{target.name}</h4>
                  <div className="text-sm opacity-70">{target.title}</div>
                </div>

                {/* Pathway Status Badge */}
                <div className={`${pathway.color} text-xs font-bold uppercase tracking-wide`}>
                  {pathway.icon} {pathway.label}
                </div>
              </div>

              {/* Pathway Description */}
              {pathway.description && (
                <div className="mb-4 text-sm bg-[var(--darker-slate)] rounded p-3">
                  💡 {pathway.description}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* LinkedIn Connection Check */}
                <button
                  onClick={() => openLinkedInSearch(target.name)}
                  className="recon-btn px-4 py-2 rounded text-xs font-bold uppercase tracking-wide text-left flex items-center gap-2"
                >
                  <span>🔗</span>
                  <span>Check My Network</span>
                </button>

                {/* Conference Search */}
                <button
                  onClick={() => searchConferences(target.name)}
                  disabled={loadingConferences}
                  className="recon-btn px-4 py-2 rounded text-xs font-bold uppercase tracking-wide text-left flex items-center gap-2 disabled:opacity-50"
                >
                  <span>📍</span>
                  <span>{loadingConferences ? 'Searching...' : 'Find Conferences'}</span>
                </button>
              </div>

              {/* Conference Results */}
              {conferences[target.name] && conferences[target.name].length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium uppercase tracking-wider opacity-60 mb-2">
                    Upcoming Speaking Engagements
                  </div>
                  <div className="space-y-2">
                    {conferences[target.name].map((conf, idx) => (
                      <div
                        key={idx}
                        className="border border-[#06b6d4] border-opacity-30 rounded p-3 bg-[#06b6d4] bg-opacity-5"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-medium text-sm">📍 {conf.eventName}</div>
                          <div className="text-xs opacity-60">{conf.date}</div>
                        </div>
                        <div className="text-xs opacity-70">
                          {conf.role} {conf.location && `• ${conf.location}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Input Fields */}
              <div className="space-y-3">
                {/* Connection Notes */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider opacity-60 block mb-2">
                    Connection Path / Notes
                  </label>
                  <textarea
                    value={notes[target.name] || ''}
                    onChange={(e) => saveNotes(target.name, e.target.value)}
                    placeholder="e.g., Connected via Sarah Johnson (former colleague at Microsoft)"
                    className="w-full bg-black bg-opacity-40 border border-[var(--border-slate)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#10b981] resize-none"
                    rows={2}
                  />
                </div>

                {/* Customer Overlap */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider opacity-60 block mb-2">
                    Customer Overlap
                  </label>
                  <input
                    type="text"
                    value={customerOverlap[target.name] || ''}
                    onChange={(e) => saveCustomerOverlap(target.name, e.target.value)}
                    placeholder="e.g., Bank of America (potential reference)"
                    className="w-full bg-black bg-opacity-40 border border-[var(--border-slate)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Pro Tip */}
              {pathway.label === 'COLD OUTREACH REQUIRED' && (
                <div className="mt-4 text-xs opacity-60 bg-[var(--darker-slate)] rounded p-3">
                  💡 <strong>Pro Tip:</strong> Check LinkedIn for mutual connections, search for their conference appearances, or identify customer overlap for a warm intro path.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
