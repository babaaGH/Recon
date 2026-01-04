import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  date: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
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
        news: [
          {
            title: 'Company announces expansion into Asia-Pacific market',
            date: '2025-01-02',
            category: 'Expansion',
            impact: 'HIGH' as const,
          },
          {
            title: 'New partnership with Fortune 500 client',
            date: '2024-12-28',
            category: 'Client Win',
            impact: 'HIGH' as const,
          },
          {
            title: 'Product launch scheduled for Q1 2025',
            date: '2024-12-15',
            category: 'Product',
            impact: 'MEDIUM' as const,
          },
        ],
      });
    }

    console.log(`Fetching strategic news for: ${companyName}`);

    // PredictLeads API endpoint for strategic events
    const url = `https://api.predictleads.com/strategic-events?company=${encodeURIComponent(companyName)}`;

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
        news: [
          {
            title: 'Strategic initiative underway',
            date: new Date().toISOString().split('T')[0],
            category: 'Strategy',
            impact: 'MEDIUM' as const,
          },
        ],
      });
    }

    const data = await response.json();

    // Transform PredictLeads response to our format
    const news: NewsItem[] = [];

    if (data.events && Array.isArray(data.events)) {
      data.events.forEach((event: any) => {
        // Determine impact level
        let impact: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
        if (event.impact === 'high' || event.category === 'expansion' || event.category === 'acquisition') {
          impact = 'HIGH';
        } else if (event.impact === 'low') {
          impact = 'LOW';
        }

        news.push({
          title: event.title || event.description,
          date: event.date || new Date().toISOString().split('T')[0],
          category: event.category || 'Other',
          impact,
        });
      });
    }

    console.log(`✓ Found ${news.length} strategic events for ${companyName}`);

    return NextResponse.json({
      news: news.slice(0, 10), // Limit to 10 most recent
    });
  } catch (error) {
    console.error('Error fetching strategic news:', error);

    // Return mock data on error
    return NextResponse.json({
      news: [
        {
          title: 'Recent strategic development',
          date: new Date().toISOString().split('T')[0],
          category: 'Update',
          impact: 'MEDIUM' as const,
        },
      ],
    });
  }
}
