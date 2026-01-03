'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface QuarterlyRevenue {
  date: string;
  period: string;
  revenue: number;
  calendarYear: string;
}

interface RevenueData {
  quarters: QuarterlyRevenue[];
  yoyGrowth: number | null;
}

interface RevenueChartProps {
  companyName: string;
}

export default function RevenueChart({ companyName }: RevenueChartProps) {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (cancelled) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/revenue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company: companyName }),
        });

        if (cancelled) return;

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load revenue data');
          setRevenueData(null);
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setRevenueData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load revenue data');
          setRevenueData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [companyName]);

  // Format revenue for display (billions/millions)
  const formatRevenue = (revenue: number): string => {
    if (revenue >= 1_000_000_000) {
      return `$${(revenue / 1_000_000_000).toFixed(2)}B`;
    } else if (revenue >= 1_000_000) {
      return `$${(revenue / 1_000_000).toFixed(2)}M`;
    }
    return `$${revenue.toLocaleString()}`;
  };

  // Format quarter label
  const formatQuarter = (item: QuarterlyRevenue): string => {
    return `${item.period} ${item.calendarYear}`;
  };

  // Determine scale (Billions or Millions)
  const maxRevenue = Math.max(...(revenueData?.quarters.map(q => q.revenue) || [0]));
  const useMillions = maxRevenue < 1_000_000_000;
  const scaleDivisor = useMillions ? 1_000_000 : 1_000_000_000;
  const scaleLabel = useMillions ? 'M' : 'B';

  // Prepare chart data
  const chartData = revenueData?.quarters.map(q => ({
    quarter: formatQuarter(q),
    revenue: q.revenue / scaleDivisor,
    displayRevenue: formatRevenue(q.revenue)
  })) || [];

  // Calculate growth indicator (compare latest to first)
  let growthColor = '#10b981'; // Default success green
  let isGrowing = true;

  if (chartData.length >= 2) {
    const firstRevenue = chartData[0].revenue;
    const lastRevenue = chartData[chartData.length - 1].revenue;

    if (lastRevenue < firstRevenue) {
      growthColor = '#ef4444'; // Danger red for declining
      isGrowing = false;
    } else {
      growthColor = '#10b981'; // Success green for growing
      isGrowing = true;
    }
  }

  if (loading) {
    return (
      <div className="border border-[var(--border-slate)] rounded-lg p-8 text-center bg-[var(--dark-slate)] bg-opacity-20">
        <div className="text-sm opacity-60">[ LOADING REVENUE DATA... ]</div>
      </div>
    );
  }

  if (error || !revenueData) {
    return (
      <div className="border border-[var(--border-slate)] rounded-lg p-8 text-center bg-[var(--dark-slate)] bg-opacity-20">
        <div className="text-sm opacity-60">
          ✗ DATA UNAVAILABLE
        </div>
        {error && (
          <div className="text-xs opacity-40 mt-2">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
      {/* Header with YoY Growth Badge */}
      <div className="bg-[var(--dark-slate)] px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-medium opacity-90">
          Quarterly Revenue Trend
        </h3>
        {revenueData.yoyGrowth !== null && (
          <div className={`px-4 py-2 rounded-lg font-mono text-sm font-bold ${
            revenueData.yoyGrowth >= 0
              ? 'bg-[#064e3b] border border-[#10b981] text-[#10b981]'
              : 'bg-[#7f1d1d] border border-[#ef4444] text-[#ef4444]'
          }`}>
            YoY Growth: {revenueData.yoyGrowth >= 0 ? '+' : ''}{revenueData.yoyGrowth.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-slate)" opacity={0.3} />
            <XAxis
              dataKey="quarter"
              stroke="#9ca3af"
              style={{ fontSize: '12px', fontFamily: 'Courier New, monospace' }}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke={growthColor}
              style={{ fontSize: '12px', fontFamily: 'Courier New, monospace' }}
              tickFormatter={(value) => `$${value.toFixed(1)}${scaleLabel}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                border: '1px solid var(--border-slate)',
                borderRadius: '4px',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px'
              }}
              labelStyle={{ color: growthColor }}
              formatter={(value: any, name?: string, props?: any) => [props?.payload?.displayRevenue || value, 'Revenue']}
            />
            <Bar
              dataKey="revenue"
              fill={growthColor}
              opacity={0.8}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
