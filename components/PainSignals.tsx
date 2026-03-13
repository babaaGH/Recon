'use client';

import { useState, useEffect } from 'react';

interface PainSignal {
  title: string;
  link: string;
  source: string;
  daysAgo: string;
}

interface PainSignalsProps {
  companyName: string;
}

export default function PainSignals({ companyName }: PainSignalsProps) {
  const [signals, setSignals] = useState<PainSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPainSignals = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/pain-signals', {
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
        console.error('Error fetching pain signals:', error);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPainSignals();
  }, [companyName]);

  if (loading) {
    return (
      <div className="border border-[#222222] rounded-lg p-6 bg-[#111111] animate-pulse">
        <div className="h-4 bg-[#222222] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[#222222] rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#222222] rounded-lg p-6 bg-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-[#888888]">Pain Signals</div>
        <div className="text-6xl font-bold text-[#FF453A]">{signals.length}</div>
      </div>

      {/* Signals List */}
      {signals.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-xs text-[#888888]">No recent signals found</div>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((signal, index) => (
            <a
              key={index}
              href={signal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-[#222222] rounded-lg p-3 hover:bg-[#1A1A1A] hover:border-[#FF453A] transition-all group"
            >
              <div className="flex items-start gap-2">
                <div className="text-[#FF453A] text-lg flex-shrink-0">⚠️</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-[#E5E5E5] mb-1 leading-snug line-clamp-2 group-hover:text-[#FF453A]">
                    {signal.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#888888]">
                    <span className="truncate">{signal.source}</span>
                    <span>•</span>
                    <span className="flex-shrink-0">{signal.daysAgo}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-[#888888] mt-4 text-right">
        Updated 5 mins ago
      </div>
    </div>
  );
}
