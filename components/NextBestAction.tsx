'use client';

import { useState, useEffect } from 'react';

interface NextBestActionProps {
  companyName: string;
}

export default function NextBestAction({ companyName }: NextBestActionProps) {
  const [recommendation, setRecommendation] = useState<string>('');
  const [conversationStarter, setConversationStarter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      fetchRecommendation();
    }
  }, [companyName, expanded]);

  const fetchRecommendation = async () => {
    setLoading(true);
    setError('');
    setApiKeyMissing(false);

    try {
      // Fetch all signals in parallel
      const [newsRes, leadershipRes, hiringRes] = await Promise.all([
        fetch('/api/strategic-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName })
        }).catch(() => null),
        fetch('/api/leadership-changes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName })
        }).catch(() => null),
        fetch('/api/hiring-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName })
        }).catch(() => null)
      ]);

      // Parse responses
      const newsData = newsRes && newsRes.ok ? await newsRes.json() : { news: [] };
      const leadershipData = leadershipRes && leadershipRes.ok ? await leadershipRes.json() : { hires: [] };
      const hiringData = hiringRes && hiringRes.ok ? await hiringRes.json() : {};

      // Call Next Best Action API with collected signals
      const response = await fetch('/api/next-best-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          recentNews: newsData.news || [],
          leadershipChanges: leadershipData.hires || [],
          hiringActivity: {
            engineering: hiringData.engineering || 0,
            sales: hiringData.sales || 0,
            marketing: hiringData.marketing || 0,
            total: hiringData.total || 0
          }
        })
      });

      const data = await response.json();

      if (response.status === 503) {
        // API key not configured
        setApiKeyMissing(true);
        setError(data.message || 'Configure API key to enable Next Best Action');
      } else if (!response.ok) {
        setError(data.message || 'Unable to generate recommendation');
      } else {
        setRecommendation(data.recommendation);
        setConversationStarter(data.conversationStarter);
      }
    } catch (err) {
      console.error('Error fetching next best action:', err);
      setError('Unable to generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
      {/* Collapsed View */}
      <div
        className="p-6 cursor-pointer hover:bg-[#1A1A1A] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#E5E5E5]">
              Next Best Action
            </h3>
            <div className="text-xs text-[#888888] mt-1">
              Generated 1 min ago
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <div className="w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {!expanded && (
          <div className="space-y-2">
            {apiKeyMissing ? (
              <div className="text-amber-500 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Configure API key to enable</span>
              </div>
            ) : error ? (
              <div className="text-gray-500 text-sm">{error}</div>
            ) : recommendation ? (
              <div className="text-gray-300 text-sm line-clamp-2">{recommendation}</div>
            ) : (
              <div className="text-gray-500 text-sm">Click to generate AI-powered sales recommendation</div>
            )}
          </div>
        )}
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="border-t border-[#333] p-6 bg-white bg-opacity-[0.02]">
          {apiKeyMissing ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-20 rounded-lg">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-amber-500 font-semibold mb-1">API Key Required</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Configure your Anthropic API key in <code className="bg-black bg-opacity-40 px-1 rounded">.env</code> to enable AI-powered sales recommendations.
                  </p>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#007AFF] hover:underline"
                  >
                    Get your API key
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500 mb-2">{error}</div>
              <button
                onClick={fetchRecommendation}
                className="text-[#007AFF] hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-400 text-sm">Analyzing company signals...</div>
            </div>
          ) : recommendation ? (
            <div className="space-y-6">
              {/* Recommended Action */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recommended Action</h4>
                </div>
                <p className="text-[#111111] text-sm leading-relaxed">{recommendation}</p>
              </div>

              {/* Conversation Starter */}
              {conversationStarter && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-[#007AFF] rounded-full"></div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversation Starter</h4>
                  </div>
                  <div className="bg-[#007AFF] bg-opacity-10 border border-[#007AFF] border-opacity-20 rounded-lg p-4">
                    <p className="text-[#FFFFFF] text-sm leading-relaxed italic">
                      "{conversationStarter}"
                    </p>
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <div className="pt-4 border-t border-[#333]">
                <button
                  onClick={fetchRecommendation}
                  disabled={loading}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate new recommendation
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
