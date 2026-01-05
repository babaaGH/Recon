'use client';

import { useState, useEffect } from 'react';

interface LeadershipHire {
  name: string;
  title: string;
  level: 'C-Suite' | 'SVP' | 'VP' | 'Head';
  department: string;
  joinedDate: string;
  previousCompany?: string;
  linkedinUrl?: string;
}

interface LeadershipChangesProps {
  companyName: string;
}

export default function LeadershipChanges({ companyName }: LeadershipChangesProps) {
  const [hires, setHires] = useState<LeadershipHire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLeadershipChanges = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/leadership-changes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (response.ok) {
          const data = await response.json();
          setHires(data.hires || []);
        }
      } catch (err) {
        console.error('Error fetching leadership changes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadershipChanges();
  }, [companyName]);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'C-Suite': return '#ef4444'; // Red
      case 'SVP': return '#f59e0b'; // Orange
      case 'VP': return '#3b82f6'; // Blue
      case 'Head': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const getLevelBadge = (level: string) => {
    const color = getLevelColor(level);
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-bold uppercase"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {level}
      </span>
    );
  };

  const cSuiteCount = hires.filter(h => h.level === 'C-Suite').length;
  const svpCount = hires.filter(h => h.level === 'SVP').length;
  const vpCount = hires.filter(h => h.level === 'VP').length;

  if (loading) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40">
        <div className="label-caps opacity-60 mb-2">Leadership Changes</div>
        <div className="text-sm opacity-60">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Collapsed Summary - Clickable */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40 hover:border-[#007AFF] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Count & Label */}
          <div>
            <div className="label-caps opacity-60 mb-1">Leadership Changes</div>
            <div className="font-mono-data text-3xl text-white" style={{ letterSpacing: '0.02em' }}>
              {hires.length}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Recent Senior Hires
            </div>
          </div>

          {/* Middle: Breakdown by Level */}
          <div className="flex-1">
            <div className="label-caps opacity-60 mb-2">By Level</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">C-Suite</span>
                <span className="font-mono font-semibold text-white">{cSuiteCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">SVP/VP</span>
                <span className="font-mono font-semibold text-white">{svpCount + vpCount}</span>
              </div>
            </div>
          </div>

          {/* Right: Expand Icon */}
          <div className="text-[#007AFF] text-xl">→</div>
        </div>
      </div>

      {/* Modal Overlay - Detailed View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-8"
          style={{ backdropFilter: 'blur(10px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal Container */}
          <div
            className="bg-[#000000] border border-[#333333] rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[#333333] p-6 flex items-center justify-between">
              <div>
                <h3 className="font-ui text-xl font-semibold text-[#E0E0E0]">
                  Leadership Changes
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  {companyName} • {hires.length} Recent Senior Hires
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[#E0E0E0] text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary Stats */}
              <div className="p-6 border-b border-[#333]">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      C-Suite
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {cSuiteCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      SVP
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {svpCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      VP
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {vpCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Total
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {hires.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leadership Hires List */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Recent Hires ({hires.length})
                </h4>

                {hires.length > 0 ? (
                  <div className="space-y-3">
                    {hires.map((hire, index) => (
                      <div
                        key={index}
                        className="border border-[#333] rounded-lg p-5 hover:border-[#007AFF] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Person Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h5 className="text-lg font-bold text-white">{hire.name}</h5>
                              {getLevelBadge(hire.level)}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Title:</span>
                                <span className="text-white font-semibold">{hire.title}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Department:</span>
                                <span className="text-white">{hire.department}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Joined:</span>
                                <span className="text-[#10b981] font-semibold">{hire.joinedDate}</span>
                              </div>

                              {hire.previousCompany && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">Previously:</span>
                                  <span className="text-gray-300">{hire.previousCompany}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Action Button */}
                          {hire.linkedinUrl && (
                            <a
                              href={hire.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-[#007AFF] text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-[#0055CC] transition-all flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                              style={{ backgroundColor: '#007AFF', color: '#FFFFFF' }}
                            >
                              View Profile
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No recent leadership changes
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
