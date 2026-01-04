'use client';

import { useState } from 'react';

interface SimilarProspect {
  companyName: string;
  cik: string;
  revenue: string;
  region?: string;
  industry: string;
  fitScore: number;
  fitLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  matchReasons: string[];
  riskMatches: string[];
  executiveChanges?: string;
}

interface SimilarProspectsProps {
  companyName: string;
  industry: string;
  revenue: string;
  region: string;
  riskFactors?: string[];
}

export default function SimilarProspects({
  companyName,
  industry,
  revenue,
  region,
  riskFactors = [],
}: SimilarProspectsProps) {
  const [prospects, setProspects] = useState<SimilarProspect[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const findSimilarTargets = async () => {
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/similar-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          industry,
          revenue,
          region,
          riskFactors,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProspects(data.prospects || []);
      }
    } catch (error) {
      console.error('Error finding similar prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFitIcon = (fitLevel: string) => {
    switch (fitLevel) {
      case 'HIGH':
        return '';
      case 'MEDIUM':
        return '';
      case 'LOW':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
      <div className="bg-[var(--dark-slate)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">
              SIMILAR PROSPECTS
            </h3>
            <p className="text-xs opacity-50 mt-1">
              Find lookalike companies to replicate your winning pitch
            </p>
          </div>
          <button
            onClick={findSimilarTargets}
            disabled={loading}
            className="recon-btn px-6 py-3 rounded font-bold uppercase tracking-wide text-sm disabled:opacity-50"
          >
            {loading ? 'ANALYZING...' : 'Find Similar Prospects'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="text-sm opacity-60 mb-2">[ ANALYZING SEC EDGAR DATABASE... ]</div>
              <div className="text-xs opacity-40">Analyzing SIC codes, revenue bands, and risk profiles</div>
            </div>
          )}

          {!loading && prospects.length === 0 && (
            <div className="text-center py-8">
              <div className="text-sm opacity-60">NO SIMILAR PROSPECTS FOUND</div>
              <div className="text-xs opacity-40 mt-2">Try broadening search criteria</div>
            </div>
          )}

          {!loading && prospects.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-6">
                <div className="text-sm opacity-80">
                  Found <span className="font-bold text-[#10b981]">{prospects.length}</span> similar prospects
                  matching {companyName}'s profile
                </div>
                <div className="text-xs opacity-50 mt-1">
                  Same industry • Similar revenue band (±30%) • Comparable risk factors
                </div>
              </div>

              {/* Prospect Cards */}
              {prospects.map((prospect, index) => (
                <div
                  key={index}
                  className="border border-[var(--border-slate)] rounded-lg p-5 bg-black bg-opacity-40 hover:border-[#10b981] transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h4 className="font-bold text-lg">{prospect.companyName}</h4>
                        <div className="text-xs opacity-50 font-mono">CIK: {prospect.cik}</div>
                      </div>
                      <div className="text-sm opacity-70">{prospect.industry}</div>
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wide ${
                      prospect.fitLevel === 'HIGH' ? 'text-[#10b981]' :
                      prospect.fitLevel === 'MEDIUM' ? 'text-[#f59e0b]' :
                      'text-[#ef4444]'
                    }`}>
                      {getFitIcon(prospect.fitLevel)} {prospect.fitLevel} FIT
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Revenue</div>
                      <div className="font-mono text-[#10b981]">{prospect.revenue}</div>
                    </div>
                    {prospect.region && (
                      <div>
                        <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Region</div>
                        <div className="font-mono">{prospect.region}</div>
                      </div>
                    )}
                  </div>

                  {/* Match Reasons */}
                  {prospect.matchReasons.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-2">Why They Match</div>
                      <div className="space-y-1">
                        {prospect.matchReasons.map((reason, idx) => (
                          <div key={idx} className="text-sm opacity-80 flex items-start gap-2">
                            <span className="text-[#10b981] mt-0.5"></span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factor Matches */}
                  {prospect.riskMatches.length > 0 && (
                    <div className="bg-[var(--darker-slate)] rounded p-3 mb-3">
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-2">
                        Shared Pain Points (from 10-K)
                      </div>
                      <div className="space-y-1">
                        {prospect.riskMatches.map((risk, idx) => (
                          <div key={idx} className="text-xs opacity-80 flex items-start gap-2">
                            <span className="text-[#f59e0b]">!</span>
                            <span>{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Executive Changes */}
                  {prospect.executiveChanges && (
                    <div className="border-t border-[var(--border-slate)] pt-3">
                      <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Recent Changes</div>
                      <div className="text-sm text-[#06b6d4]">{prospect.executiveChanges}</div>
                    </div>
                  )}

                  {/* Fit Score */}
                  <div className="border-t border-[var(--border-slate)] pt-3 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="text-xs opacity-60">Similarity Score:</div>
                      <div className="flex-1 bg-[var(--darker-slate)] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            prospect.fitScore >= 80 ? 'bg-[#10b981]' :
                            prospect.fitScore >= 60 ? 'bg-[#f59e0b]' :
                            'bg-[#ef4444]'
                          }`}
                          style={{ width: `${prospect.fitScore}%` }}
                        />
                      </div>
                      <div className="text-xs font-bold font-mono">{prospect.fitScore}%</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Sales Tip */}
              <div className="bg-[#10b981] bg-opacity-10 border border-[#10b981] border-opacity-30 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl"></div>
                  <div>
                    <div className="font-bold text-sm text-[#10b981] mb-1">SALES PLAYBOOK</div>
                    <div className="text-xs opacity-80 leading-relaxed">
                      Use the same pitch deck, case studies, and objection handlers you developed for {companyName}.
                      These companies face identical challenges and buying triggers. Focus on the shared risk factors
                      as your opening hook.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
