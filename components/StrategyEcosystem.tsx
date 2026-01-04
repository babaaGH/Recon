'use client';

import { useState, useEffect } from 'react';

interface Executive {
  name: string;
  title: string;
  linkedinUrl: string;
}

interface NewsItem {
  title: string;
  date: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface StrategyEcosystemProps {
  companyName: string;
  executives?: Executive[];
}

export default function StrategyEcosystem({ companyName, executives = [] }: StrategyEcosystemProps) {
  const [sentiment, setSentiment] = useState<number>(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch sentiment
      try {
        const sentimentRes = await fetch('/api/news-sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (sentimentRes.ok) {
          const data = await sentimentRes.json();
          setSentiment(data.overallSentiment || 0);
        }
      } catch (err) {
        console.error('Error fetching sentiment:', err);
      }

      // Fetch strategic news
      try {
        const newsRes = await fetch('/api/strategic-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (newsRes.ok) {
          const data = await newsRes.json();
          setNews(data.news || []);
        }
      } catch (err) {
        console.error('Error fetching strategic news:', err);
      }

      setLoading(false);
    };

    fetchData();
  }, [companyName]);

  // Calculate sentiment color
  const getSentimentColor = (value: number) => {
    if (value > 30) return { color: '#10b981', label: 'Positive' };
    if (value < -30) return { color: '#ef4444', label: 'Negative' };
    return { color: '#f59e0b', label: 'Neutral' };
  };

  const sentimentInfo = getSentimentColor(sentiment);

  // Calculate slider position (0-100%)
  const sliderPosition = ((sentiment + 100) / 200) * 100;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Overall Sentiment - TOP */}
      <div className="bg-black border border-[#333] rounded-lg p-6 mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Overall Sentiment</h3>

        {/* Sentiment Score */}
        <div className="text-center mb-4">
          <div className="text-4xl font-bold" style={{ color: sentimentInfo.color }}>
            {sentiment > 0 ? '+' : ''}{sentiment}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{sentimentInfo.label}</div>
        </div>

        {/* Gradient Slider */}
        <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-[#ef4444] via-[#f59e0b] to-[#10b981]">
          {/* Indicator */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
      </div>

      {/* Executive Profiles - High-Density Table */}
      <div className="bg-black border border-[#333] rounded-lg flex-1 flex flex-col overflow-hidden mb-4">
        <div className="p-4 border-b border-[#333]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Executive Profiles</h3>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#007AFF20 transparent' }}>
          {executives.length > 0 ? (
            <div className="divide-y divide-[#333]">
              {executives.map((exec, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-white hover:bg-opacity-5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#007AFF] truncate">{exec.name}</div>
                    <div className="text-xs text-gray-500 truncate">{exec.title}</div>
                  </div>
                  <a
                    href={exec.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 px-3 py-1.5 bg-[#007AFF] bg-opacity-10 text-[#007AFF] text-xs font-bold uppercase tracking-wide rounded hover:bg-opacity-20 transition-all"
                  >
                    Connect
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No executive data
            </div>
          )}
        </div>
      </div>

      {/* Strategic News - Bottom */}
      <div className="bg-black border border-[#333] rounded-lg flex flex-col overflow-hidden" style={{ maxHeight: '280px' }}>
        <div className="p-4 border-b border-[#333]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Strategic Events</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#007AFF20 transparent' }}>
          {news.length > 0 ? (
            news.map((item, index) => (
              <div key={index} className="border-l-2 border-[#007AFF] pl-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white leading-tight mb-1">{item.title}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-[#007AFF]">{item.category}</span>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      item.impact === 'HIGH'
                        ? 'bg-[#10b981] bg-opacity-20 text-[#10b981]'
                        : item.impact === 'MEDIUM'
                        ? 'bg-[#f59e0b] bg-opacity-20 text-[#f59e0b]'
                        : 'bg-gray-500 bg-opacity-20 text-gray-400'
                    }`}
                  >
                    {item.impact}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No strategic events</div>
          )}
        </div>
      </div>
    </div>
  );
}
