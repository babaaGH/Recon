'use client';

import { useState, useEffect, useRef } from 'react';
import HighValueTargets from '@/components/HighValueTargets';
import SECFilings from '@/components/SECFilings';
import FinancialHealth from '@/components/FinancialHealth';
import NewsSentiment from '@/components/NewsSentiment';
import HiringIntelligence from '@/components/HiringIntelligence';
import LeadershipChanges from '@/components/LeadershipChanges';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import IntelligenceLog from '@/components/IntelligenceLog';
import Image from 'next/image';

interface CompanyIntel {
  company_name: string;
  operational_focus: string;
  industry: string;
  org_type: string;
  region: string;
  hq: string;
  revenue: string;
  stature: string;
  it_signal: string;
  executive_summary: string;
}

interface LinkedInTarget {
  name: string;
  title: string;
  linkedinUrl: string;
  snippet: string;
  location: string;
  connection: string;
}

interface BrandfetchSuggestion {
  name: string;
  domain: string;
  icon?: string;
  brandId?: string;
}

export default function Home() {
  const [searchResult, setSearchResult] = useState<CompanyIntel | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [targets, setTargets] = useState<LinkedInTarget[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<BrandfetchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      setMessage('Company name required');
      return;
    }

    setLoading(true);
    setMessage('');
    setSearchResult(null);

    try {
      const intelResponse = await fetch('/api/intel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName
        }),
      });

      if (!intelResponse.ok) {
        setMessage('RESEARCH FAILED - DATA UNAVAILABLE');
        setLoading(false);
        return;
      }

      const intel = await intelResponse.json();
      setSearchResult(intel);
      setMessage('RESEARCH COMPLETE');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('SYSTEM ERROR');
    } finally {
      setLoading(false);
    }
  };

  // Fetch targets when search result is available
  useEffect(() => {
    if (!searchResult) {
      setTargets([]);
      return;
    }

    let cancelled = false;

    const loadTargets = async () => {
      setTargetsLoading(true);

      try {
        const response = await fetch('/api/targets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company: searchResult.company_name }),
        });

        if (cancelled) return;

        if (!response.ok) {
          setTargets([]);
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setTargets(data.targets || []);
        }
      } catch (err) {
        if (!cancelled) {
          setTargets([]);
        }
      } finally {
        if (!cancelled) {
          setTargetsLoading(false);
        }
      }
    };

    loadTargets();

    return () => {
      cancelled = true;
    };
  }, [searchResult]);

  // Debounced Brandfetch autocomplete search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (companyName.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.brandfetch.io/v2/search/${encodeURIComponent(companyName)}?c=${process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || 'demo'}`
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.slice(0, 5)); // Show top 5 results
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Brandfetch error:', error);
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [companyName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: BrandfetchSuggestion) => {
    setCompanyName(suggestion.name);
    setShowSuggestions(false);
    // Trigger search automatically
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }, 100);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Fixed Header */}
      <header className="flex-shrink-0 px-8 pt-6 pb-4">
        <div className="border border-[var(--border-primary)] rounded-lg p-6 bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between gap-6">
            {/* Logo - Left - More Prominent */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-ui font-bold tracking-[0.2em] text-[#007AFF]">
                RECON
              </h1>
              <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">Sales Intelligence Platform</p>
            </div>

            {/* Search Bar - Shorter */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search company intelligence..."
                  className="w-full px-4 py-2.5 pr-24 rounded-lg border border-[var(--border-primary)] bg-black bg-opacity-40 text-sm font-ui focus:outline-none focus:border-[#007AFF] transition-colors placeholder:text-[var(--text-secondary)]"
                  disabled={loading}
                  autoComplete="off"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-mono bg-[var(--dark-slate)] border border-[var(--border-slate)] rounded opacity-60">
                    ⌘K
                  </kbd>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-ui font-bold uppercase tracking-wide bg-[#007AFF] bg-opacity-10 text-[#007AFF] rounded hover:bg-opacity-20 transition-all disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? '...' : '→'}
                  </button>
                </div>

                {/* Autocomplete Dropdown - 2026 Fintech Glassmorphism */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="glass-dropdown absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-50">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="glass-dropdown-item flex items-center gap-3 px-4 py-3 border-b border-[var(--border-primary)] last:border-b-0"
                      >
                        {/* Company Logo */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                          {suggestion.icon ? (
                            <img
                              src={suggestion.icon}
                              alt={suggestion.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-[#333] rounded-full"></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#333] rounded-full"></div>
                          )}
                        </div>

                        {/* Company Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-ui font-semibold text-sm text-[var(--text-primary)] truncate">
                            {suggestion.name}
                          </div>
                          <div className="font-ui text-xs text-[var(--text-secondary)] truncate">
                            {suggestion.domain}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Status Message */}
          {message && (
            <div className="mt-3 p-2.5 rounded bg-black border border-[var(--border-slate)] font-mono text-xs">
              {message}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area - Fixed Viewport */}
      <main className="flex-1 overflow-hidden px-8 pb-6">
        {/* Intelligence Log - Loading State */}
        {loading && !searchResult && (
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-medium opacity-90 mb-6 flex-shrink-0">
              INTELLIGENCE LOG
            </h2>
            <div className="flex-1 overflow-y-auto">
              <IntelligenceLog />
            </div>
          </div>
        )}

        {/* Company Intelligence - Fixed-Viewport Bento Grid */}
        {searchResult && (
          <div className="h-full flex flex-col">
            {/* 3-Column Bento Grid - Takes Remaining Height */}
            <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
              {/* Column 1: Company Summary (3 cols) - Scrollable */}
              <div className="col-span-3 flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium opacity-90 mb-4 flex-shrink-0">
                  COMPANY INTELLIGENCE
                </h2>
                <div className="overflow-y-auto space-y-6 pr-2 flex-1"
                   style={{
                     scrollbarWidth: 'thin',
                     scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
                   }}>
                <div className="glass-bento rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-[var(--dark-slate)] px-6 py-4">
                    <h3 className="text-xl font-bold">
                      {searchResult.company_name}
                    </h3>
                    <p className="text-sm opacity-60 mt-1">
                      {searchResult.industry} • {searchResult.org_type}
                    </p>
                  </div>

                  {/* Operational Focus */}
                  <div className="border-t border-[var(--border-slate)] bg-black bg-opacity-40 px-6 py-4">
                    <div className="text-xs opacity-60 uppercase tracking-wider mb-2">Operational Focus</div>
                    <div className="text-sm leading-snug text-[#e5e7eb]">
                      {searchResult.operational_focus}
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Org Type</div>
                      <div className="font-mono text-sm">{searchResult.org_type}</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs opacity-80">{searchResult.hq}</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Revenue</div>
                      <div className="font-mono text-[#10b981] text-lg">{searchResult.revenue}</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Stature</div>
                      <div className="font-mono text-sm">{searchResult.stature}</div>
                    </div>
                  </div>

                  {/* IT Signal */}
                  <div className="border-t border-[var(--border-slate)] bg-black bg-opacity-40 px-6 py-4">
                    <div className="text-xs opacity-60 uppercase tracking-wider mb-2">IT Signal / News</div>
                    <div className="text-xs leading-relaxed opacity-90 whitespace-pre-line">
                      {searchResult.it_signal}
                    </div>
                  </div>
                </div>

                {/* Hiring Intelligence */}
                <ErrorBoundary>
                  <HiringIntelligence companyName={searchResult.company_name} />
                </ErrorBoundary>
              </div>
              </div>

              {/* Column 2: Financials & Pain Signals (6 cols) - Scrollable */}
              <div className="col-span-6 flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium opacity-90 mb-4 flex-shrink-0">
                  FINANCIAL & REGULATORY
                </h2>
                <div className="overflow-y-auto space-y-6 pr-2 flex-1"
                   style={{
                     scrollbarWidth: 'thin',
                     scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
                   }}>
                {/* Financial Health */}
                <ErrorBoundary>
                  <FinancialHealth companyName={searchResult.company_name} />
                </ErrorBoundary>

                <div className="glass-bento rounded-lg overflow-hidden">
                  <div className="p-6">
                    <ErrorBoundary>
                      <SECFilings companyName={searchResult.company_name} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </div>

              {/* Column 3: Key Contacts (3 cols) - Scrollable */}
              <div className="col-span-3 flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium opacity-90 mb-4 flex-shrink-0">
                  CONTACTS & SENTIMENT
                </h2>
                <div className="overflow-y-auto space-y-6 pr-2 flex-1"
                   style={{
                     scrollbarWidth: 'thin',
                     scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
                   }}>
                {/* Leadership Changes */}
                <ErrorBoundary>
                  <LeadershipChanges companyName={searchResult.company_name} />
                </ErrorBoundary>

                {/* News & Sentiment */}
                <ErrorBoundary>
                  <NewsSentiment companyName={searchResult.company_name} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
          </div>
        )}
      </main>
    </div>
  );
}
