'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import Image from 'next/image';

interface JobData {
  department: string;
  count: number;
}

interface TechStack {
  name: string;
  category: string;
}

interface CompanyIntelligenceProps {
  companyName: string;
  industry: string;
  revenue: string;
  logoUrl?: string;
}

export default function CompanyIntelligence({ companyName, industry, revenue, logoUrl }: CompanyIntelligenceProps) {
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [techStack, setTechStack] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch hiring intelligence
      try {
        const hiringRes = await fetch('/api/hiring-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (hiringRes.ok) {
          const data = await hiringRes.json();
          const chartData: JobData[] = [
            { department: 'Eng', count: data.engineering || 0 },
            { department: 'Sales', count: data.sales || 0 },
            { department: 'Ops', count: data.marketing || 0 },
          ];
          setJobData(chartData);
        }
      } catch (err) {
        console.error('Error fetching hiring data:', err);
      }

      // Fetch tech stack
      try {
        const techRes = await fetch('/api/tech-stack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName }),
        });

        if (techRes.ok) {
          const data = await techRes.json();
          setTechStack(data.technologies || []);
        }
      } catch (err) {
        console.error('Error fetching tech stack:', err);
      }

      setLoading(false);
    };

    fetchData();
  }, [companyName]);

  const BLUE_COLORS = ['#60a5fa', '#3b82f6', '#2563eb'];
  const totalJobs = jobData.reduce((sum, item) => sum + item.count, 0);

  // Calculate growth status
  const getGrowthStatus = () => {
    if (totalJobs > 50) return { label: 'RAPID GROWTH', color: '#10b981' };
    if (totalJobs > 20) return { label: 'GROWING', color: '#3b82f6' };
    if (totalJobs > 0) return { label: 'HIRING', color: '#f59e0b' };
    return { label: 'STABLE', color: '#6b7280' };
  };

  const growthStatus = getGrowthStatus();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Card */}
      <div className="relative bg-black border border-[#333] rounded-lg p-6 mb-4">
        {/* RECON Branding - Top Right */}
        <div className="absolute top-4 right-6">
          <div className="text-[#007AFF] text-xs font-bold tracking-[0.3em]">RECON</div>
        </div>

        {/* Company Logo & Name */}
        <div className="flex items-center gap-4 mb-4">
          {logoUrl ? (
            <div className="w-16 h-16 rounded-lg bg-white bg-opacity-5 flex items-center justify-center overflow-hidden">
              <Image src={logoUrl} alt={companyName} width={48} height={48} className="object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[#007AFF] bg-opacity-10 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#007AFF]">{companyName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{companyName}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{industry}</p>
          </div>
        </div>

        {/* Growth Status Badge */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Growth Status</div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${growthStatus.color}20`, color: growthStatus.color }}
          >
            {growthStatus.label}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#007AFF20 transparent' }}>
        {/* Hiring Intelligence */}
        <div className="bg-black border border-[#333] rounded-lg p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Hiring Intelligence</h3>

          {totalJobs > 0 ? (
            <>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-[#007AFF]">{totalJobs}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Open Positions</div>
              </div>

              <div className="h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="department" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} width={25} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {jobData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BLUE_COLORS[index % BLUE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {jobData.map((dept, index) => (
                  <div key={dept.department} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BLUE_COLORS[index] }} />
                      <span className="text-gray-300">{dept.department}</span>
                    </div>
                    <span className="font-mono font-semibold" style={{ color: BLUE_COLORS[index] }}>
                      {dept.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">No active hiring</div>
          )}
        </div>

        {/* Tech Stack */}
        <div className="bg-black border border-[#333] rounded-lg p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Tech Stack</h3>

          {techStack.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {techStack.slice(0, 12).map((tech, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#007AFF] bg-opacity-10 text-[#007AFF] border border-[#007AFF] border-opacity-20"
                >
                  {tech.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">No tech data available</div>
          )}
        </div>

        {/* Revenue Card */}
        <div className="bg-black border border-[#333] rounded-lg p-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Annual Revenue</div>
          <div className="text-2xl font-mono font-bold text-[#10b981]">{revenue}</div>
        </div>
      </div>
    </div>
  );
}
