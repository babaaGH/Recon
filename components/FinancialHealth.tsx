'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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
        className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40 hover:border-[#007AFF] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-6">
          {/* Health Score */}
          <div>
            <div className="label-caps opacity-60 mb-1">Health Score</div>
            <div className="font-mono-data text-3xl" style={{ color: statusColor, letterSpacing: '0.02em' }}>
              {healthScore}
            </div>
            <div className="mt-2">
              <span className="inline-block px-3 py-1 rounded text-xs font-ui font-bold" style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor
              }}>
                {status}
              </span>
            </div>
          </div>

          {/* 6-Month Sparkline */}
          <div className="flex-1 max-w-xs">
            <div className="label-caps opacity-60 mb-2">6-Month Trend</div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={statusColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expand Icon */}
          <div className="text-[#007AFF] text-xl">→</div>
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
            <div className="border-b border-[#333333] p-6 flex items-center justify-between">
              <div>
                <h3 className="font-ui text-xl font-semibold text-[#E0E0E0]">
                  Financial Audit Trail
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  Comprehensive financial health analysis
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[#E0E0E0] text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Financial Metrics Table */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <table className="w-full">
                <thead className="border-b border-[#333333]">
                  <tr>
                    <th className="font-ui text-left py-3 label-caps">Metric</th>
                    <th className="font-ui text-left py-3 label-caps">Value</th>
                    <th className="font-ui text-left py-3 label-caps">Status</th>
                    <th className="font-ui text-left py-3 label-caps">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {displayMetrics.map((metric, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#333333] hover:bg-[#007AFF] hover:bg-opacity-5 transition-colors"
                    >
                      {/* Metric Name */}
                      <td className="py-4">
                        <div className="font-ui font-semibold text-[#E0E0E0]">
                          {metric.name}
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4">
                        <div className="font-mono-data text-lg text-[#E0E0E0]" style={{ letterSpacing: '0.02em' }}>
                          {metric.value}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        {metric.status === 'success' && (
                          <span className="font-ui text-sm font-semibold text-[#10b981]">Positive</span>
                        )}
                        {metric.status === 'warning' && (
                          <span className="font-ui text-sm font-semibold text-[#fb923c]">Warning</span>
                        )}
                        {metric.status === 'neutral' && (
                          <span className="font-ui text-sm font-semibold text-[#ef4444]">Negative</span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-4">
                        <div className="font-ui text-sm text-[var(--text-secondary)]">
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
