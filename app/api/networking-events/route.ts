import { NextRequest, NextResponse } from 'next/server';

interface Event {
  name: string;
  type: 'Conference' | 'Trade Show' | 'Roundtable' | 'Sponsorship' | 'Speaking' | 'Webinar';
  date: string;
  location: string;
  role: 'Sponsor' | 'Attendee' | 'Speaker' | 'Exhibitor' | 'Host';
  description?: string;
  source?: string;
  url?: string;
}

// Parse Google News RSS XML
async function parseGoogleNewsRSS(xml: string): Promise<any[]> {
  const items: any[] = [];

  // Extract items using regex (simple XML parsing)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];

    // Extract title (with or without CDATA)
    const titleCDataMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(itemContent);
    const titlePlainMatch = /<title>(.*?)<\/title>/.exec(itemContent);
    const title = titleCDataMatch ? titleCDataMatch[1] : (titlePlainMatch ? titlePlainMatch[1] : '');

    // Extract link
    const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
    const link = linkMatch ? linkMatch[1] : '';

    // Extract pubDate
    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemContent);
    const pubDate = pubDateMatch ? pubDateMatch[1] : '';

    // Extract source
    const sourceMatch = /<source.*?>(.*?)<\/source>/.exec(itemContent);
    const source = sourceMatch ? sourceMatch[1] : '';

    items.push({ title, link, pubDate, source });
  }

  return items;
}

// Extract event information from news title
function extractEventInfo(title: string): Pick<Event, 'name' | 'type' | 'role' | 'date' | 'location'> | null {
  const titleLower = title.toLowerCase();

  // Look for event patterns
  let eventName = '';
  let type: Event['type'] = 'Conference';
  let role: Event['role'] = 'Attendee';

  // Extract event name (usually before hyphen or colon)
  const eventPatterns = [
    /(?:at|speaking at|presenting at)\s+([A-Z][^-:|]+(?:Conference|Summit|Expo|Forum|Event|Show))/i,
    /(Money20\/20|Fintech|Banking|Finance|Tech|Cloud|Security|DevOps|Web Summit|SXSW|CES|MWC)[\s\w]*(?:Conference|Summit|Expo|Forum|Event|Show)/i,
  ];

  for (const pattern of eventPatterns) {
    const match = title.match(pattern);
    if (match) {
      eventName = match[1] || match[0];
      break;
    }
  }

  // If no event name found, check for generic event indicators
  if (!eventName) {
    if (/conference/i.test(title)) {
      const confMatch = title.match(/([A-Z][^-:|]+Conference)/i);
      if (confMatch) eventName = confMatch[1];
    } else if (/summit/i.test(title)) {
      const summitMatch = title.match(/([A-Z][^-:|]+Summit)/i);
      if (summitMatch) eventName = summitMatch[1];
    } else if (/expo/i.test(title)) {
      const expoMatch = title.match(/([A-Z][^-:|]+Expo)/i);
      if (expoMatch) eventName = expoMatch[1];
    }
  }

  if (!eventName) return null;

  // Determine type
  if (/expo|trade show/i.test(titleLower)) {
    type = 'Trade Show';
  } else if (/webinar/i.test(titleLower)) {
    type = 'Webinar';
  } else if (/summit/i.test(titleLower)) {
    type = 'Conference';
  } else if (/roundtable|panel/i.test(titleLower)) {
    type = 'Roundtable';
  }

  // Determine role
  if (/speaking|speaker|keynote/i.test(titleLower)) {
    role = 'Speaker';
  } else if (/sponsor/i.test(titleLower)) {
    role = 'Sponsor';
  } else if (/exhibitor|exhibiting/i.test(titleLower)) {
    role = 'Exhibitor';
  } else if (/host/i.test(titleLower)) {
    role = 'Host';
  }

  // Extract date (look for month + year or specific dates)
  let date = '';
  const datePatterns = [
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:-\d{1,2})?,?\s+202[5-6]/i,
    /\d{1,2}\/\d{1,2}\/202[5-6]/,
    /202[5-6]/,
  ];

  for (const pattern of datePatterns) {
    const match = title.match(pattern);
    if (match) {
      date = match[0];
      break;
    }
  }

  // Extract location
  let location = 'TBA';
  const locationPatterns = [
    /(?:in|at)\s+(Las Vegas|San Francisco|New York|Austin|Seattle|London|Singapore|Barcelona|Boston|Chicago|Miami|Dubai)/i,
    /(Las Vegas|San Francisco|New York|Austin|Seattle|London|Singapore|Barcelona|Boston|Chicago|Miami|Dubai)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = title.match(pattern);
    if (match) {
      location = match[1];
      break;
    }
  }

  if (/virtual|online|webinar/i.test(titleLower)) {
    location = 'Virtual Event';
  }

  return {
    name: eventName.trim(),
    type,
    role,
    date: date || 'TBA',
    location,
  };
}

export async function POST(request: NextRequest) {
  let companyName = '';

  try {
    const body = await request.json();
    companyName = body.companyName || '';

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    console.log(`Fetching networking events for: ${companyName}`);

    // Google News RSS search query
    const query = encodeURIComponent(`${companyName} conference OR speaking OR summit OR expo 2026`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Google News RSS error: ${response.status}`);
      return NextResponse.json({
        events: [],
        total: 0
      });
    }

    const xml = await response.text();
    const items = await parseGoogleNewsRSS(xml);

    const events: Event[] = [];

    // Process news items to extract event information
    for (const item of items.slice(0, 20)) {
      const eventInfo = extractEventInfo(item.title);

      if (eventInfo) {
        events.push({
          ...eventInfo,
          description: item.title,
          source: item.source,
          url: item.link,
        });
      }
    }

    console.log(`✓ Found ${events.length} networking events for ${companyName}`);

    return NextResponse.json({
      events,
      total: events.length
    });
  } catch (error) {
    console.error('Error in networking-events API:', error);

    return NextResponse.json({
      events: [],
      total: 0
    });
  }
}
