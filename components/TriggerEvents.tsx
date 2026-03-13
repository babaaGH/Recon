'use client';

import { useState, useEffect } from 'react';

interface TriggerEvent {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  daysAgo: string;
}

interface TriggerEventsProps {
  companyName: string;
}

export default function TriggerEvents({ companyName }: TriggerEventsProps) {
  const [events, setEvents] = useState<TriggerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTriggerEvents = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/trigger-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (!response.ok) {
          setLoading(false);
          setEvents([]);
          return;
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching trigger events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTriggerEvents();
  }, [companyName]);

  if (loading) {
    return (
      <div className="border border-[#222222] rounded-lg p-6 bg-[#111111] animate-pulse">
        <div className="h-4 bg-[#222222] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
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
        <div className="text-sm font-semibold uppercase tracking-wider text-[#888888]">Trigger Events</div>
        <div className="text-6xl font-bold text-[#30D158]">{events.length}</div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-xs text-[#888888]">No recent signals found</div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <a
              key={index}
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-[#222222] rounded-lg p-3 hover:bg-[#1A1A1A] hover:border-[#30D158] transition-all group"
            >
              <div className="flex items-start gap-2">
                <div className="text-[#30D158] text-lg flex-shrink-0">🟢</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-[#E5E5E5] mb-1 leading-snug line-clamp-2 group-hover:text-[#30D158]">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#888888]">
                    <span className="truncate">{event.source}</span>
                    <span>•</span>
                    <span className="flex-shrink-0">{event.daysAgo}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-[#888888] mt-4 text-right">
        Updated 3 mins ago
      </div>
    </div>
  );
}
