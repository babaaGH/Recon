'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface JobData {
  department: string;
  count: number;
}

interface HiringIntelligenceProps {
  companyName: string;
}

export default function HiringIntelligence({ companyName }: HiringIntelligenceProps) {
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch('/api/hiring-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (!response.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Transform data for chart
        const chartData: JobData[] = [
          { department: 'Engineering', count: data.engineering || 0 },
          { department: 'Sales', count: data.sales || 0 },
          { department: 'Marketing', count: data.marketing || 0 },
        ];

        setJobData(chartData);
      } catch (err) {
        console.error('Error fetching hiring intelligence:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [companyName]);

  // Monochrome blue palette
  const BLUE_COLORS = ['#60a5fa', '#3b82f6', '#2563eb'];

  const totalJobs = jobData.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
        <div className="bg-[var(--dark-slate)] px-6 py-4 border-b border-[var(--border-slate)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Hiring Intelligence
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Active job postings by department
          </p>
        </div>
        <div className="p-6 bg-black bg-opacity-30 text-center">
          <div className="text-sm text-gray-400">[ ANALYZING JOB POSTINGS... ]</div>
        </div>
      </div>
    );
  }

  if (error || totalJobs === 0) {
    return (
      <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
        <div className="bg-[var(--dark-slate)] px-6 py-4 border-b border-[var(--border-slate)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Hiring Intelligence
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Active job postings by department
          </p>
        </div>
        <div className="p-6 bg-black bg-opacity-30 text-center">
          <div className="text-sm text-gray-400">NO DATA AVAILABLE</div>
          <div className="text-xs text-gray-500 mt-2">
            {error ? 'API unavailable' : 'No active job postings found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-slate)] rounded-lg overflow-hidden bg-[var(--dark-slate)] bg-opacity-20">
      <div className="bg-[var(--dark-slate)] px-6 py-4 border-b border-[var(--border-slate)]">
        <h3 className="text-base font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Hiring Intelligence
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Active job postings by department
        </p>
      </div>

      <div className="p-6 bg-black bg-opacity-30">
        {/* Total Count */}
        <div className="mb-6 text-center bg-[#007AFF] bg-opacity-10 rounded-lg py-4 border border-[#007AFF] border-opacity-20">
          <div className="text-4xl font-mono font-bold text-[#007AFF]">
            {totalJobs}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-2">
            Total Open Positions
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="h-40 mb-4 bg-black bg-opacity-40 rounded-lg p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <XAxis
                dataKey="department"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                width={25}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {jobData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BLUE_COLORS[index % BLUE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Breakdown */}
        <div className="space-y-2">
          {jobData.map((dept, index) => (
            <div key={dept.department} className="flex items-center justify-between p-3 rounded bg-black bg-opacity-40 hover:bg-opacity-60 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: BLUE_COLORS[index % BLUE_COLORS.length] }}
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">{dept.department}</span>
              </div>
              <div className="font-mono text-lg font-bold" style={{ color: BLUE_COLORS[index % BLUE_COLORS.length] }}>
                {dept.count}
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 rounded bg-[#007AFF] bg-opacity-10 border border-[#007AFF] border-opacity-20">
          <div className="text-xs text-gray-300 leading-relaxed">
            <strong className="text-[#007AFF]">Growth Signal:</strong>{' '}
            {jobData.reduce((max, dept) => max.count > dept.count ? max : dept).department} is actively hiring
            {totalJobs > 10 ? ', indicating strong growth momentum' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
