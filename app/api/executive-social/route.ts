import { NextRequest, NextResponse } from 'next/server';

interface SocialPost {
  executiveName: string;
  title: string;
  platform: 'LinkedIn' | 'Twitter' | 'Blog' | 'Medium' | 'Article';
  postType: 'Thought Leadership' | 'Company News' | 'Industry Insight' | 'Product Update' | 'Personal';
  content: string;
  postedDate: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  url?: string;
}

// Generate realistic mock executive social activity data
function generateMockSocialData(companyName: string): SocialPost[] {
  const seed = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const executiveNames = [
    'Sarah Chen',
    'Michael Rodriguez',
    'Jennifer Kim',
    'David Thompson',
    'Amanda Foster',
    'Robert Martinez'
  ];

  const thoughtLeadershipTopics = [
    'The future of enterprise AI is not about replacing humans, but augmenting their capabilities. Our latest research shows companies that...',
    'In my 20 years in tech, I\'ve never seen a shift as profound as what we\'re witnessing now. Here\'s why I believe...',
    'Three lessons from scaling our company from 10 to 1000+ employees: 1) Culture eats strategy for breakfast...',
    'Why traditional approaches to digital transformation are failing, and what we\'re doing differently at ' + companyName + '...',
    'The talent shortage in tech is real, but it\'s not unsolvable. Here\'s how we\'re thinking about it differently...'
  ];

  const industryInsights = [
    'Breaking down the latest industry report on cloud adoption: 87% of enterprises are now multi-cloud, but only 23% feel they\'re getting full value...',
    'Just attended an incredible roundtable with 50+ CTOs. The consensus? Security is no longer a separate function - it must be...',
    'Five predictions for our industry in 2026 based on what I\'m seeing from customers and partners...',
    'The economics of SaaS are changing. Here\'s what the data is telling us about customer behavior...',
    'Why I believe the next decade will be defined by companies that master data intelligence, not just data collection...'
  ];

  const companyNews = [
    'Thrilled to announce ' + companyName + '\'s latest product launch! This represents 2 years of R&D and feedback from 500+ customers...',
    'Proud moment for our team: ' + companyName + ' just crossed a major milestone. Grateful to our customers, partners, and incredible team...',
    'Big announcement today at ' + companyName + '. We\'re doubling down on our commitment to innovation and customer success...'
  ];

  const productUpdates = [
    'Excited to share what we\'ve been building: our new AI-powered analytics dashboard is now live. Early feedback has been incredible...',
    'Product update: We just shipped 15 new features based on direct customer feedback. This is what customer-driven development looks like...',
    'Sneak peek at what\'s coming next quarter. We\'re solving one of the biggest pain points our customers have told us about...'
  ];

  const posts: SocialPost[] = [];

  // Generate 3-4 thought leadership posts
  const thoughtCount = 3 + (seed % 2);
  for (let i = 0; i < thoughtCount; i++) {
    const execIndex = (seed + i * 7) % executiveNames.length;
    const topicIndex = (seed + i * 5) % thoughtLeadershipTopics.length;
    const daysAgo = 1 + ((seed + i * 13) % 14);
    const likes = 500 + ((seed + i * 17) % 1500);
    const comments = 20 + ((seed + i * 11) % 80);
    const shares = 30 + ((seed + i * 19) % 120);

    posts.push({
      executiveName: executiveNames[execIndex],
      title: 'Thought Leadership Post',
      platform: 'LinkedIn',
      postType: 'Thought Leadership',
      content: thoughtLeadershipTopics[topicIndex],
      postedDate: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
      engagement: { likes, comments, shares },
      url: 'https://linkedin.com'
    });
  }

  // Generate 2-3 industry insights
  const insightCount = 2 + (seed % 2);
  for (let i = 0; i < insightCount; i++) {
    const execIndex = (seed + i * 11 + 100) % executiveNames.length;
    const topicIndex = (seed + i * 9) % industryInsights.length;
    const daysAgo = 1 + ((seed + i * 23) % 10);
    const likes = 300 + ((seed + i * 29) % 1000);
    const comments = 15 + ((seed + i * 31) % 60);
    const shares = 20 + ((seed + i * 37) % 80);

    posts.push({
      executiveName: executiveNames[execIndex],
      title: 'Industry Insight',
      platform: i % 2 === 0 ? 'LinkedIn' : 'Blog',
      postType: 'Industry Insight',
      content: industryInsights[topicIndex],
      postedDate: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
      engagement: { likes, comments, shares },
      url: 'https://linkedin.com'
    });
  }

  // Generate 1-2 company news posts
  const newsCount = 1 + (seed % 2);
  for (let i = 0; i < newsCount; i++) {
    const execIndex = (seed + i * 13 + 200) % executiveNames.length;
    const newsIndex = (seed + i * 17) % companyNews.length;
    const daysAgo = 1 + ((seed + i * 41) % 7);
    const likes = 800 + ((seed + i * 43) % 2000);
    const comments = 40 + ((seed + i * 47) % 150);
    const shares = 50 + ((seed + i * 53) % 200);

    posts.push({
      executiveName: executiveNames[execIndex],
      title: 'Company News',
      platform: 'LinkedIn',
      postType: 'Company News',
      content: companyNews[newsIndex],
      postedDate: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
      engagement: { likes, comments, shares },
      url: 'https://linkedin.com'
    });
  }

  // Generate 1-2 product updates
  const productCount = 1 + (seed % 2);
  for (let i = 0; i < productCount; i++) {
    const execIndex = (seed + i * 19 + 300) % executiveNames.length;
    const productIndex = (seed + i * 23) % productUpdates.length;
    const daysAgo = 1 + ((seed + i * 59) % 5);
    const likes = 400 + ((seed + i * 61) % 1200);
    const comments = 25 + ((seed + i * 67) % 90);
    const shares = 35 + ((seed + i * 71) % 100);

    posts.push({
      executiveName: executiveNames[execIndex],
      title: 'Product Update',
      platform: i % 2 === 0 ? 'LinkedIn' : 'Medium',
      postType: 'Product Update',
      content: productUpdates[productIndex],
      postedDate: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
      engagement: { likes, comments, shares },
      url: 'https://linkedin.com'
    });
  }

  // Sort by most recent first
  posts.sort((a, b) => parseInt(a.postedDate) - parseInt(b.postedDate));

  return posts;
}

export async function POST(request: NextRequest) {
  let companyName = '';

  try {
    const body = await request.json();
    companyName = body.companyName || '';

    // For now, return mock data
    // In production, this would integrate with LinkedIn API, Twitter API, company blogs, etc.
    const posts = generateMockSocialData(companyName);

    return NextResponse.json({
      posts,
      total: posts.length
    });
  } catch (error) {
    console.error('Error in executive-social API:', error);

    // Return mock data even on error
    const posts = generateMockSocialData(companyName || 'Unknown Company');

    return NextResponse.json({
      posts,
      total: posts.length
    });
  }
}
