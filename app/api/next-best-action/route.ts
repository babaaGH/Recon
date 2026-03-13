import { NextRequest, NextResponse } from 'next/server';

interface NextBestActionRequest {
  companyName: string;
  recentNews?: any[];
  leadershipChanges?: any[];
  secFilingsSummary?: string;
  hiringActivity?: {
    engineering: number;
    sales: number;
    marketing: number;
    total: number;
  };
  sentimentScore?: number;
  financialHealth?: {
    healthScore: number;
    status: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: NextBestActionRequest = await request.json();
    const {
      companyName,
      recentNews,
      leadershipChanges,
      secFilingsSummary,
      hiringActivity,
      sentimentScore,
      financialHealth
    } = body;

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'API key not configured',
        message: 'Configure API key to enable Next Best Action'
      }, { status: 503 });
    }

    // Build context from signals
    const signals = buildSignalsContext({
      companyName,
      recentNews,
      leadershipChanges,
      secFilingsSummary,
      hiringActivity,
      sentimentScore,
      financialHealth
    });

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: buildSalesAdvisorPrompt(companyName, signals)
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);

      // Check if it's a low credit / invalid API key error
      if (errorText.includes('credit balance') || errorText.includes('authentication') || errorText.includes('api_key')) {
        return NextResponse.json({
          error: 'API key invalid or expired',
          message: 'Configure valid API key to enable Next Best Action'
        }, { status: 503 });
      }

      return NextResponse.json({
        error: 'API request failed',
        message: 'Unable to generate recommendation'
      }, { status: response.status });
    }

    const data = await response.json();
    const recommendation = data.content[0].text;

    // Parse the recommendation to extract action and conversation starter
    const parsed = parseRecommendation(recommendation);

    return NextResponse.json({
      recommendation: parsed.action,
      conversationStarter: parsed.starter,
      rawResponse: recommendation
    });

  } catch (error) {
    console.error('Error in next-best-action API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Unable to generate recommendation'
    }, { status: 500 });
  }
}

function buildSignalsContext(signals: NextBestActionRequest): string {
  let context = '';

  // Recent news
  if (signals.recentNews && signals.recentNews.length > 0) {
    context += '\n**Recent Strategic News:**\n';
    signals.recentNews.slice(0, 5).forEach((news: any) => {
      context += `- ${news.title} (${news.category}, ${news.impact} impact)\n`;
    });
  }

  // Leadership changes
  if (signals.leadershipChanges && signals.leadershipChanges.length > 0) {
    context += '\n**Leadership Changes:**\n';
    signals.leadershipChanges.slice(0, 3).forEach((hire: any) => {
      context += `- ${hire.name} appointed as ${hire.title} (${hire.joinedDate})\n`;
    });
  } else {
    context += '\n**Leadership Changes:** No recent changes detected\n';
  }

  // SEC filings
  if (signals.secFilingsSummary) {
    context += `\n**SEC Filings:** ${signals.secFilingsSummary}\n`;
  }

  // Hiring activity
  if (signals.hiringActivity && signals.hiringActivity.total > 0) {
    context += '\n**Hiring Activity:**\n';
    context += `- Engineering: ${signals.hiringActivity.engineering} open roles\n`;
    context += `- Sales: ${signals.hiringActivity.sales} open roles\n`;
    context += `- Marketing: ${signals.hiringActivity.marketing} open roles\n`;
    context += `- Total openings: ${signals.hiringActivity.total}\n`;
  }

  // Financial health
  if (signals.financialHealth) {
    context += `\n**Financial Health:** ${signals.financialHealth.status} (Score: ${signals.financialHealth.healthScore}/100)\n`;
  }

  // Sentiment
  if (signals.sentimentScore !== undefined) {
    const sentimentLabel = signals.sentimentScore > 30 ? 'Positive' : signals.sentimentScore < -30 ? 'Negative' : 'Neutral';
    context += `\n**News Sentiment:** ${sentimentLabel} (${signals.sentimentScore}/100)\n`;
  }

  return context;
}

function buildSalesAdvisorPrompt(companyName: string, signals: string): string {
  return `You are a senior enterprise sales advisor specializing in B2B financial services and technology sales.

I'm researching ${companyName} as a potential prospect. Based on the following intelligence signals, provide your expert recommendation for the next best sales action.

${signals}

Please provide:
1. A 2-3 sentence recommended action that identifies the most timely opportunity and explains why now is the right time to engage
2. One specific, personalized conversation starter I can use when reaching out to an executive at this company

Format your response as:
ACTION: [your 2-3 sentence recommendation]
STARTER: [your conversation starter]

Be specific, actionable, and reference the actual signals above. Focus on timing and relevance.`;
}

function parseRecommendation(text: string): { action: string; starter: string } {
  // Try to extract ACTION and STARTER sections
  const actionMatch = text.match(/ACTION:\s*(.*?)(?=STARTER:|$)/s);
  const starterMatch = text.match(/STARTER:\s*(.*?)$/s);

  let action = actionMatch ? actionMatch[1].trim() : text;
  let starter = starterMatch ? starterMatch[1].trim() : '';

  // Clean up any extra whitespace
  action = action.replace(/\n\n+/g, ' ').trim();
  starter = starter.replace(/\n\n+/g, ' ').trim();

  // If parsing failed, try to split by line breaks
  if (!starter && action.includes('\n')) {
    const lines = action.split('\n').filter(l => l.trim());
    if (lines.length > 1) {
      starter = lines[lines.length - 1].trim();
      action = lines.slice(0, -1).join(' ').trim();
    }
  }

  return { action, starter };
}
