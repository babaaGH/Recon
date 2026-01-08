'use client';

import { useState, useEffect, useRef } from 'react';
import HighValueTargets from '@/components/HighValueTargets';
import SECFilings from '@/components/SECFilings';
import FinancialHealth from '@/components/FinancialHealth';
import NewsSentiment from '@/components/NewsSentiment';
import HiringIntelligence from '@/components/HiringIntelligence';
import LeadershipChanges from '@/components/LeadershipChanges';
import NetworkingEvents from '@/components/NetworkingEvents';
import ExecutiveSocialActivity from '@/components/ExecutiveSocialActivity';
import CommunityCSR from '@/components/CommunityCSR';
import StockChart from '@/components/StockChart';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import IntelligenceLog from '@/components/IntelligenceLog';
import Image from 'next/image';
import { generateCompanyIntelligencePDF } from '@/lib/generatePDF';

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

// Helper function to derive company website from name
const deriveWebsiteFromCompany = (companyName: string): string => {
  const websiteMap: { [key: string]: string } = {
    'apple': 'https://www.apple.com',
    'microsoft': 'https://www.microsoft.com',
    'google': 'https://www.google.com',
    'alphabet': 'https://abc.xyz',
    'amazon': 'https://www.amazon.com',
    'meta': 'https://about.meta.com',
    'facebook': 'https://about.meta.com',
    'tesla': 'https://www.tesla.com',
    'netflix': 'https://www.netflix.com',
    'nvidia': 'https://www.nvidia.com',
    'salesforce': 'https://www.salesforce.com',
    'adobe': 'https://www.adobe.com',
    'oracle': 'https://www.oracle.com',
    'ibm': 'https://www.ibm.com',
    'intel': 'https://www.intel.com',
    'cisco': 'https://www.cisco.com',
    'paypal': 'https://www.paypal.com',
    'uber': 'https://www.uber.com',
    'airbnb': 'https://www.airbnb.com',
    'spotify': 'https://www.spotify.com',
    'zoom': 'https://zoom.us',
    'shopify': 'https://www.shopify.com',
    'square': 'https://squareup.com',
    'block': 'https://block.xyz',
    'snowflake': 'https://www.snowflake.com',
    'datadog': 'https://www.datadoghq.com',
    'mongodb': 'https://www.mongodb.com',
    'twilio': 'https://www.twilio.com',
    'atlassian': 'https://www.atlassian.com',
    'servicenow': 'https://www.servicenow.com',
  };

  const normalized = companyName.toLowerCase().replace(/\s+inc\.?$|\s+corp\.?$|\s+corporation$|\s+llc$|\s+ltd\.?$/i, '').trim();

  return websiteMap[normalized] || `https://www.${normalized.replace(/\s+/g, '')}.com`;
};

// Helper function to derive ticker from company name
const deriveTickerFromCompany = (companyName: string): string => {
  // Common company ticker mappings
  const tickerMap: { [key: string]: string } = {
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'google': 'GOOGL',
    'alphabet': 'GOOGL',
    'amazon': 'AMZN',
    'meta': 'META',
    'facebook': 'META',
    'tesla': 'TSLA',
    'netflix': 'NFLX',
    'nvidia': 'NVDA',
    'salesforce': 'CRM',
    'adobe': 'ADBE',
    'oracle': 'ORCL',
    'ibm': 'IBM',
    'intel': 'INTC',
    'cisco': 'CSCO',
    'paypal': 'PYPL',
    'uber': 'UBER',
    'airbnb': 'ABNB',
    'spotify': 'SPOT',
    'zoom': 'ZM',
    'shopify': 'SHOP',
    'square': 'SQ',
    'block': 'SQ',
    'stripe': 'STRIPE',
    'snowflake': 'SNOW',
    'datadog': 'DDOG',
    'mongodb': 'MDB',
    'twilio': 'TWLO',
    'atlassian': 'TEAM',
    'servicenow': 'NOW',
  };

  const normalized = companyName.toLowerCase().replace(/\s+inc\.?$|\s+corp\.?$|\s+corporation$|\s+llc$|\s+ltd\.?$/i, '').trim();

  return tickerMap[normalized] || normalized.substring(0, 4).toUpperCase();
};

interface StockDataPoint {
  date: string;
  timestamp: number;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
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

  // Stock data state
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [ticker, setTicker] = useState('');

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

  // Fetch stock data when search result is available
  useEffect(() => {
    if (!searchResult) {
      setStockData([]);
      setTicker('');
      return;
    }

    let cancelled = false;

    const loadStockData = async () => {
      setStockLoading(true);

      // Derive ticker from company name
      const derivedTicker = deriveTickerFromCompany(searchResult.company_name);
      setTicker(derivedTicker);

      try {
        const response = await fetch('/api/stock-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticker: derivedTicker }),
        });

        if (cancelled) return;

        if (!response.ok) {
          setStockData([]);
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setStockData(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        if (!cancelled) {
          setStockData([]);
        }
      } finally {
        if (!cancelled) {
          setStockLoading(false);
        }
      }
    };

    loadStockData();

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

  // Download PDF handler
  const handleDownloadPDF = async () => {
    if (!searchResult) return;

    try {
      setMessage('Generating PDF report...');

      // Fetch all data in parallel
      const [
        hiringResponse,
        eventsResponse,
        newsResponse,
        secResponse
      ] = await Promise.all([
        fetch('/api/hiring-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: searchResult.company_name }),
        }),
        fetch('/api/networking-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: searchResult.company_name }),
        }),
        fetch('/api/strategic-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: searchResult.company_name }),
        }),
        fetch('/api/sec-filings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: searchResult.company_name }),
        }),
      ]);

      const hiringData = await hiringResponse.json();
      const eventsData = await eventsResponse.json();
      const newsData = await newsResponse.json();
      const secData = await secResponse.json();

      // Calculate stock price change
      let priceChange = '';
      if (stockData.length > 0) {
        const firstPrice = stockData[0]?.close || 0;
        const lastPrice = stockData[stockData.length - 1]?.close || 0;
        const change = lastPrice - firstPrice;
        const percentChange = ((change / firstPrice) * 100).toFixed(2);
        priceChange = `${change >= 0 ? '+' : ''}${percentChange}%`;
      }

      // Prepare data for PDF
      const pdfData = {
        companyName: searchResult.company_name,
        industry: searchResult.industry,
        orgType: searchResult.org_type,
        hq: searchResult.hq,
        revenue: searchResult.revenue,
        stature: searchResult.stature,
        operationalFocus: searchResult.operational_focus,
        itSignal: searchResult.it_signal,
        ticker: ticker,
        stockPrice: stockData.length > 0 ? stockData[stockData.length - 1]?.close : undefined,
        priceChange: priceChange,
        targets: targets,
        secFilings: secData.filings || [],
        hiringData: {
          engineering: hiringData.engineering || 0,
          sales: hiringData.sales || 0,
          marketing: hiringData.marketing || 0,
          total: hiringData.total || 0,
        },
        events: eventsData.events || [],
        news: newsData.news || [],
      };

      // Generate PDF
      generateCompanyIntelligencePDF(pdfData);

      setMessage('PDF downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Error generating PDF. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
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
                    className="px-3 py-1 text-xs font-ui font-bold uppercase tracking-wide bg-[#007AFF] text-white rounded hover:bg-[#0055CC] transition-all disabled:opacity-50"
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

            {/* Download PDF Button - Shows when search result is available */}
            {searchResult && (
              <button
                onClick={handleDownloadPDF}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg border border-[#007AFF] bg-[#007AFF] bg-opacity-10 text-[#007AFF] hover:bg-opacity-20 transition-all flex items-center gap-2 font-ui text-sm font-semibold"
                title="Download Intelligence Report as PDF"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            )}
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
              {/* Column 1: Company Summary (3 cols) */}
              <div className="col-span-3 flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium opacity-90 mb-4 flex-shrink-0">
                  COMPANY INTELLIGENCE
                </h2>
                <div className="glass-bento rounded-lg overflow-y-auto flex-1 pr-2"
                   style={{
                     scrollbarWidth: 'thin',
                     scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
                   }}>
                  {/* Header */}
                  <div className="bg-[var(--dark-slate)] px-6 py-4">
                    <a
                      href={deriveWebsiteFromCompany(searchResult.company_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold hover:text-[#007AFF] transition-colors inline-flex items-center gap-2"
                    >
                      {searchResult.company_name}
                      <span className="text-sm opacity-60">↗</span>
                    </a>
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
              </div>

              {/* Column 2: Financials & Regulatory (6 cols) */}
              <div className="col-span-6 flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium opacity-90 mb-4 flex-shrink-0">
                  FINANCIAL & REGULATORY
                </h2>
                <div className="space-y-6 flex-1 overflow-y-auto pr-2"
                   style={{
                     scrollbarWidth: 'thin',
                     scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
                   }}>
                {/* Row 1: Financial Health & Sentiment (side by side) */}
                <div className="grid grid-cols-2 gap-6">
                  <ErrorBoundary>
                    <FinancialHealth companyName={searchResult.company_name} />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <NewsSentiment companyName={searchResult.company_name} />
                  </ErrorBoundary>
                </div>

                {/* Row 2: Stock Performance */}
                <ErrorBoundary>
                  <StockChart ticker={ticker} data={stockData} loading={stockLoading} />
                </ErrorBoundary>

                {/* Row 3: SEC Filings */}
                <div className="glass-bento rounded-lg overflow-hidden">
                  <div className="p-6">
                    <ErrorBoundary>
                      <SECFilings companyName={searchResult.company_name} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </div>

              {/* Column 3: People & Networking (3 cols) */}
              <div className="col-span-3 flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium opacity-90 mb-4 flex-shrink-0">
                  PEOPLE & NETWORKING
                </h2>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2"
                   style={{
                     scrollbarWidth: 'thin',
                     scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
                   }}>
                {/* Leadership Changes */}
                <ErrorBoundary>
                  <LeadershipChanges companyName={searchResult.company_name} />
                </ErrorBoundary>

                {/* Networking & Events */}
                <ErrorBoundary>
                  <NetworkingEvents companyName={searchResult.company_name} />
                </ErrorBoundary>

                {/* Hiring Intelligence */}
                <ErrorBoundary>
                  <HiringIntelligence companyName={searchResult.company_name} />
                </ErrorBoundary>

                {/* Executive Social Activity */}
                <ErrorBoundary>
                  <ExecutiveSocialActivity companyName={searchResult.company_name} />
                </ErrorBoundary>

                {/* Community & CSR */}
                <ErrorBoundary>
                  <CommunityCSR companyName={searchResult.company_name} />
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
