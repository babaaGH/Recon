'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface JobData {
  department: string;
  count: number;
}

interface JobPosition {
  title: string;
  department: string;
  location: string;
  postedDate: string;
  level: string;
}

interface HiringIntelligenceProps {
  companyName: string;
}

export default function HiringIntelligence({ companyName }: HiringIntelligenceProps) {
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/hiring-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (!response.ok) {
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

        // Generate mock positions for detail view
        const mockPositions: JobPosition[] = [];

        // Engineering positions
        const engTitles = ['Senior Software Engineer', 'DevOps Engineer', 'Frontend Developer', 'Backend Engineer', 'Tech Lead'];
        for (let i = 0; i < Math.min(data.engineering || 0, 5); i++) {
          mockPositions.push({
            title: engTitles[i % engTitles.length],
            department: 'Engineering',
            location: ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX'][i % 4],
            postedDate: `${Math.floor(Math.random() * 30) + 1} days ago`,
            level: ['Senior', 'Mid-Level', 'Lead'][i % 3],
          });
        }

        // Sales positions
        const salesTitles = ['Account Executive', 'Sales Manager', 'Business Development Rep', 'Sales Director'];
        for (let i = 0; i < Math.min(data.sales || 0, 4); i++) {
          mockPositions.push({
            title: salesTitles[i % salesTitles.length],
            department: 'Sales',
            location: ['Remote', 'Chicago, IL', 'Boston, MA'][i % 3],
            postedDate: `${Math.floor(Math.random() * 30) + 1} days ago`,
            level: ['Senior', 'Mid-Level'][i % 2],
          });
        }

        // Marketing positions
        const mktTitles = ['Content Marketing Manager', 'Growth Marketing Lead', 'Digital Marketing Specialist'];
        for (let i = 0; i < Math.min(data.marketing || 0, 3); i++) {
          mockPositions.push({
            title: mktTitles[i % mktTitles.length],
            department: 'Marketing',
            location: ['Remote', 'Los Angeles, CA'][i % 2],
            postedDate: `${Math.floor(Math.random() * 30) + 1} days ago`,
            level: ['Senior', 'Mid-Level'][i % 2],
          });
        }

        setPositions(mockPositions);
      } catch (err) {
        console.error('Error fetching hiring intelligence:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [companyName]);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const totalJobs = jobData.reduce((sum, item) => sum + item.count, 0);

  // Calculate hiring status
  const getHiringStatus = () => {
    if (totalJobs > 50) return { label: 'RAPID GROWTH', color: '#10b981' };
    if (totalJobs > 20) return { label: 'ACTIVELY HIRING', color: '#3b82f6' };
    if (totalJobs > 0) return { label: 'HIRING', color: '#f59e0b' };
    return { label: 'STABLE', color: '#6b7280' };
  };

  const hiringStatus = getHiringStatus();

  if (loading) {
    return (
      <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40">
        <div className="label-caps opacity-60 mb-2">Hiring Intelligence</div>
        <div className="text-sm opacity-60">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Collapsed Summary - Clickable */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="border border-[var(--border-primary)] rounded-lg p-4 bg-black bg-opacity-40 hover:border-[#007AFF] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Score & Status */}
          <div>
            <div className="label-caps opacity-60 mb-1">Hiring Activity</div>
            <div className="font-mono-data text-3xl text-white" style={{ letterSpacing: '0.02em' }}>
              {totalJobs}
            </div>
            <div className="mt-2">
              <span
                className="inline-block px-3 py-1 rounded text-xs font-ui font-bold"
                style={{
                  backgroundColor: `${hiringStatus.color}20`,
                  color: hiringStatus.color
                }}
              >
                {hiringStatus.label}
              </span>
            </div>
          </div>

          {/* Middle: 3 Categories */}
          <div className="flex-1">
            <div className="label-caps opacity-60 mb-2">By Department</div>
            <div className="space-y-1">
              {jobData.map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{dept.department}</span>
                  <span className="font-mono font-semibold text-white">{dept.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Expand Icon */}
          <div className="text-[#007AFF] text-xl">→</div>
        </div>
      </div>

      {/* Modal Overlay - Detailed View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-8"
          style={{ backdropFilter: 'blur(10px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal Container */}
          <div
            className="bg-[#000000] border border-[#333333] rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-[#333333] p-6 flex items-center justify-between">
              <div>
                <h3 className="font-ui text-xl font-semibold text-[#E0E0E0]">
                  Hiring Intelligence
                </h3>
                <p className="font-ui text-sm text-[var(--text-secondary)] mt-1">
                  {companyName} • {totalJobs} Open Positions
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
              {/* Summary Stats */}
              <div className="p-6 border-b border-[#333]">
                <div className="grid grid-cols-3 gap-4">
                  {jobData.map((dept, index) => (
                    <div key={dept.department} className="bg-black bg-opacity-40 rounded-lg p-4 text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                        {dept.department}
                      </div>
                      <div className="text-3xl font-mono font-bold text-white">
                        {dept.count}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">positions</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="p-6 border-b border-[#333]">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Department Distribution
                </h4>
                <div className="h-64 bg-black bg-opacity-40 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <XAxis
                        dataKey="department"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={{ stroke: '#333' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={{ stroke: '#333' }}
                        tickLine={false}
                        width={40}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {jobData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#60a5fa', '#3b82f6', '#2563eb'][index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Job Positions Table */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Open Positions ({positions.length})
                </h4>
                <div className="space-y-2">
                  {positions.map((position, index) => (
                    <div
                      key={index}
                      className="border border-[#333] rounded-lg p-4 hover:border-[#007AFF] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-white">{position.title}</h5>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                              style={{
                                backgroundColor: position.department === 'Engineering' ? '#60a5fa20' : position.department === 'Sales' ? '#3b82f620' : '#2563eb20',
                                color: position.department === 'Engineering' ? '#60a5fa' : position.department === 'Sales' ? '#3b82f6' : '#2563eb'
                              }}
                            >
                              {position.department}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-500 bg-opacity-20 text-gray-400">
                              {position.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>📍 {position.location}</span>
                            <span>•</span>
                            <span>Posted {position.postedDate}</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[#007AFF] bg-opacity-10 text-[#007AFF] text-xs font-bold uppercase tracking-wide rounded hover:bg-opacity-20 transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {positions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No positions available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
