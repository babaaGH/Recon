'use client';

import { useEffect, useState } from 'react';

interface NewsArticle {
  headline: string;
  source: string;
  date: string;
  relevanceScore: number;
  summary: string;
  url?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface NewsSentimentProps {
  companyName: string;
  articles?: NewsArticle[];
}

export default function NewsSentiment({ companyName, articles }: NewsSentimentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample default articles if none provided
  const defaultArticles: NewsArticle[] = [
    {
      headline: 'Company announces record Q4 earnings, beats analyst expectations',
      source: 'Financial Times',
      date: '2025-01-02',
      relevanceScore: 95,
      summary: 'Strong quarterly performance driven by digital transformation initiatives and cost optimization measures.',
      sentiment: 'positive',
      url: '#',
    },
    {
      headline: 'New partnership with major cloud provider announced',
      source: 'TechCrunch',
      date: '2024-12-28',
      relevanceScore: 88,
      summary: 'Strategic partnership aims to accelerate enterprise cloud adoption and expand market reach.',
      sentiment: 'positive',
      url: '#',
    },
    {
      headline: 'Industry analysts highlight cybersecurity concerns',
      source: 'Bloomberg',
      date: '2024-12-20',
      relevanceScore: 72,
      summary: 'Report indicates need for enhanced security measures amid increasing digital infrastructure complexity.',
      sentiment: 'negative',
      url: '#',
    },
    {
      headline: 'CFO discusses long-term growth strategy in investor call',
      source: 'Reuters',
      date: '2024-12-15',
      relevanceScore: 65,
      summary: 'Leadership outlines 3-year roadmap focusing on innovation, operational efficiency, and market expansion.',
      sentiment: 'neutral',
      url: '#',
    },
    {
      headline: 'Company expands operations to three new markets',
      source: 'Wall Street Journal',
      date: '2024-12-10',
      relevanceScore: 82,
      summary: 'Geographic expansion strategy targets emerging markets with high growth potential.',
      sentiment: 'positive',
      url: '#',
    },
  ];

  const displayArticles = articles || defaultArticles;

  // Calculate overall sentiment (weighted by relevance)
  const calculateSentiment = () => {
    let totalScore = 0;
    let totalWeight = 0;

    displayArticles.forEach((article) => {
      let sentimentValue = 0;
      if (article.sentiment === 'positive') sentimentValue = 1;
      if (article.sentiment === 'negative') sentimentValue = -1;

      totalScore += sentimentValue * article.relevanceScore;
      totalWeight += article.relevanceScore;
    });

    // Return -100 to +100 scale
    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  };

  const sentimentScore = calculateSentiment();
  const sentimentLabel =
    sentimentScore > 30 ? 'Positive' : sentimentScore < -30 ? 'Negative' : 'Neutral';
  const sentimentColor =
    sentimentScore > 30 ? '#10b981' : sentimentScore < -30 ? '#ef4444' : '#888888';

  // Get 24h articles
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  const recentArticles = displayArticles.filter(
    (article) => new Date(article.date) >= twentyFourHoursAgo
  );

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Get sentiment badge color
  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10b981';
      case 'negative':
        return '#ef4444';
      default:
        return '#888888';
    }
  };

  return (
    <>
      {/* Collapsed Summary */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40 hover:border-[#007AFF] transition-all cursor-pointer"
      >
        <div className="space-y-4">
          {/* Sentiment Meter */}
          <div>
            <div className="label-caps opacity-60 mb-2">Overall Sentiment</div>

            {/* Horizontal Bar with Needle */}
            <div className="relative">
              {/* Background Bar */}
              <div className="h-2 rounded-full bg-gradient-to-r from-[#ef4444] via-[#888888] to-[#10b981] opacity-30"></div>

              {/* Needle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 -mt-2 transition-all"
                style={{
                  backgroundColor: sentimentColor,
                  left: `${((sentimentScore + 100) / 200) * 100}%`,
                  boxShadow: `0 0 10px ${sentimentColor}`,
                }}
              ></div>
            </div>

            {/* Sentiment Label */}
            <div className="mt-3 flex items-center gap-3">
              <span
                className="inline-block px-3 py-1 rounded text-xs font-ui font-bold"
                style={{
                  backgroundColor: `${sentimentColor}20`,
                  color: sentimentColor,
                }}
              >
                {sentimentLabel}
              </span>
              <div className="font-mono-data text-sm text-[var(--text-secondary)]" style={{ letterSpacing: '0.02em' }}>
                Score: {sentimentScore.toFixed(0)}
              </div>
            </div>
          </div>

          {/* 24h Article Count */}
          <div className="flex items-center justify-between pt-2 border-t border-[#333333]">
            <div className="label-caps opacity-60">24h Articles</div>
            <div className="font-mono-data text-xl text-[#007AFF]">
              {recentArticles.length}
            </div>
          </div>
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
            className="bg-[#000000] border border-[#333333] rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[#333333] p-6 flex items-center justify-between">
              <div>
                <h3 className="font-ui text-xl font-semibold text-[#E0E0E0]">
                  News & Sentiment Analysis
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  {displayArticles.length} articles analyzed • Overall sentiment: {sentimentLabel}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[#E0E0E0] text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - News Feed */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <div className="space-y-4">
                {displayArticles
                  .sort((a, b) => b.relevanceScore - a.relevanceScore)
                  .map((article, index) => (
                    <div
                      key={index}
                      className="border border-[#333333] rounded-lg p-5 hover:border-[#007AFF] hover:bg-[#007AFF] hover:bg-opacity-5 transition-all cursor-pointer"
                      onClick={() => {
                        if (article.url) {
                          window.open(article.url, '_blank');
                        }
                      }}
                    >
                      {/* Header: Source, Date, Sentiment */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="font-ui text-xs text-[var(--text-secondary)]">
                          {article.source}
                        </div>
                        <div className="font-mono-data text-xs text-[var(--text-secondary)]" style={{ letterSpacing: '0.02em' }}>
                          {new Date(article.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-ui font-bold ml-auto"
                          style={{
                            backgroundColor: `${getSentimentBadgeColor(article.sentiment)}20`,
                            color: getSentimentBadgeColor(article.sentiment),
                          }}
                        >
                          {article.sentiment}
                        </span>
                      </div>

                      {/* Headline */}
                      <h4 className="font-ui font-semibold text-base text-[#E0E0E0] mb-2 leading-snug">
                        {article.headline}
                      </h4>

                      {/* Summary */}
                      <p className="font-ui text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                        {article.summary}
                      </p>

                      {/* Relevance Score */}
                      <div className="flex items-center gap-3">
                        <div className="label-caps opacity-60">Relevance</div>
                        <div className="flex-1 max-w-xs">
                          <div className="relative h-1.5 bg-[#333333] rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-[#007AFF] transition-all"
                              style={{ width: `${article.relevanceScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <div
                          className="font-mono-data text-sm text-[#007AFF]"
                          style={{ letterSpacing: '0.02em' }}
                        >
                          {article.relevanceScore}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
