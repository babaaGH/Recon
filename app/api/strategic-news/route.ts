import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  date: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface NewsAPIArticle {
  title: string;
  description: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content?: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

// Helper function to categorize news and determine impact
function categorizeNews(article: NewsAPIArticle): Pick<NewsItem, 'category' | 'impact'> {
  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();
  const content = (article.content || '').toLowerCase();
  const combined = `${title} ${description} ${content}`;

  let category = 'News';
  let impact: NewsItem['impact'] = 'MEDIUM';

  // High impact keywords
  const highImpactKeywords = [
    'acquisition',
    'merger',
    'ipo',
    'funding',
    'expansion',
    'partnership',
    'layoff',
    'ceo',
    'bankruptcy',
    'lawsuit',
    'billion',
    'strategic'
  ];

  // Category detection
  if (combined.match(/acquisition|acquire|bought|purchase/)) {
    category = 'Acquisition';
    impact = 'HIGH';
  } else if (combined.match(/merger|merge/)) {
    category = 'Merger';
    impact = 'HIGH';
  } else if (combined.match(/expansion|expand|new market|international/)) {
    category = 'Expansion';
    impact = 'HIGH';
  } else if (combined.match(/partnership|partner|collaborate|alliance/)) {
    category = 'Partnership';
    impact = 'HIGH';
  } else if (combined.match(/funding|investment|raised|series [a-z]/)) {
    category = 'Funding';
    impact = 'HIGH';
  } else if (combined.match(/ipo|public offering|stock/)) {
    category = 'IPO';
    impact = 'HIGH';
  } else if (combined.match(/product|launch|release|announce/)) {
    category = 'Product';
    impact = 'MEDIUM';
  } else if (combined.match(/revenue|earnings|profit|financial/)) {
    category = 'Financial';
    impact = 'MEDIUM';
  } else if (combined.match(/client|customer|contract|deal/)) {
    category = 'Client Win';
    impact = 'MEDIUM';
  } else if (combined.match(/layoff|restructure|downsize/)) {
    category = 'Restructuring';
    impact = 'HIGH';
  } else if (combined.match(/ceo|executive|leadership|appoint/)) {
    category = 'Leadership';
    impact = 'MEDIUM';
  } else if (combined.match(/lawsuit|legal|court|settle/)) {
    category = 'Legal';
    impact = 'HIGH';
  }

  // Override impact based on keywords
  const hasHighImpact = highImpactKeywords.some(keyword => combined.includes(keyword));
  if (hasHighImpact && impact === 'MEDIUM') {
    impact = 'HIGH';
  }

  // Low impact for minor news
  if (combined.match(/update|minor|small/)) {
    impact = 'LOW';
  }

  return { category, impact };
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    if (!NEWS_API_KEY) {
      console.log('NEWS_API_KEY not configured, returning mock data');
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

    // NewsAPI.org endpoint for everything
    // Get news from the last 30 days, sorted by most recent
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&from=${fromDate}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`NewsAPI error: ${response.status} ${response.statusText}`);
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

    const data: NewsAPIResponse = await response.json();

    // Transform NewsAPI response to our format
    const news: NewsItem[] = [];

    if (data.articles && Array.isArray(data.articles)) {
      data.articles.forEach((article: NewsAPIArticle) => {
        const { category, impact } = categorizeNews(article);

        // Format date
        const articleDate = new Date(article.publishedAt);
        const formattedDate = articleDate.toISOString().split('T')[0];

        news.push({
          title: article.title,
          date: formattedDate,
          category,
          impact,
        });
      });
    }

    console.log(`✓ Found ${news.length} news articles from NewsAPI for ${companyName}`);

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
