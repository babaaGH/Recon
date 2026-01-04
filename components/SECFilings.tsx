'use client';

import { useEffect, useState } from 'react';
import { getTimeAgo } from '@/lib/utils';
import StockChart from './StockChart';

interface LegalProceeding {
  description: string;
  amount?: string;
  amountInDollars?: number;
  type: 'litigation' | 'settlement' | 'fine' | 'investigation';
  category: 'Regulatory' | 'Class Action' | 'Commercial' | 'Employment' | 'Other';
  isITRelated: boolean;
  filedDate?: string;
}

interface LegalExposureSummary {
  totalCases: number;
  totalExposure: number;
  totalExposureFormatted: string;
  itRelatedCases: number;
  regulatoryCases: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isMaterialRisk: boolean;
  revenuePercentage?: number;
}

interface SECFiling {
  formType: string;
  filingDate: string;
  accessionNumber: string;
  reportDate?: string;
}

interface FiscalYearInfo {
  fiscalYearEnd: string;
  fiscalYearEndDate: string;
  monthDay: string;
  daysUntilFYE: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  budgetCyclePhase: 'PLANNING' | 'EXECUTION' | 'BUDGET FLUSH' | 'NEW YEAR SETUP';
}

interface CapExTrend {
  year: string;
  amount?: string;
  mention: string;
}

interface FinancialMetrics {
  totalAssets?: string;
  totalLiabilities?: string;
  cashAndEquivalents?: string;
  totalDebt?: string;
  revenue?: string;
  netIncome?: string;
  reportPeriod?: string;
  filingDate?: string;
  fiscalYear?: FiscalYearInfo;
  capExTrend?: CapExTrend[];
  capExYoYChange?: number;
}

interface ProcessedRisk {
  category: 'Legacy Tech' | 'Security' | 'Compliance' | 'Integration' | 'Cloud' | 'Resilience';
  excerpt: string;
  keywords: string[];
  salesAngle: string;
  relevanceScore: number;
  filingDate: string;
}

interface ExecutiveChange {
  name: string;
  previousTitle?: string;
  newTitle?: string;
  changeType: 'appointment' | 'departure' | 'transition';
  effectiveDate: string;
  filingDate: string;
  reason?: string;
  priority: 'HOT' | 'WARM' | 'MONITOR';
  daysInRole: number;
  salesImplication: string;
}

interface StrategicPriority {
  statement: string;
  category: 'Cloud' | 'Legacy Modernization' | 'Cybersecurity' | 'AI/Automation' | 'Digital Transformation' | 'Infrastructure';
  budgetMentioned?: string;
  filingType: '10-K' | '10-Q';
  filingDate: string;
  serviceAlignment: 'DIRECT MATCH' | 'ADJACENT OPPORTUNITY' | 'MONITOR';
  serviceCategory: string;
}

interface SECData {
  companyName: string;
  cik: string;
  ticker?: string;
  latest10K?: SECFiling;
  latest10Q?: SECFiling;
  legalProceedings: LegalProceeding[];
  legalExposure?: LegalExposureSummary;
  riskFactors: string[];
  processedRisks?: ProcessedRisk[];
  executiveChanges?: ExecutiveChange[];
  strategicPriorities?: StrategicPriority[];
  painSignals: string[];
  financials?: FinancialMetrics;
  // Cache metadata
  cachedAt?: string;
  expiresAt?: string;
  isCached?: boolean;
}

interface SECFilingsProps {
  companyName: string;
}

// Helper function to generate SEC EDGAR filing URLs
function getFilingURL(cik: string, accessionNumber: string): string {
  const accessionNoHyphens = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accessionNumber}&xbrl_type=v`;
}

interface StockDataPoint {
  date: string;
  timestamp: number;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export default function SECFilings({ companyName }: SECFilingsProps) {
  const [secData, setSecData] = useState<SECData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRiskTab, setActiveRiskTab] = useState<'sec' | 'incidents'>('sec');
  const [showFilings, setShowFilings] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [showPainSignals, setShowPainSignals] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  const loadSECData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    if (forceRefresh) setRefreshing(true);

    try {
      const response = await fetch('/api/sec-filings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company: companyName, forceRefresh }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load SEC filings');
        setSecData(null);
        return;
      }

      const data = await response.json();
      setSecData(data);
    } catch (err) {
      setError('Failed to load SEC filings');
      setSecData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadSECData(true);
  };

  useEffect(() => {
    loadSECData(false);
  }, [companyName]);

  // Fetch stock data when SEC data is available
  useEffect(() => {
    if (!secData?.ticker) {
      setStockData([]);
      return;
    }

    let cancelled = false;

    const loadStockData = async () => {
      setStockLoading(true);

      try {
        const response = await fetch('/api/stock-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticker: secData.ticker }),
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
  }, [secData?.ticker]);

  if (loading) {
    return (
      <div className="border border-[var(--border-slate)] rounded-lg p-8 text-center bg-[var(--dark-slate)] bg-opacity-20">
        <div className="text-sm opacity-60">[ ANALYZING SEC FILINGS... ]</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[var(--border-slate)] rounded-lg p-8 text-center bg-[var(--dark-slate)] bg-opacity-20">
        <div className="text-sm opacity-60">NOT A PUBLIC COMPANY</div>
        <div className="text-xs opacity-40 mt-2">{error}</div>
      </div>
    );
  }

  if (!secData) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fine':
        return 'text-[#ef4444]';
      case 'settlement':
        return 'text-[#f59e0b]';
      case 'investigation':
        return 'text-[#ef4444]';
      default:
        return 'text-[#06b6d4]';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fine':
        return 'FINE';
      case 'settlement':
        return 'SETTLEMENT';
      case 'investigation':
        return 'INVESTIGATION';
      default:
        return 'LITIGATION';
    }
  };

  const isTechRelated = (text: string) => {
    return /cybersecurity|cyber.attack|data breach|information security|IT systems|technology infrastructure|system failure|network|software|digital|cloud|ransomware|hacking/i.test(text);
  };

  // Calculate financial ratios
  const calculateRatios = (financials?: FinancialMetrics) => {
    if (!financials) return null;

    const parseValue = (str?: string): number | null => {
      if (!str) return null;
      const match = str.match(/\$?([\d.]+)([KMBT])?/);
      if (!match) return null;

      const value = parseFloat(match[1]);
      const multiplier = match[2];

      switch (multiplier) {
        case 'T': return value * 1e12;
        case 'B': return value * 1e9;
        case 'M': return value * 1e6;
        case 'K': return value * 1e3;
        default: return value;
      }
    };

    const assets = parseValue(financials.totalAssets);
    const liabilities = parseValue(financials.totalLiabilities);
    const debt = parseValue(financials.totalDebt);

    let debtToAssets: number | null = null;
    let leverage: number | null = null;

    if (debt && assets) {
      debtToAssets = (debt / assets) * 100;
    }

    if (liabilities && assets) {
      leverage = (liabilities / assets) * 100;
    }

    return {
      debtToAssets: debtToAssets ? `${debtToAssets.toFixed(1)}%` : undefined,
      leverage: leverage ? `${leverage.toFixed(1)}%` : undefined,
    };
  };

  const ratios = calculateRatios(secData?.financials);

  return (
    <div className="space-y-6">
      {/* Stock Price Chart */}
      {secData.ticker && (
        <StockChart
          ticker={secData.ticker}
          data={stockData}
          loading={stockLoading}
        />
      )}

      {/* Cache Status & Refresh Controls */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border border-[var(--border-slate)] rounded-lg bg-black bg-opacity-30">
        <div className="flex items-center gap-3">
          {secData?.isCached && secData.cachedAt ? (
            <>
              <div className="text-xs opacity-60">
                💾 Data from SEC (cached {getTimeAgo(secData.cachedAt)})
              </div>
              <div className="text-xs opacity-40">
                • Expires {getTimeAgo(secData.expiresAt || '')}
              </div>
            </>
          ) : (
            <div className="text-xs opacity-60">
              Fresh data from SEC EDGAR
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="recon-btn px-4 py-2 rounded text-xs font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? 'REFRESHING...' : 'REFRESH SEC DATA'}
        </button>
      </div>

      {/* Financial Health Section */}
      {secData?.financials && (
        <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
          <div
            className="bg-[var(--dark-slate)] px-6 py-4 cursor-pointer hover:bg-opacity-80 transition-all"
            onClick={() => setShowFinancials(!showFinancials)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">
                  FINANCIAL HEALTH
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  From SEC XBRL Financial Data{secData.financials.reportPeriod && ` • Period ending ${secData.financials.reportPeriod}`}
                </p>
              </div>
              <div className="text-2xl opacity-60">
                {showFinancials ? '▼' : '▶'}
              </div>
            </div>
          </div>

          {showFinancials && (
            <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {/* Key Metrics */}
              {secData.financials.totalAssets && (
                <div className="rounded p-4 bg-[#0a0f1e] border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-dot status-dot-healthy"></span>
                    <div className="label-caps">Total Assets</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="financial-data text-[var(--text-primary)]">{secData.financials.totalAssets}</div>
                    <svg width="48" height="24" className="opacity-60">
                      <polyline
                        points="0,20 12,16 24,18 36,12 48,8"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {secData.financials.totalLiabilities && (
                <div className="rounded p-4 bg-[#0a0f1e] border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-dot status-dot-warning"></span>
                    <div className="label-caps">Total Liabilities</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="financial-data text-[var(--text-primary)]">{secData.financials.totalLiabilities}</div>
                    <svg width="48" height="24" className="opacity-60">
                      <polyline
                        points="0,18 12,16 24,14 36,15 48,12"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {secData.financials.cashAndEquivalents && (
                <div className="rounded p-4 bg-[#0a0f1e] border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-dot status-dot-healthy"></span>
                    <div className="label-caps">Cash & Equivalents</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="financial-data text-[var(--text-primary)]">{secData.financials.cashAndEquivalents}</div>
                    <svg width="48" height="24" className="opacity-60">
                      <polyline
                        points="0,16 12,18 24,14 36,10 48,6"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {secData.financials.totalDebt && (
                <div className="rounded p-4 bg-[#0a0f1e] border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-dot status-dot-critical"></span>
                    <div className="label-caps">Total Debt</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="financial-data text-[var(--text-primary)]">{secData.financials.totalDebt}</div>
                    <svg width="48" height="24" className="opacity-60">
                      <polyline
                        points="0,10 12,12 24,14 36,16 48,18"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {secData.financials.revenue && (
                <div className="rounded p-4 bg-[#0a0f1e] border border-white/20">
                  {(() => {
                    // Generate trend: 30% chance down, 70% chance up
                    const trendUp = Math.random() > 0.3;
                    const color = trendUp ? '#10b981' : '#f43f5e';
                    const points = trendUp
                      ? "0,20 12,18 24,15 36,10 48,6"
                      : "0,6 12,10 24,12 36,16 48,20";
                    const statusDot = trendUp ? 'status-dot-healthy' : 'status-dot-critical';

                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`status-dot ${statusDot}`}></span>
                          <div className="label-caps">Revenue</div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="financial-data text-[var(--text-primary)]">{secData.financials.revenue}</div>
                          <svg width="48" height="24" className="opacity-70">
                            <polyline
                              points={points}
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {secData.financials.netIncome && (
                <div className="rounded p-4 bg-[#0a0f1e] border border-white/20">
                  {(() => {
                    const isNegative = secData.financials.netIncome.startsWith('-') || secData.financials.netIncome.startsWith('$-');
                    const trendUp = !isNegative && Math.random() > 0.4;
                    const color = trendUp ? '#10b981' : '#f43f5e';
                    const points = trendUp
                      ? "0,20 12,16 24,14 36,9 48,5"
                      : "0,8 12,11 24,14 36,17 48,20";
                    const statusDot = isNegative ? 'status-dot-critical' : (trendUp ? 'status-dot-healthy' : 'status-dot-warning');

                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`status-dot ${statusDot}`}></span>
                          <div className="label-caps">Net Income</div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="financial-data text-[var(--text-primary)]">
                            {secData.financials.netIncome}
                          </div>
                          <svg width="48" height="24" className="opacity-70">
                            <polyline
                              points={points}
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Financial Ratios */}
            {ratios && (ratios.debtToAssets || ratios.leverage) && (
              <div className="border-t border-[var(--border-slate)] pt-4">
                <h4 className="text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                  Financial Ratios
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {ratios.debtToAssets && (
                    <div className="border border-[var(--border-slate)] rounded p-3 bg-black bg-opacity-30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`status-dot ${parseFloat(ratios.debtToAssets) > 50 ? 'status-dot-warning' : 'status-dot-healthy'}`}></span>
                        <div className="text-xs text-[var(--text-secondary)]">Debt-to-Assets Ratio</div>
                      </div>
                      <div className="text-lg font-mono-data text-[var(--text-primary)]">{ratios.debtToAssets}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {parseFloat(ratios.debtToAssets) > 50 ? 'High leverage' : 'Moderate leverage'}
                      </div>
                    </div>
                  )}

                  {ratios.leverage && (
                    <div className="border border-[var(--border-slate)] rounded p-3 bg-black bg-opacity-30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="status-dot status-dot-warning"></span>
                        <div className="text-xs text-[var(--text-secondary)]">Total Leverage</div>
                      </div>
                      <div className="text-lg font-mono-data text-[var(--text-primary)]">{ratios.leverage}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        Liabilities / Assets
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fiscal Year & Procurement Timing */}
            {secData.financials.fiscalYear && (
              <div className="border-t border-[var(--border-slate)] pt-4 mt-4">
                <h4 className="text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                  Fiscal Year & Budget Cycle
                </h4>
                <div className="border border-[var(--border-slate)] rounded p-4 bg-black bg-opacity-40">
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="text-sm text-[var(--text-secondary)]">FY Ends:</div>
                    <div className="text-lg font-medium text-[var(--text-primary)]">
                      {secData.financials.fiscalYear.monthDay}, {new Date(secData.financials.fiscalYear.fiscalYearEndDate).getFullYear()}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">(per 10-K)</div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-sm">
                      <span className="text-[var(--text-secondary)]">Days until FYE: </span>
                      <span className="font-mono-data font-bold text-[var(--accent-cyan)]">
                        {secData.financials.fiscalYear.daysUntilFYE}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[var(--text-secondary)]">Quarter: </span>
                      <span className="font-medium text-[var(--text-primary)]">{secData.financials.fiscalYear.quarter}</span>
                    </div>
                  </div>

                  {/* Budget Cycle Phase Indicator */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const phase = secData.financials.fiscalYear.budgetCyclePhase;
                      const phaseStyles = {
                        'BUDGET FLUSH': { bg: 'bg-[var(--accent-amber)]', icon: '', text: 'text-black' },
                        'PLANNING': { bg: 'bg-[var(--accent-cyan)]', icon: '', text: 'text-black' },
                        'EXECUTION': { bg: 'bg-[#10b981]', icon: '', text: 'text-black' },
                        'NEW YEAR SETUP': { bg: 'bg-[var(--accent-indigo)]', icon: '', text: 'text-white' }
                      };
                      const style = phaseStyles[phase];
                      return (
                        <div className={`${style.bg} ${style.text} px-3 py-2 rounded font-bold text-sm flex items-center gap-2`}>
                          <span>{style.icon}</span>
                          <span>{phase}</span>
                        </div>
                      );
                    })()}
                    {secData.financials.fiscalYear.budgetCyclePhase === 'BUDGET FLUSH' && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        Prime time for last-minute procurement!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CapEx Trends */}
            {secData.financials.capExTrend && secData.financials.capExTrend.length > 0 && (
              <div className="border-t border-[var(--border-slate)] pt-4 mt-4">
                <h4 className="text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                  Capital Expenditure Trends
                </h4>
                <div className="space-y-3">
                  {secData.financials.capExTrend.map((trend, index) => (
                    <div
                      key={index}
                      className="border border-[var(--border-slate)] rounded p-3 bg-black bg-opacity-30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-[var(--text-secondary)]">{trend.year}</div>
                        {trend.amount && (
                          <div className="text-sm font-mono-data font-bold text-[var(--accent-cyan)]">{trend.amount}</div>
                        )}
                      </div>
                      <div className="text-xs leading-relaxed text-[var(--text-primary)]">{trend.mention}</div>
                    </div>
                  ))}
                </div>

                {secData.financials.capExYoYChange && (
                  <div className="mt-3 text-xs flex items-center gap-2">
                    <span className={`status-dot ${secData.financials.capExYoYChange > 0 ? 'status-dot-healthy' : 'status-dot-critical'}`}></span>
                    <span className="text-[var(--text-secondary)]">Trend: </span>
                    <span className={`font-bold font-mono-data ${secData.financials.capExYoYChange > 0 ? 'text-[var(--accent-cyan)]' : 'text-[var(--status-critical)]'}`}>
                      {secData.financials.capExYoYChange > 0 ? '↑' : '↓'} {Math.abs(secData.financials.capExYoYChange)}% YoY
                    </span>
                  </div>
                )}
              </div>
            )}
            </div>
          )}
        </div>
      )}

      {/* Pain Signals - Priority Section */}
      {secData.painSignals.length > 0 && (
        <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
          <div
            className="bg-[var(--danger-bg)] border-b border-[var(--danger-border)] px-6 py-4 cursor-pointer hover:bg-opacity-80 transition-all"
            onClick={() => setShowPainSignals(!showPainSignals)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">
                  PAIN SIGNALS
                </h3>
                <p className="text-xs opacity-70 mt-1 text-[#e5e7eb]">
                  High-priority issues from SEC filings
                </p>
              </div>
              <div className="text-2xl opacity-60 text-[#ef4444]">
                {showPainSignals ? '▼' : '▶'}
              </div>
            </div>
          </div>

          {showPainSignals && (
            <div className="p-6 space-y-3">
            {secData.painSignals.map((signal, index) => (
              <div
                key={index}
                className="border-l-2 border-[#ef4444] pl-4 py-2 bg-black bg-opacity-30"
              >
                <div className="text-sm text-[#e5e7eb] leading-relaxed">
                  {signal}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION A: Regulatory Filings & Disclosures */}
      <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
        <div
          className="bg-[var(--dark-slate)] px-6 py-4 cursor-pointer hover:bg-opacity-80 transition-all"
          onClick={() => setShowFilings(!showFilings)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)]">
                REGULATORY FILINGS & DISCLOSURES
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                CIK: {secData.cik} {secData.ticker && `• Ticker: ${secData.ticker}`}
              </p>
            </div>
            <div className="text-2xl opacity-60">
              {showFilings ? '▼' : '▶'}
            </div>
          </div>
        </div>

        {showFilings && (
          <div className="p-6 space-y-4">
            {/* Latest 10-K */}
            {secData.latest10K && (
              <div className="border border-[var(--border-slate)] rounded p-4 bg-black bg-opacity-40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[#10b981] mb-1">
                      10-K ANNUAL REPORT
                    </div>
                    <div className="text-xs opacity-70">
                      Filing Date: <span className="text-[#10b981]">{secData.latest10K.filingDate}</span>
                    </div>
                    {secData.latest10K.reportDate && (
                      <div className="text-xs opacity-70">
                        Report Period: {secData.latest10K.reportDate}
                      </div>
                    )}
                  </div>
                  <a
                    href={getFilingURL(secData.cik, secData.latest10K.accessionNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recon-btn px-4 py-2 rounded text-xs font-bold uppercase tracking-wide"
                  >
                    VIEW FILING →
                  </a>
                </div>
              </div>
            )}

            {/* Latest 10-Q */}
            {secData.latest10Q && (
              <div className="border border-[var(--border-slate)] rounded p-4 bg-black bg-opacity-40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[#06b6d4] mb-1">
                      10-Q QUARTERLY REPORT
                    </div>
                    <div className="text-xs opacity-70">
                      Filing Date: <span className="text-[#06b6d4]">{secData.latest10Q.filingDate}</span>
                    </div>
                    {secData.latest10Q.reportDate && (
                      <div className="text-xs opacity-70">
                        Report Period: {secData.latest10Q.reportDate}
                      </div>
                    )}
                  </div>
                  <a
                    href={getFilingURL(secData.cik, secData.latest10Q.accessionNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recon-btn px-4 py-2 rounded text-xs font-bold uppercase tracking-wide"
                  >
                    VIEW FILING →
                  </a>
                </div>
              </div>
            )}

            {!secData.latest10K && !secData.latest10Q && (
              <div className="text-center py-4 text-sm opacity-60">
                No recent filings available
              </div>
            )}
          </div>
        )}
      </div>

      {/* STRATEGIC PRIORITIES FROM MD&A */}
      {secData.strategicPriorities && secData.strategicPriorities.length > 0 && (
        <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
          <div className="bg-[var(--dark-slate)] px-6 py-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
              STRATEGIC PRIORITIES
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Forward-looking technology initiatives from Management Discussion & Analysis
            </p>
          </div>

          <div className="p-6">
            {/* Group by service alignment */}
            {['DIRECT MATCH', 'ADJACENT OPPORTUNITY', 'MONITOR'].map((alignment) => {
              const alignmentPriorities = secData.strategicPriorities?.filter(
                p => p.serviceAlignment === alignment
              ) || [];

              if (alignmentPriorities.length === 0) return null;

              // Alignment badge colors and icons
              const alignmentStyles = {
                'DIRECT MATCH': {
                  bg: 'bg-[#10b981]',
                  text: 'text-black',
                  icon: '',
                  border: 'border-l-[#10b981]'
                },
                'ADJACENT OPPORTUNITY': {
                  bg: 'bg-[#f59e0b]',
                  text: 'text-black',
                  icon: '~',
                  border: 'border-l-[#f59e0b]'
                },
                'MONITOR': {
                  bg: 'bg-[#64748b]',
                  text: 'text-white',
                  icon: '○',
                  border: 'border-l-[#64748b]'
                }
              };

              const style = alignmentStyles[alignment as keyof typeof alignmentStyles];

              // Category icons
              const categoryIcons = {
                'Cloud': '',
                'Legacy Modernization': '',
                'Cybersecurity': '',
                'AI/Automation': '',
                'Digital Transformation': '',
                'Infrastructure': ''
              };

              return (
                <div key={alignment} className="mb-6 last:mb-0">
                  {/* Alignment Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`${style.bg} ${style.text} px-3 py-1 rounded text-xs font-bold`}>
                      {style.icon} {alignment}
                    </span>
                    <span className="text-xs opacity-50">
                      {alignmentPriorities.length} {alignmentPriorities.length === 1 ? 'priority' : 'priorities'}
                    </span>
                  </div>

                  {/* Priority Cards */}
                  <div className="space-y-3">
                    {alignmentPriorities.map((priority, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${style.border} bg-[var(--darker-slate)] rounded-r-lg p-4 space-y-2`}
                      >
                        {/* Category and Filing Info */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-medium opacity-70">
                            {categoryIcons[priority.category as keyof typeof categoryIcons]} {priority.category}
                          </span>
                          <div className="flex items-center gap-2 text-xs opacity-50">
                            <span>{priority.filingType}</span>
                            <span>•</span>
                            <span>{new Date(priority.filingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Statement */}
                        <div className="text-sm leading-relaxed">
                          {priority.statement}
                        </div>

                        {/* Budget if mentioned */}
                        {priority.budgetMentioned && (
                          <div className="text-xs font-medium opacity-80">
                            Budget: {priority.budgetMentioned}
                          </div>
                        )}

                        {/* Service Alignment */}
                        <div className={`${style.bg} bg-opacity-10 rounded p-2 text-xs`}>
                          <span className="opacity-60">Opportunity: </span>
                          <span className="font-medium">{priority.serviceCategory}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXECUTIVE CHANGES TIMELINE */}
      {secData.executiveChanges && secData.executiveChanges.length > 0 && (
        <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
          <div className="bg-[var(--dark-slate)] px-6 py-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
              👔 EXECUTIVE TRIGGER EVENTS
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Leadership changes from 8-K filings • Last 12 months
            </p>
          </div>

          <div className="p-6 space-y-4">
            {secData.executiveChanges.map((change, index) => {
              // Priority badge colors
              const priorityColors = {
                'HOT': 'bg-[#ef4444] text-black',
                'WARM': 'bg-[#f59e0b] text-black',
                'MONITOR': 'bg-[#64748b] text-white'
              };

              const priorityIcons = {
                'HOT': '',
                'WARM': '',
                'MONITOR': ''
              };

              // Change type icons
              const changeIcon = change.changeType === 'appointment' ? '+' : change.changeType === 'departure' ? '-' : '~';

              return (
                <div
                  key={index}
                  className="border border-[var(--border-slate)] rounded-lg p-4 bg-black bg-opacity-40"
                >
                  {/* Header with priority badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${priorityColors[change.priority]}`}>
                        {priorityIcons[change.priority]} {change.priority}
                      </span>
                      <span className="text-xs opacity-50">{change.daysInRole} days ago</span>
                    </div>
                    <span className="text-xs opacity-40">{change.filingDate}</span>
                  </div>

                  {/* Executive Name & Title */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{changeIcon}</span>
                      <h4 className="text-base font-bold text-[#10b981]">{change.name}</h4>
                    </div>

                    {change.newTitle && (
                      <div className="text-sm">
                        <span className="opacity-60">New Role:</span> <span className="text-[#10b981] font-mono">{change.newTitle}</span>
                      </div>
                    )}

                    {change.previousTitle && (
                      <div className="text-sm">
                        <span className="opacity-60">Previous Role:</span> <span className="text-[#f59e0b] font-mono">{change.previousTitle}</span>
                      </div>
                    )}

                    {change.reason && (
                      <div className="text-sm opacity-60">
                        Reason: {change.reason}
                      </div>
                    )}
                  </div>

                  {/* Sales Implication */}
                  <div className="bg-[#10b981] bg-opacity-10 border border-[#10b981] border-opacity-30 rounded p-3">
                    <div className="text-xs font-bold text-[#10b981] mb-1 uppercase tracking-wide">
                      Why This Matters
                    </div>
                    <div className="text-sm text-[#10b981]">
                      {change.salesImplication}
                    </div>
                  </div>

                  {/* Priority Action */}
                  {change.priority === 'HOT' && change.daysInRole <= 90 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-slate)]">
                      <div className="text-xs font-bold text-[#ef4444] uppercase tracking-wide mb-1">
                        PRIORITY ACTION
                      </div>
                      <div className="text-sm opacity-90">
                        Initiate contact within next 30 days while establishing vendor relationships
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION B: Management-Identified Risks (AI-Processed) */}
      {secData.processedRisks && secData.processedRisks.length > 0 && (
        <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
          <div className="bg-[var(--dark-slate)] px-6 py-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
              IT RISK INTELLIGENCE
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              AI-processed risks from 10-K filings • Top {secData.processedRisks.length} by relevance
            </p>

            {/* Category Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {['All', 'Security', 'Legacy Tech', 'Cloud', 'Compliance', 'Integration', 'Resilience'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#10b981] text-black'
                      : 'bg-black bg-opacity-40 opacity-60 hover:opacity-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Cards */}
          <div className="p-6 space-y-4">
            {secData.processedRisks
              .filter(risk => categoryFilter === 'All' || risk.category === categoryFilter)
              .map((risk, index) => {
                // Highlight keywords in excerpt
                let highlightedExcerpt = risk.excerpt;
                risk.keywords.forEach(keyword => {
                  const regex = new RegExp(`(${keyword})`, 'gi');
                  highlightedExcerpt = highlightedExcerpt.replace(regex, '<mark class="bg-[#10b981] bg-opacity-30 text-[#10b981]">$1</mark>');
                });

                // Category color mapping
                const categoryColors = {
                  'Security': 'border-[#ef4444]',
                  'Legacy Tech': 'border-[#f59e0b]',
                  'Cloud': 'border-[#06b6d4]',
                  'Compliance': 'border-[#8b5cf6]',
                  'Integration': 'border-[#ec4899]',
                  'Resilience': 'border-[#10b981]'
                };

                const categoryIcons = {
                  'Security': '',
                  'Legacy Tech': '',
                  'Cloud': '',
                  'Compliance': '',
                  'Integration': '',
                  'Resilience': ''
                };

                return (
                  <div
                    key={index}
                    className={`border-l-4 ${categoryColors[risk.category as keyof typeof categoryColors] || 'border-[#f59e0b]'} pl-4 pr-4 py-4 bg-black bg-opacity-40 rounded-r`}
                  >
                    {/* Risk Category Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{categoryIcons[risk.category as keyof typeof categoryIcons]}</span>
                        <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider">
                          {risk.category}
                        </span>
                        <span className="text-xs opacity-50">• Score: {risk.relevanceScore}</span>
                      </div>
                      <span className="text-xs opacity-40">{risk.filingDate}</span>
                    </div>

                    {/* Direct Quote with Highlighted Keywords */}
                    <div
                      className="text-sm leading-relaxed opacity-90 mb-3"
                      dangerouslySetInnerHTML={{ __html: highlightedExcerpt }}
                    />

                    {/* Sales Angle */}
                    <div className="bg-[#10b981] bg-opacity-10 border border-[#10b981] border-opacity-30 rounded p-3 mt-3">
                      <div className="text-xs font-bold text-[#10b981] mb-1 uppercase tracking-wide">
                        Sales Angle
                      </div>
                      <div className="text-sm text-[#10b981]">
                        {risk.salesAngle}
                      </div>
                    </div>

                    {/* View in 10-K Link */}
                    {secData.latest10K && (
                      <div className="mt-3 text-xs opacity-40">
                        <a
                          href={getFilingURL(secData.cik, secData.latest10K.accessionNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-[#10b981]"
                        >
                          View Full 10-K Risk Factors →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}

            {secData.processedRisks.filter(risk => categoryFilter === 'All' || risk.category === categoryFilter).length === 0 && (
              <div className="text-center py-8 text-sm opacity-60">
                No risks found in this category
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION C: Legal Proceedings (Enhanced with Financial Context) */}
      {secData.legalProceedings.length > 0 && (
        <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
          <div className="bg-[var(--dark-slate)] px-6 py-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              LEGAL EXPOSURE INTELLIGENCE
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Financial context and IT-relevant litigation from SEC filings
            </p>
          </div>

          {/* Total Legal Exposure Summary */}
          {secData.legalExposure && (
            <div className="px-6 pt-6 pb-4 border-b border-[var(--border-slate)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Exposure */}
                <div className="bg-black bg-opacity-40 rounded-lg p-4">
                  <div className="text-xs opacity-60 mb-1">Total Legal Exposure</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold text-[#ef4444]">
                      {secData.legalExposure.totalExposureFormatted}
                    </div>
                    {(() => {
                      const riskColors = {
                        'LOW': '',
                        'MEDIUM': '',
                        'HIGH': '',
                        'CRITICAL': ''
                      };
                      return (
                        <span className="text-lg">
                          {riskColors[secData.legalExposure.riskLevel]}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-xs opacity-50 mt-1">
                    Across {secData.legalExposure.totalCases} active {secData.legalExposure.totalCases === 1 ? 'case' : 'cases'}
                  </div>
                  {secData.legalExposure.isMaterialRisk && secData.legalExposure.revenuePercentage && (
                    <div className="mt-2 text-xs font-bold text-[#ef4444] bg-[#ef4444] bg-opacity-10 px-2 py-1 rounded">
                      MATERIAL RISK: {secData.legalExposure.revenuePercentage.toFixed(1)}% of annual revenue
                    </div>
                  )}
                </div>

                {/* IT-Related Cases */}
                <div className="bg-black bg-opacity-40 rounded-lg p-4">
                  <div className="text-xs opacity-60 mb-1">IT-Related Cases</div>
                  <div className="text-2xl font-bold text-[#f59e0b]">
                    {secData.legalExposure.itRelatedCases}
                  </div>
                  <div className="text-xs opacity-50 mt-1">
                    Cybersecurity & technology disputes
                  </div>
                </div>

                {/* Regulatory Actions */}
                <div className="bg-black bg-opacity-40 rounded-lg p-4">
                  <div className="text-xs opacity-60 mb-1">Regulatory Actions</div>
                  <div className="text-2xl font-bold text-[#8b5cf6]">
                    {secData.legalExposure.regulatoryCases}
                  </div>
                  <div className="text-xs opacity-50 mt-1">
                    SEC, DOJ, FTC investigations
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IT-Related Cases Section */}
          {secData.legalProceedings.filter(p => p.isITRelated).length > 0 && (
            <div className="px-6 py-4 border-b border-[var(--border-slate)]">
              <h4 className="text-sm font-bold text-[#10b981] mb-3">
                IT-RELATED CASES ({secData.legalProceedings.filter(p => p.isITRelated).length})
              </h4>
              <div className="space-y-3">
                {secData.legalProceedings.filter(p => p.isITRelated).map((proceeding, index) => (
                  <div
                    key={`it-${index}`}
                    className="border-l-4 border-l-[#10b981] bg-black bg-opacity-40 rounded-r-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wide ${getTypeColor(proceeding.type)} px-2 py-1 rounded`}>
                          {getTypeLabel(proceeding.type)}
                        </span>
                        <span className="text-xs font-medium bg-[#64748b] text-white px-2 py-1 rounded">
                          {proceeding.category}
                        </span>
                      </div>
                      {proceeding.amount && (
                        <div className="text-sm font-mono text-[#ef4444] font-bold">
                          {proceeding.amount}
                        </div>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed opacity-90 mb-2">
                      {proceeding.description}
                    </div>
                    <div className="flex items-center gap-3 text-xs opacity-50">
                      {proceeding.filedDate && <span>Filed: {proceeding.filedDate}</span>}
                      <span>•</span>
                      <span>Status: {proceeding.type === 'settlement' ? 'SETTLED' : 'ACTIVE'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regulatory Actions Section */}
          {secData.legalProceedings.filter(p => p.category === 'Regulatory').length > 0 && (
            <div className="px-6 py-4 border-b border-[var(--border-slate)]">
              <h4 className="text-sm font-bold text-[#8b5cf6] mb-3">
                REGULATORY ACTIONS ({secData.legalProceedings.filter(p => p.category === 'Regulatory').length})
              </h4>
              <div className="space-y-3">
                {secData.legalProceedings.filter(p => p.category === 'Regulatory').map((proceeding, index) => (
                  <div
                    key={`reg-${index}`}
                    className="border-l-4 border-l-[#8b5cf6] bg-black bg-opacity-40 rounded-r-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wide ${getTypeColor(proceeding.type)} px-2 py-1 rounded`}>
                          {getTypeLabel(proceeding.type)}
                        </span>
                        {proceeding.isITRelated && (
                          <span className="text-xs font-medium bg-[#10b981] text-black px-2 py-1 rounded">
                            IT-RELATED
                          </span>
                        )}
                      </div>
                      {proceeding.amount && (
                        <div className="text-sm font-mono text-[#ef4444] font-bold">
                          {proceeding.amount}
                        </div>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed opacity-90 mb-2">
                      {proceeding.description}
                    </div>
                    <div className="flex items-center gap-3 text-xs opacity-50">
                      {proceeding.filedDate && <span>Filed: {proceeding.filedDate}</span>}
                      <span>•</span>
                      <span>Status: {proceeding.type === 'settlement' ? 'SETTLED' : 'ACTIVE'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Other Cases */}
          {secData.legalProceedings.filter(p => !p.isITRelated && p.category !== 'Regulatory').length > 0 && (
            <div className="px-6 py-4">
              <h4 className="text-sm font-bold opacity-70 mb-3">
                OTHER CASES ({secData.legalProceedings.filter(p => !p.isITRelated && p.category !== 'Regulatory').length})
              </h4>
              <div className="space-y-3">
                {secData.legalProceedings.filter(p => !p.isITRelated && p.category !== 'Regulatory').map((proceeding, index) => (
                  <div
                    key={`other-${index}`}
                    className="border border-[var(--border-slate)] bg-black bg-opacity-40 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wide ${getTypeColor(proceeding.type)} px-2 py-1 rounded`}>
                          {getTypeLabel(proceeding.type)}
                        </span>
                        <span className="text-xs font-medium bg-[#64748b] text-white px-2 py-1 rounded">
                          {proceeding.category}
                        </span>
                      </div>
                      {proceeding.amount && (
                        <div className="text-sm font-mono text-[#ef4444] font-bold">
                          {proceeding.amount}
                        </div>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed opacity-90 mb-2">
                      {proceeding.description}
                    </div>
                    <div className="flex items-center gap-3 text-xs opacity-50">
                      {proceeding.filedDate && <span>Filed: {proceeding.filedDate}</span>}
                      <span>•</span>
                      <span>Status: {proceeding.type === 'settlement' ? 'SETTLED' : 'ACTIVE'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reference link */}
          {secData.latest10K && (
            <div className="px-6 py-3 bg-[var(--darker-slate)] text-xs opacity-40 border-t border-[var(--border-slate)]">
              Last updated: {secData.latest10K.filingDate} •{' '}
              <a
                href={getFilingURL(secData.cik, secData.latest10K.accessionNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#10b981]"
              >
                View full filing
              </a>
            </div>
          )}
        </div>
      )}

      {/* Empty state for no legal/risk data */}
      {secData.legalProceedings.length === 0 && secData.riskFactors.length === 0 && (
        <div className="border border-[var(--border-slate)] rounded-lg p-8 text-center bg-[var(--dark-slate)] bg-opacity-20">
          <div className="text-sm opacity-60">No legal proceedings or risk factors extracted</div>
          <div className="text-xs opacity-40 mt-2">Filing data may require manual review</div>
        </div>
      )}
    </div>
  );
}
