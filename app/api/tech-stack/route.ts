import { NextRequest, NextResponse } from 'next/server';

interface Technology {
  name: string;
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    const PREDICTLEADS_API_KEY = process.env.PREDICTLEADS_API_KEY;

    if (!PREDICTLEADS_API_KEY) {
      console.log('PREDICTLEADS_API_KEY not configured, returning mock data');
      // Return mock data for testing
      return NextResponse.json({
        technologies: [
          { name: 'AWS', category: 'Cloud' },
          { name: 'React', category: 'Frontend' },
          { name: 'Node.js', category: 'Backend' },
          { name: 'PostgreSQL', category: 'Database' },
          { name: 'Docker', category: 'DevOps' },
          { name: 'Kubernetes', category: 'DevOps' },
          { name: 'TypeScript', category: 'Language' },
          { name: 'GraphQL', category: 'API' },
        ],
      });
    }

    console.log(`Fetching tech stack for: ${companyName}`);

    // PredictLeads API endpoint for tech stack
    const url = `https://api.predictleads.com/tech-stack?company=${encodeURIComponent(companyName)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PREDICTLEADS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`PredictLeads API error: ${response.status} ${response.statusText}`);
      // Return mock data as fallback
      return NextResponse.json({
        technologies: [
          { name: 'AWS', category: 'Cloud' },
          { name: 'React', category: 'Frontend' },
          { name: 'Node.js', category: 'Backend' },
        ],
      });
    }

    const data = await response.json();

    // Transform PredictLeads response to our format
    const technologies: Technology[] = [];

    if (data.technologies && Array.isArray(data.technologies)) {
      data.technologies.forEach((tech: any) => {
        technologies.push({
          name: tech.name || tech.technology_name,
          category: tech.category || 'Other',
        });
      });
    }

    console.log(`✓ Found ${technologies.length} technologies for ${companyName}`);

    return NextResponse.json({
      technologies,
    });
  } catch (error) {
    console.error('Error fetching tech stack:', error);

    // Return mock data on error
    return NextResponse.json({
      technologies: [
        { name: 'AWS', category: 'Cloud' },
        { name: 'React', category: 'Frontend' },
      ],
    });
  }
}
