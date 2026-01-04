'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface StockData {
  date: string;
  close: number;
}

interface FinancialCoreProps {
  companyName: string;
  ticker?: string;
}

export default function FinancialCore({ companyName, ticker }: FinancialCoreProps) {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [peRatio, setPeRatio] = useState<string>('--');
  const [marketCap, setMarketCap] = useState<string>('--');
  const [healthScore, setHealthScore] = useState<number>(75);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);

      // Fetch stock data
      if (ticker) {
        try {
          const stockRes = await fetch('/api/stock-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker }),
          });

          if (stockRes.ok) {
            const data = await stockRes.json();
            if (data.data && data.data.length > 0) {
              setStockData(data.data.map((item: any) => ({
                date: item.date,
                close: item.close,
              })));
            }
          }
        } catch (err) {
          console.error('Error fetching stock data:', err);
        }
      }

      // Mock P/E and Market Cap (would come from financial API)
      setPeRatio('24.5');
      setMarketCap('$12.4B');
      setHealthScore(75);

      setLoading(false);
    };

    fetchFinancialData();
  }, [companyName, ticker]);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Healthy', color: '#10b981' };
    if (score >= 60) return { label: 'Stable', color: '#3b82f6' };
    return { label: 'At Risk', color: '#ef4444' };
  };

  const healthStatus = getHealthStatus(healthScore);

  // Calculate gradient for area chart
  const minPrice = stockData.length > 0 ? Math.min(...stockData.map(d => d.close)) : 0;
  const maxPrice = stockData.length > 0 ? Math.max(...stockData.map(d => d.close)) : 0;
  const currentPrice = stockData.length > 0 ? stockData[stockData.length - 1].close : 0;
  const startPrice = stockData.length > 0 ? stockData[0].close : 0;
  const isPositive = currentPrice >= startPrice;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Stock Chart */}
      <div className="bg-black border border-[#333] rounded-lg p-6 mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">1-Year Performance</h3>

        {stockData.length > 0 ? (
          <>
            {/* Current Price */}
            <div className="mb-4">
              <div className="text-3xl font-mono font-bold text-white">
                ${currentPrice.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {isPositive ? '+' : ''}{((currentPrice - startPrice) / startPrice * 100).toFixed(2)}%
              </div>
            </div>

            {/* Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#333' }}
                    tickLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#333' }}
                    tickLine={false}
                    width={40}
                    domain={[minPrice * 0.95, maxPrice * 1.05]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    fill="url(#stockGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            {loading ? 'Loading chart...' : 'No stock data available'}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black border border-[#333] rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">P/E Ratio</div>
          <div className="text-2xl font-mono font-bold text-white">{peRatio}</div>
        </div>
        <div className="bg-black border border-[#333] rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Market Cap</div>
          <div className="text-2xl font-mono font-bold text-white">{marketCap}</div>
        </div>
      </div>

      {/* Health Score Gauge */}
      <div className="bg-black border border-[#333] rounded-lg p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Health Score</h3>

        <div className="flex flex-col items-center">
          {/* Circular Gauge */}
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#333"
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={healthStatus.color}
                strokeWidth="12"
                strokeDasharray={`${(healthScore / 100) * 440} 440`}
                strokeLinecap="round"
              />
            </svg>
            {/* Score in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white">{healthScore}</div>
              <div className="text-xs text-gray-500">/100</div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${healthStatus.color}20`, color: healthStatus.color }}
          >
            {healthStatus.label}
          </div>

          {/* Metrics */}
          <div className="w-full mt-6 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Debt Ratio</span>
              <span className="font-mono text-white">0.45</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Current Ratio</span>
              <span className="font-mono text-white">2.1</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>ROE</span>
              <span className="font-mono text-white">18%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
