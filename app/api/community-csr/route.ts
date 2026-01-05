import { NextRequest, NextResponse } from 'next/server';

interface CSRInitiative {
  title: string;
  category: 'Environment' | 'Education' | 'Diversity' | 'Community' | 'Philanthropy' | 'Social Impact';
  description: string;
  impact: string;
  launchedDate: string;
  status: 'Active' | 'Completed' | 'Ongoing';
}

// Generate realistic mock CSR initiatives data
function generateMockCSRData(companyName: string): CSRInitiative[] {
  const seed = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const environmentInitiatives = [
    {
      title: 'Carbon Neutrality by 2030',
      description: 'Comprehensive program to achieve net-zero carbon emissions across all operations, including renewable energy transition and carbon offset investments.',
      impact: '50% reduction in carbon footprint achieved'
    },
    {
      title: 'E-Waste Recycling Program',
      description: 'Partnership with certified recyclers to responsibly dispose of electronic waste and refurbish devices for donation to schools.',
      impact: '100,000+ devices recycled and repurposed'
    },
    {
      title: 'Sustainable Supply Chain Initiative',
      description: 'Working with suppliers to implement sustainable practices and reduce environmental impact throughout the supply chain.',
      impact: '75% of suppliers now meet sustainability standards'
    }
  ];

  const educationInitiatives = [
    {
      title: 'Tech Education Scholarship Fund',
      description: 'Providing scholarships and mentorship to underrepresented students pursuing STEM degrees at partner universities.',
      impact: '500+ students supported annually'
    },
    {
      title: 'Coding Bootcamp Partnership',
      description: 'Funding free coding bootcamps in underserved communities to create pathways into tech careers.',
      impact: '2,000+ graduates placed in tech roles'
    },
    {
      title: 'K-12 STEM Programs',
      description: 'Supporting computer science education in public schools through curriculum development and teacher training.',
      impact: '50,000+ students reached in 200+ schools'
    }
  ];

  const diversityInitiatives = [
    {
      title: 'Diversity & Inclusion Task Force',
      description: 'Company-wide initiative to increase representation and create an inclusive workplace culture through hiring, retention, and development programs.',
      impact: '40% increase in diverse leadership representation'
    },
    {
      title: 'Women in Tech Mentorship',
      description: 'Mentorship program connecting women employees with senior leaders to support career development and advancement.',
      impact: '300+ mentorship pairs annually'
    },
    {
      title: 'Neurodiversity Hiring Program',
      description: 'Specialized recruitment and onboarding process designed to attract and support neurodiverse talent.',
      impact: '100+ neurodiverse employees hired'
    }
  ];

  const communityInitiatives = [
    {
      title: 'Employee Volunteer Program',
      description: 'Providing paid volunteer time off and organizing company-wide service days to support local communities.',
      impact: '10,000+ volunteer hours contributed annually'
    },
    {
      title: 'Small Business Technology Grants',
      description: 'Providing free technology solutions and consulting to small businesses in underserved areas.',
      impact: '$5M in technology grants distributed'
    },
    {
      title: 'Community Innovation Labs',
      description: 'Opening free co-working spaces and providing resources for local entrepreneurs and startups.',
      impact: '200+ startups supported'
    }
  ];

  const philanthropyInitiatives = [
    {
      title: 'Disaster Relief Fund',
      description: 'Corporate matching program for employee donations to disaster relief efforts, with direct company contributions.',
      impact: '$10M raised for disaster relief'
    },
    {
      title: 'Global Health Initiative',
      description: 'Partnership with healthcare organizations to bring technology solutions to underserved healthcare facilities worldwide.',
      impact: '50+ health clinics equipped with technology'
    }
  ];

  const socialImpactInitiatives = [
    {
      title: 'Digital Literacy Program',
      description: 'Free training programs teaching essential digital skills to seniors and underserved populations.',
      impact: '5,000+ people trained in digital skills'
    },
    {
      title: 'Accessibility Innovation Fund',
      description: 'Investing in technology that improves accessibility for people with disabilities.',
      impact: '15 accessibility startups funded'
    }
  ];

  const initiatives: CSRInitiative[] = [];

  // Generate 1-2 environment initiatives
  const envCount = 1 + (seed % 2);
  for (let i = 0; i < envCount; i++) {
    const initIndex = (seed + i * 7) % environmentInitiatives.length;
    const initiative = environmentInitiatives[initIndex];
    const monthsAgo = 6 + ((seed + i * 13) % 18);
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() - monthsAgo);

    initiatives.push({
      title: initiative.title,
      category: 'Environment',
      description: initiative.description,
      impact: initiative.impact,
      launchedDate: launchDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: i % 2 === 0 ? 'Active' : 'Ongoing'
    });
  }

  // Generate 1-2 education initiatives
  const eduCount = 1 + (seed % 2);
  for (let i = 0; i < eduCount; i++) {
    const initIndex = (seed + i * 11) % educationInitiatives.length;
    const initiative = educationInitiatives[initIndex];
    const monthsAgo = 12 + ((seed + i * 17) % 24);
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() - monthsAgo);

    initiatives.push({
      title: initiative.title,
      category: 'Education',
      description: initiative.description,
      impact: initiative.impact,
      launchedDate: launchDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'Ongoing'
    });
  }

  // Generate 1-2 diversity initiatives
  const divCount = 1 + (seed % 2);
  for (let i = 0; i < divCount; i++) {
    const initIndex = (seed + i * 13) % diversityInitiatives.length;
    const initiative = diversityInitiatives[initIndex];
    const monthsAgo = 3 + ((seed + i * 19) % 12);
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() - monthsAgo);

    initiatives.push({
      title: initiative.title,
      category: 'Diversity',
      description: initiative.description,
      impact: initiative.impact,
      launchedDate: launchDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'Active'
    });
  }

  // Generate 1-2 community initiatives
  const commCount = 1 + (seed % 2);
  for (let i = 0; i < commCount; i++) {
    const initIndex = (seed + i * 17) % communityInitiatives.length;
    const initiative = communityInitiatives[initIndex];
    const monthsAgo = 8 + ((seed + i * 23) % 16);
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() - monthsAgo);

    initiatives.push({
      title: initiative.title,
      category: 'Community',
      description: initiative.description,
      impact: initiative.impact,
      launchedDate: launchDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'Ongoing'
    });
  }

  // Generate 0-1 philanthropy initiative
  if (seed % 3 === 0) {
    const initIndex = seed % philanthropyInitiatives.length;
    const initiative = philanthropyInitiatives[initIndex];
    const monthsAgo = 4 + (seed % 10);
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() - monthsAgo);

    initiatives.push({
      title: initiative.title,
      category: 'Philanthropy',
      description: initiative.description,
      impact: initiative.impact,
      launchedDate: launchDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'Active'
    });
  }

  // Generate 0-1 social impact initiative
  if (seed % 4 === 0) {
    const initIndex = seed % socialImpactInitiatives.length;
    const initiative = socialImpactInitiatives[initIndex];
    const monthsAgo = 6 + (seed % 12);
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() - monthsAgo);

    initiatives.push({
      title: initiative.title,
      category: 'Social Impact',
      description: initiative.description,
      impact: initiative.impact,
      launchedDate: launchDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'Ongoing'
    });
  }

  return initiatives;
}

export async function POST(request: NextRequest) {
  let companyName = '';

  try {
    const body = await request.json();
    companyName = body.companyName || '';

    // For now, return mock data
    // In production, this would integrate with CSR databases, company sustainability reports, etc.
    const initiatives = generateMockCSRData(companyName);

    return NextResponse.json({
      initiatives,
      total: initiatives.length
    });
  } catch (error) {
    console.error('Error in community-csr API:', error);

    // Return mock data even on error
    const initiatives = generateMockCSRData(companyName || 'Unknown Company');

    return NextResponse.json({
      initiatives,
      total: initiatives.length
    });
  }
}
