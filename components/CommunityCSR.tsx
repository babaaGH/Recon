'use client';

import { useState, useEffect } from 'react';

interface CSRInitiative {
  title: string;
  category: 'Environment' | 'Education' | 'Diversity' | 'Community' | 'Philanthropy' | 'Social Impact';
  description: string;
  impact: string;
  launchedDate: string;
  status: 'Active' | 'Completed' | 'Ongoing';
}

interface CommunityCSRProps {
  companyName: string;
}

export default function CommunityCSR({ companyName }: CommunityCSRProps) {
  const [initiatives, setInitiatives] = useState<CSRInitiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCSRData = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/community-csr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (response.ok) {
          const data = await response.json();
          setInitiatives(data.initiatives || []);
        }
      } catch (err) {
        console.error('Error fetching CSR data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCSRData();
  }, [companyName]);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Environment': return '#10b981'; // Green
      case 'Education': return '#3b82f6'; // Blue
      case 'Diversity': return '#ec4899'; // Pink
      case 'Community': return '#f59e0b'; // Orange
      case 'Philanthropy': return '#8b5cf6'; // Purple
      case 'Social Impact': return '#06b6d4'; // Cyan
      default: return '#6b7280'; // Gray
    }
  };

  const getCategoryBadge = (category: string) => {
    const color = getCategoryColor(category);
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-bold uppercase"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {category}
      </span>
    );
  };

  const environmentCount = initiatives.filter(i => i.category === 'Environment').length;
  const diversityCount = initiatives.filter(i => i.category === 'Diversity').length;
  const communityCount = initiatives.filter(i => i.category === 'Community').length;

  if (loading) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40">
        <div className="label-caps opacity-60 mb-2">Community & CSR</div>
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
            <div className="label-caps opacity-60 mb-1">Community & CSR</div>
            <div className="font-mono-data text-3xl text-white" style={{ letterSpacing: '0.02em' }}>
              {initiatives.length}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Active Initiatives
            </div>
          </div>

          {/* Middle: Breakdown by Category */}
          <div className="flex-1">
            <div className="label-caps opacity-60 mb-2">Focus Areas</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Environment</span>
                <span className="font-mono font-semibold text-white">{environmentCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Diversity</span>
                <span className="font-mono font-semibold text-white">{diversityCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Community</span>
                <span className="font-mono font-semibold text-white">{communityCount}</span>
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
                  Community & CSR Initiatives
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  {companyName} • {initiatives.length} Active Programs
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
                      Environment
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {environmentCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Diversity
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {diversityCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Community
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {communityCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Total
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {initiatives.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Initiatives List */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  CSR Initiatives ({initiatives.length})
                </h4>

                {initiatives.length > 0 ? (
                  <div className="space-y-3">
                    {initiatives.map((initiative, index) => (
                      <div
                        key={index}
                        className="border border-[#333] rounded-lg p-5 hover:border-[#007AFF] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Initiative Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h5 className="text-lg font-bold text-white">{initiative.title}</h5>
                              {getCategoryBadge(initiative.category)}
                              <span
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{
                                  backgroundColor: initiative.status === 'Active' ? '#10b98120' : initiative.status === 'Ongoing' ? '#3b82f620' : '#6b728020',
                                  color: initiative.status === 'Active' ? '#10b981' : initiative.status === 'Ongoing' ? '#3b82f6' : '#6b7280'
                                }}
                              >
                                {initiative.status}
                              </span>
                            </div>

                            <p className="text-sm text-gray-300 leading-relaxed mb-3">
                              {initiative.description}
                            </p>

                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-gray-500 flex-shrink-0">Impact:</span>
                                <span className="text-[#10b981] font-semibold">{initiative.impact}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Launched:</span>
                                <span className="text-white">{initiative.launchedDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Action Button */}
                          <button
                            className="px-4 py-2 bg-[#007AFF] text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-[#0055CC] transition-all flex-shrink-0"
                            style={{ backgroundColor: '#007AFF', color: '#FFFFFF' }}
                          >
                            Learn More
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No CSR initiatives found
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
