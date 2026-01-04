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
      <div className="glass-bento rounded-lg overflow-hidden">
        <div className="bg-[var(--dark-slate)] px-6 py-4">
          <h3 className="text-lg font-medium opacity-90">
            HIRING INTELLIGENCE
          </h3>
          <p className="text-xs opacity-50 mt-1">
            Active job postings by department
          </p>
        </div>
        <div className="p-6 text-center">
          <div className="text-sm opacity-60">[ ANALYZING JOB POSTINGS... ]</div>
        </div>
      </div>
    );
  }

  if (error || totalJobs === 0) {
    return (
      <div className="glass-bento rounded-lg overflow-hidden">
        <div className="bg-[var(--dark-slate)] px-6 py-4">
          <h3 className="text-lg font-medium opacity-90">
            HIRING INTELLIGENCE
          </h3>
          <p className="text-xs opacity-50 mt-1">
            Active job postings by department
          </p>
        </div>
        <div className="p-6 text-center">
          <div className="text-sm opacity-60">NO DATA AVAILABLE</div>
          <div className="text-xs opacity-40 mt-2">
            {error ? 'API unavailable' : 'No active job postings found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-bento rounded-lg overflow-hidden">
      <div className="bg-[var(--dark-slate)] px-6 py-4">
        <h3 className="text-lg font-medium opacity-90">
          HIRING INTELLIGENCE
        </h3>
        <p className="text-xs opacity-50 mt-1">
          Active job postings by department
        </p>
      </div>

      <div className="p-6">
        {/* Total Count */}
        <div className="mb-6 text-center">
          <div className="text-3xl font-mono-data font-bold text-[#3b82f6]">
            {totalJobs}
          </div>
          <div className="text-xs opacity-60 uppercase tracking-wider mt-1">
            Total Open Positions
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis
                dataKey="department"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                width={30}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {jobData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BLUE_COLORS[index % BLUE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Breakdown */}
        <div className="mt-6 space-y-3">
          {jobData.map((dept, index) => (
            <div key={dept.department} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: BLUE_COLORS[index % BLUE_COLORS.length] }}
                />
                <span className="text-sm opacity-80">{dept.department}</span>
              </div>
              <div className="font-mono-data text-sm font-semibold" style={{ color: BLUE_COLORS[index % BLUE_COLORS.length] }}>
                {dept.count}
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="mt-6 pt-4 border-t border-[var(--border-slate)]">
          <div className="text-xs opacity-70 leading-relaxed">
            <strong className="text-[#3b82f6]">Hiring Signal:</strong>{' '}
            {jobData.reduce((max, dept) => max.count > dept.count ? max : dept).department} is actively hiring
            {totalJobs > 10 ? ', indicating strong growth momentum' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
