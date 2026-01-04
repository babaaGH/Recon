'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

interface StockDataPoint {
  date: string;
  timestamp: number;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface StockChartProps {
  ticker: string;
  data: StockDataPoint[];
  loading?: boolean;
}

export default function StockChart({ ticker, data, loading }: StockChartProps) {
  if (loading) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-8 bg-black text-center">
        <div className="label-caps opacity-60">[ LOADING STOCK DATA... ]</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-8 bg-black text-center">
        <div className="font-ui text-sm text-[var(--text-secondary)]">Stock data not available</div>
      </div>
    );
  }

  // Format date to show months
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Format price with $ and 2 decimals
  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Calculate price change
  const firstPrice = data[0]?.close || 0;
  const lastPrice = data[data.length - 1]?.close || 0;
  const priceChange = lastPrice - firstPrice;
  const percentChange = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  // Custom tooltip with 2026 Fintech styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="glass-dropdown rounded-lg p-3">
          <p className="text-xs font-ui text-[var(--text-secondary)] mb-1">
            {new Date(dataPoint.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="financial-data text-[#007AFF]">
            {formatPrice(dataPoint.close)}
          </p>
          <div className="text-xs font-ui text-[var(--text-muted)] mt-2 space-y-0.5">
            <div>High: <span className="font-mono-data">{formatPrice(dataPoint.high)}</span></div>
            <div>Low: <span className="font-mono-data">{formatPrice(dataPoint.low)}</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-black">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-primary)]">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-lg font-ui font-semibold text-[var(--text-primary)]">
              {ticker} Stock Performance
            </h3>
            <p className="label-caps mt-1">
              1-Year Historical Price
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono-data text-[#007AFF] font-bold" style={{letterSpacing: '0.02em'}}>
              {formatPrice(lastPrice)}
            </div>
            <div className={`font-mono-data text-sm font-medium mt-1 ${isPositive ? 'text-[var(--accent-cyan)]' : 'text-[var(--status-critical)]'}`} style={{letterSpacing: '0.02em'}}>
              {isPositive ? '+' : ''}{formatPrice(priceChange)} ({isPositive ? '+' : ''}{percentChange}%)
            </div>
          </div>
        </div>
      </div>

      {/* Chart - 2026 Fintech Hardened */}
      <div className="p-6 bg-black">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#007AFF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="none"
              tick={{ fill: '#888888', fontSize: 11, fontFamily: 'Inter' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={50}
              axisLine={false}
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={formatPrice}
              stroke="none"
              tick={{ fill: '#888888', fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: '0.02em' }}
              tickLine={false}
              width={70}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#007AFF', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#007AFF"
              strokeWidth={3}
              fill="url(#stockGradient)"
              dot={false}
              activeDot={{ r: 6, fill: '#007AFF', stroke: '#000', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
