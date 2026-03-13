import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  date: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
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

// Helper function to categorize news and determine impact
function categorizeNews(title: string): Pick<NewsItem, 'category' | 'impact'> {
  const titleLower = title.toLowerCase();

  let category = 'News';
  let impact: NewsItem['impact'] = 'MEDIUM';

  // Category detection with impact
  if (titleLower.match(/acquisition|acquire|bought|purchase|buys/)) {
    category = 'Acquisition';
    impact = 'HIGH';
  } else if (titleLower.match(/merger|merge/)) {
    category = 'Merger';
    impact = 'HIGH';
  } else if (titleLower.match(/expansion|expand|new market|international|global/)) {
    category = 'Expansion';
    impact = 'HIGH';
  } else if (titleLower.match(/partnership|partner|collaborate|alliance|teams with/)) {
    category = 'Partnership';
    impact = 'HIGH';
  } else if (titleLower.match(/funding|investment|raised|series [a-z]|capital/)) {
    category = 'Funding';
    impact = 'HIGH';
  } else if (titleLower.match(/product|launch|release|announce|unveils|introduces/)) {
    category = 'Product';
    impact = 'MEDIUM';
  } else if (titleLower.match(/revenue|earnings|profit|financial|quarterly/)) {
    category = 'Financial';
    impact = 'MEDIUM';
  } else if (titleLower.match(/client|customer|contract|deal|wins/)) {
    category = 'Client Win';
    impact = 'MEDIUM';
  } else if (titleLower.match(/layoff|restructure|downsize|cuts/)) {
    category = 'Restructuring';
    impact = 'HIGH';
  } else if (titleLower.match(/lawsuit|legal|court|settle|sues/)) {
    category = 'Legal';
    impact = 'HIGH';
  }

  return { category, impact };
}

// Format date to YYYY-MM-DD
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    console.log(`Fetching strategic news for: ${companyName}`);

    // Google News RSS search query
    const query = encodeURIComponent(`${companyName} partnership OR acquisition OR product launch OR expansion`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Google News RSS error: ${response.status}`);
      return NextResponse.json({
        news: [],
      });
    }

    const xml = await response.text();
    const items = await parseGoogleNewsRSS(xml);

    // Transform to NewsItem format
    const news: NewsItem[] = items.slice(0, 10).map((item) => {
      const { category, impact } = categorizeNews(item.title);

      return {
        title: item.title,
        date: formatDate(item.pubDate),
        category,
        impact,
        source: item.source,
        url: item.link,
      };
    });

    console.log(`✓ Found ${news.length} strategic news articles for ${companyName}`);

    return NextResponse.json({
      news,
    });
  } catch (error) {
    console.error('Error fetching strategic news:', error);

    return NextResponse.json({
      news: [],
    });
  }
}
