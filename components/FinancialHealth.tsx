'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import SkeletonLoader from './SkeletonLoader';

interface FinancialMetric {
  name: string;
  value: string;
  status: 'warning' | 'success' | 'neutral';
  reason: string;
}

interface FinancialHealthProps {
  companyName: string;
  metrics?: FinancialMetric[];
}

// Generate sample sparkline data
function generateSparklineData() {
  const data = [];
  const baseValue = 75;
  for (let i = 0; i < 26; i++) { // 6 months of weeks
    data.push({
      week: i,
      score: baseValue + Math.random() * 15 - 7.5
    });
  }
  return data;
}

// Calculate health score from metrics
function calculateHealthScore(metrics?: FinancialMetric[]): number {
  if (!metrics || metrics.length === 0) return 75;

  const successCount = metrics.filter(m => m.status === 'success').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;

  return Math.round((successCount / metrics.length) * 100);
}

export default function FinancialHealth({ companyName, metrics }: FinancialHealthProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sparklineData, setSparklineData] = useState(generateSparklineData());

  const healthScore = calculateHealthScore(metrics);
  const status = healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'Stable' : 'At Risk';
  const statusColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#fb923c' : '#ef4444';

  // Sample default metrics if none provided
  const defaultMetrics: FinancialMetric[] = [
    { name: 'Debt-to-Equity Ratio', value: '0.65', status: 'success', reason: 'Below industry average of 0.8' },
    { name: 'Current Ratio', value: '2.1', status: 'success', reason: 'Strong liquidity position' },
    { name: 'Operating Cash Flow', value: '$425M', status: 'success', reason: 'Positive and growing YoY' },
    { name: 'Revenue Growth (YoY)', value: '12%', status: 'warning', reason: 'Below target of 15%' },
    { name: 'EBITDA Margin', value: '18%', status: 'success', reason: 'Above industry average' },
    { name: 'Quick Ratio', value: '1.5', status: 'success', reason: 'Adequate short-term coverage' },
  ];

  const displayMetrics = metrics || defaultMetrics;

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Collapsed Summary */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-[#222222] rounded-lg p-6 bg-[#111111] hover:bg-[#1A1A1A] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Score & Status */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-[#888888] mb-1">Financial Health</div>
            <div className="text-6xl font-bold text-[#E5E5E5] flex items-center">
              {healthScore}
              <span className={`ml-2 ${healthScore >= 80 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                {healthScore >= 80 ? '↑' : '↓'}
              </span>
            </div>
            <div className="mt-1 text-xs text-[#888888]">
              {healthScore >= 80 ? 'Good' : healthScore >= 60 ? 'Fair' : 'Poor'}
            </div>
          </div>

          {/* Middle: Status Breakdown */}
          <div className="flex-1">
            <div className="text-sm font-semibold uppercase tracking-wider text-[#888888] mb-2">Status</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888888]">Rating</span>
                <span className="text-sm font-semibold" style={{ color: statusColor }}>{status}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888888]">Metrics</span>
                <span className="text-sm font-semibold text-[#E5E5E5]">{displayMetrics.length}</span>
              </div>
            </div>
          </div>

          {/* Right: Expand Icon & Timestamp */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-[#007AFF] text-xl">→</div>
            <div className="text-xs text-[#888888]">
              Updated 5 mins ago
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
            className="bg-[#000000] border border-[#333333] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[#222222] p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#E5E5E5]">
                  Financial Audit Trail
                </h3>
                <p className="text-sm text-[#888888] mt-2">
                  Comprehensive financial health analysis
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#888888] hover:text-[#E5E5E5] text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Financial Metrics Table */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <table className="w-full">
                <thead className="border-b border-[#222222]">
                  <tr>
                    <th className="text-left py-3 text-xs uppercase tracking-wider text-[#888888]">Metric</th>
                    <th className="text-left py-3 text-xs uppercase tracking-wider text-[#888888]">Value</th>
                    <th className="text-left py-3 text-xs uppercase tracking-wider text-[#888888]">Status</th>
                    <th className="text-left py-3 text-xs uppercase tracking-wider text-[#888888]">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {displayMetrics.map((metric, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#222222] hover:bg-[#1A1A1A] transition-colors"
                    >
                      {/* Metric Name */}
                      <td className="py-4">
                        <div className="text-sm font-semibold text-[#E5E5E5]">
                          {metric.name}
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4">
                        <div className="text-base font-semibold text-[#E5E5E5]">
                          {metric.value}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        {metric.status === 'success' && (
                          <span className="text-sm font-semibold text-[#30D158]">Positive</span>
                        )}
                        {metric.status === 'warning' && (
                          <span className="text-sm font-semibold text-[#FF9F0A]">Warning</span>
                        )}
                        {metric.status === 'neutral' && (
                          <span className="text-sm font-semibold text-[#FF453A]">Negative</span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-4">
                        <div className="text-sm text-[#888888]">
                          {metric.reason}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
