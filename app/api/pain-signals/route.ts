import { NextRequest, NextResponse } from 'next/server';

interface PainSignal {
  title: string;
  link: string;
  source: string;
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

    console.log(`Fetching pain signals for: ${companyName}`);

    // Google News RSS search query for pain signals
    const query = encodeURIComponent(`${companyName} lawsuit OR layoffs OR outage OR breach OR regulatory OR fine OR missed earnings`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Google News RSS error: ${response.status}`);
      return NextResponse.json({
        signals: [],
        total: 0
      });
    }

    const xml = await response.text();
    const items = await parseGoogleNewsRSS(xml);

    const signals: PainSignal[] = [];

    // Process news items - take top 3 pain signals
    for (const item of items.slice(0, 3)) {
      signals.push({
        title: item.title,
        link: item.link,
        source: item.source,
        daysAgo: getDaysAgo(item.pubDate),
      });
    }

    console.log(`✓ Found ${signals.length} pain signals for ${companyName}`);

    return NextResponse.json({
      signals,
      total: signals.length
    });
  } catch (error) {
    console.error('Error in pain-signals API:', error);

    return NextResponse.json({
      signals: [],
      total: 0
    });
  }
}
