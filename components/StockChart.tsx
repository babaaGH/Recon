'use client';

import { useState, useEffect } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40">
        <div className="label-caps opacity-60 mb-2">Stock Performance</div>
        <div className="text-sm opacity-60">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40">
        <div className="label-caps opacity-60 mb-2">Stock Performance</div>
        <div className="text-sm text-[var(--text-secondary)]">Stock data not available</div>
      </div>
    );
  }

  // Format price with $ and 2 decimals
  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Format date to show months
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Calculate price change
  const firstPrice = data[0]?.close || 0;
  const lastPrice = data[data.length - 1]?.close || 0;
  const priceChange = lastPrice - firstPrice;
  const percentChange = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  // Calculate high/low for the period
  const high = Math.max(...data.map(d => d.high));
  const low = Math.min(...data.map(d => d.low));

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
    <>
      {/* Collapsed Summary - Clickable */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40 hover:border-[#007AFF] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Ticker & Price */}
          <div>
            <div className="label-caps opacity-60 mb-1">Stock Performance</div>
            <div className="font-mono-data text-3xl text-[#007AFF]" style={{ letterSpacing: '0.02em' }}>
              {formatPrice(lastPrice)}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {ticker}
            </div>
          </div>

          {/* Middle: Change & Stats */}
          <div className="flex-1">
            <div className="label-caps opacity-60 mb-2">1-Year Performance</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Change</span>
                <span className={`font-mono font-semibold ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {isPositive ? '+' : ''}{formatPrice(priceChange)} ({isPositive ? '+' : ''}{percentChange}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">52W High</span>
                <span className="font-mono font-semibold text-white">{formatPrice(high)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">52W Low</span>
                <span className="font-mono font-semibold text-white">{formatPrice(low)}</span>
              </div>
            </div>
          </div>

          {/* Right: Expand Icon */}
          <div className="text-[#007AFF] text-xl">→</div>
        </div>
      </div>

      {/* Modal Overlay - Full Chart */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-8"
          style={{ backdropFilter: 'blur(10px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal Container */}
          <div
            className="bg-[#000000] border border-[#333333] rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[#333333] p-6 flex items-center justify-between">
              <div>
                <h3 className="font-ui text-xl font-semibold text-[#E0E0E0]">
                  {ticker} Stock Performance
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  1-Year Historical Price
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
              {/* Price Stats */}
              <div className="p-6 border-b border-[#333]">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Current Price
                    </div>
                    <div className="text-3xl font-mono font-bold text-[#007AFF]">
                      {formatPrice(lastPrice)}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Change
                    </div>
                    <div className={`text-3xl font-mono font-bold ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {isPositive ? '+' : ''}{percentChange}%
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      52W High
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {formatPrice(high)}
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      52W Low
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                      {formatPrice(low)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Chart */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Price History
                </h4>
                <div className="bg-black bg-opacity-40 rounded-lg p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#007AFF" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
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
                        width={80}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
