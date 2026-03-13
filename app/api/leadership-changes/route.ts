import { NextRequest, NextResponse } from 'next/server';

interface LeadershipHire {
  name: string;
  title: string;
  level: 'C-Suite' | 'SVP' | 'VP' | 'Head';
  department: string;
  joinedDate: string;
  previousCompany?: string;
  linkedinUrl?: string;
  source?: string;
  articleUrl?: string;
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

// Extract executive info from news title
function extractExecutiveInfo(title: string): { name: string; role: string; level: 'C-Suite' | 'SVP' | 'VP' | 'Head' } | null {
  const titleLower = title.toLowerCase();

  // Patterns for executive changes - expanded for better matching
  const patterns = [
    // "Company appoints/names/hires John Doe as CEO/CIO/CFO"
    /(?:appoints?|names?|hires?|welcomes?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+as\s+(?:new\s+)?([A-Z]{3}|CEO|CFO|CTO|COO|CIO|CMO|Chief\s+\w+\s+Officer)/i,
    // "John Doe named/appointed CEO of Company"
    /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:named|appointed|promoted)\s+(?:as\s+)?(?:new\s+)?([A-Z]{3}|CEO|CFO|CTO|COO|CIO|CMO|Chief\s+\w+\s+Officer)/i,
    // "John Doe joins Company as CIO/VP" (critical for Fiserv Ninish Ulkan case)
    /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+joins\s+[A-Za-z\s]+\s+as\s+(?:new\s+)?([A-Z]{3}|CEO|CFO|CTO|COO|CIO|CMO|VP|SVP|EVP|President|Chief\s+\w+\s+Officer|Vice\s+President)/i,
    // "Company welcomes John Doe as new CIO"
    /welcomes?\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+as\s+(?:new\s+)?([A-Z]{3}|CEO|CFO|CTO|COO|CIO|CMO|VP|President)/i,
    // "New CEO John Doe"
    /(?:new|incoming)\s+([A-Z]{3}|CEO|CFO|CTO|COO|CIO|CMO)\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      let name = '';
      let role = '';

      // Handle different match group orders
      if (pattern.toString().includes('new|incoming')) {
        // Pattern: "New CEO John Doe"
        role = match[1].trim();
        name = match[2].trim();
      } else {
        // Pattern: "John Doe as CEO" or "appoints John Doe as CEO"
        name = match[1].trim();
        role = match[2].trim();
      }

      // Determine level
      let level: 'C-Suite' | 'SVP' | 'VP' | 'Head' = 'VP';
      if (/CEO|CFO|CTO|COO|CIO|CMO|Chief/i.test(role)) {
        level = 'C-Suite';
      } else if (/SVP|Senior Vice President/i.test(role)) {
        level = 'SVP';
      } else if (/Head of/i.test(role)) {
        level = 'Head';
      }

      return { name, role, level };
    }
  }

  return null;
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

    console.log(`Fetching leadership changes for: ${companyName}`);

    // Google News RSS search query - expanded for better coverage
    const query = encodeURIComponent(`${companyName} joins OR named OR appointed OR promoted OR resigned OR steps down OR welcomes OR hires OR new CEO OR new CFO OR new CTO OR new VP OR new President`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Google News RSS error: ${response.status}`);
      return NextResponse.json({
        hires: [],
        total: 0
      });
    }

    const xml = await response.text();
    const items = await parseGoogleNewsRSS(xml);

    const hires: LeadershipHire[] = [];

    // Process news items to extract leadership changes
    for (const item of items.slice(0, 20)) {
      const execInfo = extractExecutiveInfo(item.title);

      if (execInfo) {
        // Try to determine department from role
        let department = 'Executive';
        if (/tech|CTO|CIO|engineering|information/i.test(execInfo.role)) department = 'Technology';
        else if (/CFO|finance/i.test(execInfo.role)) department = 'Finance';
        else if (/CMO|marketing/i.test(execInfo.role)) department = 'Marketing';
        else if (/COO|operations/i.test(execInfo.role)) department = 'Operations';

        hires.push({
          name: execInfo.name,
          title: execInfo.role,
          level: execInfo.level,
          department,
          joinedDate: getDaysAgo(item.pubDate),
          source: item.source,
          articleUrl: item.link,
        });
      }
    }

    console.log(`✓ Found ${hires.length} leadership changes for ${companyName}`);

    return NextResponse.json({
      hires,
      total: hires.length
    });
  } catch (error) {
    console.error('Error in leadership-changes API:', error);

    return NextResponse.json({
      hires: [],
      total: 0
    });
  }
}
