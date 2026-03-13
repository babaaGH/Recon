'use client';

import { useState, useEffect } from 'react';

interface HiringSignal {
  title: string;
  link: string;
  source: string;
  daysAgo: string;
}

interface HiringIntelligenceProps {
  companyName: string;
}

export default function HiringIntelligence({ companyName }: HiringIntelligenceProps) {
  const [signals, setSignals] = useState<HiringSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHiringSignals = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/hiring-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (!response.ok) {
          setLoading(false);
          setSignals([]);
          return;
        }

        const data = await response.json();
        setSignals(data.signals || []);
      } catch (error) {
        console.error('Error fetching hiring signals:', error);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHiringSignals();
  }, [companyName]);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) {
    return (
      <div className="border border-[#222222] rounded-lg p-6 bg-[#111111] animate-pulse">
        <div className="h-4 bg-[#222222] rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-[#222222] rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-[#222222] rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <>
      {/* Collapsed Summary - Clickable */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-[#222222] rounded-lg p-6 bg-[#111111] hover:bg-[#1A1A1A] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Count & Status */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-[#888888] mb-1">Hiring Signals</div>
            <div className="text-6xl font-bold text-[#E5E5E5] flex items-center">
              {signals.length}
              {signals.length > 0 && <span className="ml-2 text-[#30D158]">↑</span>}
            </div>
            <div className="mt-2 text-xs text-[#888888]">
              {signals.length === 0 ? 'No recent signals' : 'News mentions'}
            </div>
            <div className="text-xs text-[#888888] mt-1">
              Updated 2 mins ago
            </div>
          </div>

          {/* Right: Expand Icon */}
          <div className="text-[#007AFF] text-xl">→</div>
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
            className="bg-[#000000] border border-[#222222] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[#222222] p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#E5E5E5]">
                  Hiring Intelligence
                </h3>
                <p className="text-sm text-[#888888] mt-2">
                  Latest hiring and recruiting news signals
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#888888] hover:text-[#E5E5E5] text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - News Signals */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              {signals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-sm text-[#888888] mb-2">No recent signals found</div>
                  <p className="text-xs text-[#888888]">
                    No hiring or recruiting news found for {companyName}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {signals.map((signal, index) => (
                    <a
                      key={index}
                      href={signal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-[#222222] rounded-lg p-4 hover:bg-[#1A1A1A] hover:border-[#007AFF] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-[#30D158] text-xl flex-shrink-0 mt-1">📊</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#E5E5E5] mb-2 leading-relaxed">
                            {signal.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[#888888]">
                            <span>{signal.source}</span>
                            <span>•</span>
                            <span>{signal.daysAgo}</span>
                          </div>
                        </div>
                        <div className="text-[#007AFF] text-sm flex-shrink-0">↗</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
