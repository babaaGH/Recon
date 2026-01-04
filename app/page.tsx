'use client';

import { useState, useEffect, useRef } from 'react';
import CompanyIntelligence from '@/components/CompanyIntelligence';
import FinancialCore from '@/components/FinancialCore';
import StrategyEcosystem from '@/components/StrategyEcosystem';
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
  ticker?: string;
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
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
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
    setLogoUrl(undefined);

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

      // Get ticker symbol
      if (intel.company_name) {
        try {
          const tickerRes = await fetch(`https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(intel.company_name)}&limit=1&apikey=demo`);
          if (tickerRes.ok) {
            const tickerData = await tickerRes.json();
            if (tickerData && tickerData.length > 0 && tickerData[0].symbol) {
              setSearchResult(prev => prev ? { ...prev, ticker: tickerData[0].symbol } : null);
            }
          }
        } catch (err) {
          console.error('Error fetching ticker:', err);
        }
      }
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

    const fetchTargets = async () => {
      setTargetsLoading(true);
      try {
        const response = await fetch('/api/targets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: searchResult.company_name }),
        });

        if (response.ok && !cancelled) {
          const data = await response.json();
          setTargets(data.targets || []);
        }
      } catch (error) {
        console.error('Error fetching targets:', error);
      } finally {
        if (!cancelled) {
          setTargetsLoading(false);
        }
      }
    };

    fetchTargets();

    return () => {
      cancelled = true;
    };
  }, [searchResult]);

  // Company name autocomplete
  useEffect(() => {
    if (companyName.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.brandfetch.io/v2/search/${encodeURIComponent(companyName)}?c=${process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || 'demo'}`
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Brandfetch error:', error);
        setSuggestions([]);
      }
    }, 300);

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
    setLogoUrl(suggestion.icon);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }, 100);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#000]">
      {/* Fixed Header - Search Bar */}
      <header className="flex-shrink-0 px-8 pt-6 pb-4 border-b border-[#333]">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search company intelligence..."
              className="w-full px-6 py-4 pr-24 rounded-lg border border-[#333] bg-black text-base text-white focus:outline-none focus:border-[#007AFF] transition-colors placeholder:text-gray-600"
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#007AFF] text-white text-sm font-bold uppercase tracking-wide rounded hover:bg-[#0066CC] transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Search'}
            </button>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-[#333] rounded-lg overflow-hidden z-50 shadow-2xl">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white hover:bg-opacity-5 transition-colors text-left"
                  >
                    {suggestion.icon && (
                      <Image src={suggestion.icon} alt={suggestion.name} width={24} height={24} className="rounded" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{suggestion.name}</div>
                      <div className="text-xs text-gray-500">{suggestion.domain}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className="mt-3 p-3 rounded bg-black border border-[#333] text-center text-xs text-gray-400">
              {message}
            </div>
          )}
        </form>
      </header>

      {/* Main Dashboard - 100vh Fixed Grid */}
      <main className="flex-1 overflow-hidden px-8 py-6">
        {loading && !searchResult && (
          <div className="h-full flex items-center justify-center">
            <IntelligenceLog />
          </div>
        )}

        {searchResult && (
          <div
            className="h-full grid gap-6"
            style={{
              gridTemplateColumns: '320px 1fr 380px',
              gridTemplateRows: '1fr',
              gridTemplateAreas: '"company financial strategy"',
            }}
          >
            {/* Column 1: Company Intelligence (Growth Pillar) */}
            <div style={{ gridArea: 'company' }} className="overflow-hidden">
              <CompanyIntelligence
                companyName={searchResult.company_name}
                industry={searchResult.industry}
                revenue={searchResult.revenue}
                logoUrl={logoUrl}
              />
            </div>

            {/* Column 2: Financial Core (Performance Pillar) */}
            <div style={{ gridArea: 'financial' }} className="overflow-hidden">
              <FinancialCore companyName={searchResult.company_name} ticker={searchResult.ticker} />
            </div>

            {/* Column 3: Strategic Ecosystem (People Pillar) */}
            <div style={{ gridArea: 'strategy' }} className="overflow-hidden">
              <StrategyEcosystem companyName={searchResult.company_name} executives={targets} />
            </div>
          </div>
        )}

        {!loading && !searchResult && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-[#007AFF] text-4xl font-bold tracking-[0.2em] mb-2">RECON</div>
            <div className="text-gray-500 text-sm">Sales Intelligence Platform</div>
            <div className="mt-8 text-gray-600 text-xs uppercase tracking-wider">
              Enter a company name to begin analysis
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
