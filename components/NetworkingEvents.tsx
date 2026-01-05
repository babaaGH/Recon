'use client';

import { useState, useEffect } from 'react';

interface Event {
  name: string;
  type: 'Conference' | 'Trade Show' | 'Roundtable' | 'Sponsorship' | 'Speaking' | 'Webinar';
  date: string;
  location: string;
  role: 'Sponsor' | 'Attendee' | 'Speaker' | 'Exhibitor' | 'Host';
  description?: string;
}

interface NetworkingEventsProps {
  companyName: string;
}

export default function NetworkingEvents({ companyName }: NetworkingEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/networking-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Error fetching networking events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [companyName]);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Conference': return '#3b82f6'; // Blue
      case 'Trade Show': return '#8b5cf6'; // Purple
      case 'Roundtable': return '#ec4899'; // Pink
      case 'Sponsorship': return '#f59e0b'; // Orange
      case 'Speaking': return '#10b981'; // Green
      case 'Webinar': return '#06b6d4'; // Cyan
      default: return '#6b7280'; // Gray
    }
  };

  const getTypeBadge = (type: string) => {
    const color = getTypeColor(type);
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-bold uppercase"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {type}
      </span>
    );
  };

  const conferenceCount = events.filter(e => e.type === 'Conference').length;
  const sponsorshipCount = events.filter(e => e.type === 'Sponsorship').length;
  const speakingCount = events.filter(e => e.type === 'Speaking').length;

  if (loading) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40">
        <div className="label-caps opacity-60 mb-2">Networking & Events</div>
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
            <div className="label-caps opacity-60 mb-1">Networking & Events</div>
            <div className="font-mono-data text-3xl text-white" style={{ letterSpacing: '0.02em' }}>
              {events.length}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Upcoming Events
            </div>
          </div>

          {/* Middle: Breakdown by Type */}
          <div className="flex-1">
            <div className="label-caps opacity-60 mb-2">By Type</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Conferences</span>
                <span className="font-mono font-semibold text-white">{conferenceCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Sponsorships</span>
                <span className="font-mono font-semibold text-white">{sponsorshipCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Speaking</span>
                <span className="font-mono font-semibold text-white">{speakingCount}</span>
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
                  Networking & Events
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  {companyName} • {events.length} Upcoming Events
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
                      Conferences
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {conferenceCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Sponsorships
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {sponsorshipCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Speaking
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {speakingCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Total
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {events.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Events List */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Upcoming Events ({events.length})
                </h4>

                {events.length > 0 ? (
                  <div className="space-y-3">
                    {events.map((event, index) => (
                      <div
                        key={index}
                        className="border border-[#333] rounded-lg p-5 hover:border-[#007AFF] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Event Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h5 className="text-lg font-bold text-white">{event.name}</h5>
                              {getTypeBadge(event.type)}
                              <span
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{
                                  backgroundColor: event.role === 'Sponsor' ? '#f59e0b20' : event.role === 'Speaker' ? '#10b98120' : '#3b82f620',
                                  color: event.role === 'Sponsor' ? '#f59e0b' : event.role === 'Speaker' ? '#10b981' : '#3b82f6'
                                }}
                              >
                                {event.role}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Date:</span>
                                <span className="text-white font-semibold">{event.date}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Location:</span>
                                <span className="text-white">{event.location}</span>
                              </div>

                              {event.description && (
                                <div className="flex items-start gap-2 text-sm mt-3">
                                  <span className="text-gray-500">Details:</span>
                                  <span className="text-gray-300">{event.description}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Action Button */}
                          <button
                            className="px-4 py-2 bg-[#007AFF] text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-[#0055CC] transition-all flex-shrink-0"
                            style={{ backgroundColor: '#007AFF', color: '#FFFFFF' }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No upcoming events
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
