import { NextRequest, NextResponse } from 'next/server';

interface LeadershipHire {
  name: string;
  title: string;
  level: 'C-Suite' | 'SVP' | 'VP' | 'Head';
  department: string;
  joinedDate: string;
  previousCompany?: string;
  linkedinUrl?: string;
}

// Generate realistic mock leadership hire data
function generateMockLeadershipData(companyName: string): LeadershipHire[] {
  const seed = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const executiveNames = [
    'Sarah Chen', 'Michael Rodriguez', 'Jennifer Kim', 'David Thompson', 'Amanda Foster',
    'Robert Martinez', 'Emily Watson', 'James Patterson', 'Lisa Anderson', 'Christopher Lee',
    'Maria Garcia', 'Daniel Brown', 'Rachel Green', 'Kevin O\'Brien', 'Nicole Davis'
  ];

  const cSuiteTitles = [
    'Chief Technology Officer',
    'Chief Financial Officer',
    'Chief Operating Officer',
    'Chief Marketing Officer',
    'Chief Product Officer',
    'Chief Revenue Officer'
  ];

  const svpTitles = [
    'SVP of Engineering',
    'SVP of Sales',
    'SVP of Product',
    'SVP of Operations',
    'SVP of Marketing',
    'SVP of Customer Success'
  ];

  const vpTitles = [
    'VP of Engineering',
    'VP of Sales',
    'VP of Product Management',
    'VP of Business Development',
    'VP of Finance',
    'VP of Marketing',
    'VP of Operations',
    'VP of Data Science'
  ];

  const headTitles = [
    'Head of Engineering',
    'Head of Product',
    'Head of Growth',
    'Head of Design',
    'Head of Analytics',
    'Head of Customer Success'
  ];

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Operations',
    'Product',
    'Finance',
    'Customer Success'
  ];

  const previousCompanies = [
    'Google',
    'Meta',
    'Amazon',
    'Microsoft',
    'Apple',
    'Salesforce',
    'Adobe',
    'Oracle',
    'IBM',
    'Netflix',
    'Stripe',
    'Airbnb',
    'Uber',
    'LinkedIn',
    'Twitter'
  ];

  const hires: LeadershipHire[] = [];

  // Generate 2-3 C-Suite hires
  const cSuiteCount = 2 + (seed % 2);
  for (let i = 0; i < cSuiteCount; i++) {
    const nameIndex = (seed + i * 7) % executiveNames.length;
    const titleIndex = (seed + i * 5) % cSuiteTitles.length;
    const deptIndex = (seed + i * 3) % departments.length;
    const prevCompIndex = (seed + i * 11) % previousCompanies.length;
    const daysAgo = 30 + ((seed + i * 13) % 120);

    hires.push({
      name: executiveNames[nameIndex],
      title: cSuiteTitles[titleIndex],
      level: 'C-Suite',
      department: departments[deptIndex],
      joinedDate: `${daysAgo} days ago`,
      previousCompany: previousCompanies[prevCompIndex],
      linkedinUrl: `https://linkedin.com/in/${executiveNames[nameIndex].toLowerCase().replace(' ', '-')}`
    });
  }

  // Generate 2-4 SVP hires
  const svpCount = 2 + (seed % 3);
  for (let i = 0; i < svpCount; i++) {
    const nameIndex = (seed + i * 9 + 100) % executiveNames.length;
    const titleIndex = (seed + i * 7) % svpTitles.length;
    const deptIndex = (seed + i * 5) % departments.length;
    const prevCompIndex = (seed + i * 17) % previousCompanies.length;
    const daysAgo = 20 + ((seed + i * 19) % 100);

    hires.push({
      name: executiveNames[nameIndex],
      title: svpTitles[titleIndex],
      level: 'SVP',
      department: departments[deptIndex],
      joinedDate: `${daysAgo} days ago`,
      previousCompany: previousCompanies[prevCompIndex],
      linkedinUrl: `https://linkedin.com/in/${executiveNames[nameIndex].toLowerCase().replace(' ', '-')}`
    });
  }

  // Generate 3-5 VP hires
  const vpCount = 3 + (seed % 3);
  for (let i = 0; i < vpCount; i++) {
    const nameIndex = (seed + i * 11 + 200) % executiveNames.length;
    const titleIndex = (seed + i * 9) % vpTitles.length;
    const deptIndex = (seed + i * 7) % departments.length;
    const prevCompIndex = (seed + i * 23) % previousCompanies.length;
    const daysAgo = 10 + ((seed + i * 29) % 90);

    hires.push({
      name: executiveNames[nameIndex],
      title: vpTitles[titleIndex],
      level: 'VP',
      department: departments[deptIndex],
      joinedDate: `${daysAgo} days ago`,
      previousCompany: previousCompanies[prevCompIndex],
      linkedinUrl: `https://linkedin.com/in/${executiveNames[nameIndex].toLowerCase().replace(' ', '-')}`
    });
  }

  // Generate 1-3 Head-level hires
  const headCount = 1 + (seed % 3);
  for (let i = 0; i < headCount; i++) {
    const nameIndex = (seed + i * 13 + 300) % executiveNames.length;
    const titleIndex = (seed + i * 11) % headTitles.length;
    const deptIndex = (seed + i * 9) % departments.length;
    const prevCompIndex = (seed + i * 31) % previousCompanies.length;
    const daysAgo = 5 + ((seed + i * 37) % 80);

    hires.push({
      name: executiveNames[nameIndex],
      title: headTitles[titleIndex],
      level: 'Head',
      department: departments[deptIndex],
      joinedDate: `${daysAgo} days ago`,
      previousCompany: previousCompanies[prevCompIndex],
      linkedinUrl: `https://linkedin.com/in/${executiveNames[nameIndex].toLowerCase().replace(' ', '-')}`
    });
  }

  // Sort by most recent first (lower days ago = more recent)
  hires.sort((a, b) => {
    const daysA = parseInt(a.joinedDate);
    const daysB = parseInt(b.joinedDate);
    return daysA - daysB;
  });

  return hires;
}

export async function POST(request: NextRequest) {
  let companyName = '';

  try {
    const body = await request.json();
    companyName = body.companyName || '';

    // For now, return mock data
    // In production, this would integrate with LinkedIn API, company databases, etc.
    const hires = generateMockLeadershipData(companyName);

    return NextResponse.json({
      hires,
      total: hires.length
    });
  } catch (error) {
    console.error('Error in leadership-changes API:', error);

    // Return mock data even on error
    const hires = generateMockLeadershipData(companyName || 'Unknown Company');

    return NextResponse.json({
      hires,
      total: hires.length
    });
  }
}
