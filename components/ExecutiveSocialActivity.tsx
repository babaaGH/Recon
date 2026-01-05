'use client';

import { useState, useEffect } from 'react';

interface SocialPost {
  executiveName: string;
  title: string;
  platform: 'LinkedIn' | 'Twitter' | 'Blog' | 'Medium' | 'Article';
  postType: 'Thought Leadership' | 'Company News' | 'Industry Insight' | 'Product Update' | 'Personal';
  content: string;
  postedDate: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  url?: string;
}

interface ExecutiveSocialActivityProps {
  companyName: string;
}

export default function ExecutiveSocialActivity({ companyName }: ExecutiveSocialActivityProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSocialActivity = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/executive-social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Error fetching executive social activity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialActivity();
  }, [companyName]);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LinkedIn': return '#0077B5';
      case 'Twitter': return '#1DA1F2';
      case 'Blog': return '#FF6B6B';
      case 'Medium': return '#00AB6C';
      case 'Article': return '#F59E0B';
      default: return '#6b7280';
    }
  };

  const getPlatformBadge = (platform: string) => {
    const color = getPlatformColor(platform);
    return (
      <span
        className="px-2 py-0.5 rounded text-xs font-bold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {platform}
      </span>
    );
  };

  const thoughtLeadershipCount = posts.filter(p => p.postType === 'Thought Leadership').length;
  const industryInsightCount = posts.filter(p => p.postType === 'Industry Insight').length;
  const totalEngagement = posts.reduce((sum, post) => sum + post.engagement.likes + post.engagement.comments + post.engagement.shares, 0);

  if (loading) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40">
        <div className="label-caps opacity-60 mb-2">Executive Social Activity</div>
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
            <div className="label-caps opacity-60 mb-1">Executive Activity</div>
            <div className="font-mono-data text-3xl text-white" style={{ letterSpacing: '0.02em' }}>
              {posts.length}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Recent Posts
            </div>
          </div>

          {/* Middle: Breakdown */}
          <div className="flex-1">
            <div className="label-caps opacity-60 mb-2">Content Type</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Thought Leadership</span>
                <span className="font-mono font-semibold text-white">{thoughtLeadershipCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Industry Insights</span>
                <span className="font-mono font-semibold text-white">{industryInsightCount}</span>
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
                  Executive Social Activity
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  {companyName} • {posts.length} Recent Posts • {totalEngagement.toLocaleString()} Total Engagement
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
                      Total Posts
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {posts.length}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Thought Leadership
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {thoughtLeadershipCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Industry Insights
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {industryInsightCount}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Total Engagement
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {(totalEngagement / 1000).toFixed(1)}K
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts List */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Recent Posts ({posts.length})
                </h4>

                {posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.map((post, index) => (
                      <div
                        key={index}
                        className="border border-[#333] rounded-lg p-5 hover:border-[#007AFF] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Post Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h5 className="text-base font-bold text-white">{post.executiveName}</h5>
                              {getPlatformBadge(post.platform)}
                              <span className="text-xs text-gray-500">{post.postedDate}</span>
                            </div>

                            <div className="mb-3">
                              <span
                                className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-500 bg-opacity-20 text-gray-300"
                              >
                                {post.postType}
                              </span>
                            </div>

                            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                              {post.content}
                            </p>

                            {/* Engagement Metrics */}
                            <div className="flex items-center gap-6 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <span>👍</span>
                                <span className="font-mono text-white">{post.engagement.likes.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>💬</span>
                                <span className="font-mono text-white">{post.engagement.comments.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>🔄</span>
                                <span className="font-mono text-white">{post.engagement.shares.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Action Button */}
                          {post.url && (
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-[#007AFF] text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-[#0055CC] transition-all flex-shrink-0"
                              style={{ backgroundColor: '#007AFF', color: '#FFFFFF' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Post
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No recent social activity
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
