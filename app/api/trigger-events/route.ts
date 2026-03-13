import { NextRequest, NextResponse } from 'next/server';

interface TriggerEvent {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  daysAgo: string;
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

// Calculate days ago from date string
function getDaysAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  } catch {
    return 'Recently';
  }
}

export async function POST(request: NextRequest) {
  let companyName = '';

  try {
    const body = await request.json();
    companyName = body.companyName || '';

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    console.log(`Fetching trigger events for: ${companyName}`);

    // Google News RSS search query for trigger events
    const query = encodeURIComponent(`${companyName} funding OR acquisition OR merger OR IPO OR partnership OR launched OR appointed`);
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

    const events: TriggerEvent[] = [];

    // Process news items - take top 5 trigger events
    for (const item of items.slice(0, 5)) {
      events.push({
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate,
        daysAgo: getDaysAgo(item.pubDate),
      });
    }

    console.log(`✓ Found ${events.length} trigger events for ${companyName}`);

    return NextResponse.json({
      events,
      total: events.length
    });
  } catch (error) {
    console.error('Error in trigger-events API:', error);

    return NextResponse.json({
      events: [],
      total: 0
    });
  }
}
