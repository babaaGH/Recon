import { NextRequest, NextResponse } from 'next/server';

interface ConferenceAppearance {
  eventName: string;
  date: string;
  role: string;
  location?: string;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { targetName } = await request.json();

    if (!targetName) {
      return NextResponse.json({ error: 'Target name required' }, { status: 400 });
    }

    console.log(`Searching for conference appearances: ${targetName}`);

    // Search for speaking engagements, keynotes, panels
    const query = `"${targetName}" (speaking OR keynote OR panel) (2025 OR 2026)`;

    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      console.error('SERPER_API_KEY not configured');
      return NextResponse.json({ conferences: [] });
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 10,
      }),
    });

    if (!response.ok) {
      console.error('Serper API error:', response.status);
      return NextResponse.json({ conferences: [] });
    }

    const data = await response.json();
    const conferences: ConferenceAppearance[] = [];

    // Parse organic results for conference information
    if (data.organic) {
      for (const result of data.organic.slice(0, 5)) {
        const title = result.title || '';
        const snippet = result.snippet || '';
        const link = result.link || '';

        // Look for event indicators
        const eventPatterns = [
          /(?:at|presenting at|speaking at|keynote at)\s+([A-Z][^,.\n]+(?:Conference|Summit|Expo|Forum|Event))/i,
          /(Money20\/20|Fintech|Banking|Finance|Tech|Cloud|Security|DevOps)[\s\w]*(?:Conference|Summit|Expo|Forum|Event)/i,
        ];

        let eventName = '';
        for (const pattern of eventPatterns) {
          const match = (title + ' ' + snippet).match(pattern);
          if (match) {
            eventName = match[1] || match[0];
            break;
          }
        }

        if (!eventName) {
          // Try to extract from title
          const titleMatch = title.match(/([A-Z][^-|]+)(?:-|\\|)/);
          if (titleMatch) {
            eventName = titleMatch[1].trim();
          }
        }

        // Look for dates
        const datePatterns = [
          /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:-\d{1,2})?,?\s+202[5-6]/i,
          /\d{1,2}\/\d{1,2}\/202[5-6]/,
          /202[5-6]/,
        ];

        let date = '';
        for (const pattern of datePatterns) {
          const match = (title + ' ' + snippet).match(pattern);
          if (match) {
            date = match[0];
            break;
          }
        }

        // Determine role
        let role = 'Speaker';
        if (/keynote/i.test(title + snippet)) {
          role = 'Keynote Speaker';
        } else if (/panel/i.test(title + snippet)) {
          role = 'Panelist';
        }

        // Extract location if mentioned
        const locationPattern = /(?:in|at)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2})?|Las Vegas|San Francisco|New York|London|Singapore|Dubai)/i;
        const locationMatch = snippet.match(locationPattern);
        const location = locationMatch ? locationMatch[1] : undefined;

        if (eventName || date) {
          conferences.push({
            eventName: eventName || 'Conference Appearance',
            date: date || 'Date TBD',
            role,
            location,
            url: link,
          });
        }
      }
    }

    console.log(`✓ Found ${conferences.length} conference appearances for ${targetName}`);

    return NextResponse.json({
      conferences,
      targetName,
    });
  } catch (error) {
    console.error('Conference search error:', error);
    return NextResponse.json({ error: 'Search failed', conferences: [] }, { status: 500 });
  }
}
