// Financial Modeling Prep API integration for revenue data

export interface QuarterlyRevenue {
  date: string;
  period: string;
  revenue: number;
  calendarYear: string;
}

export interface RevenueData {
  quarters: QuarterlyRevenue[];
  yoyGrowth: number | null;
}

/**
 * Fetch quarterly income statement data from FMP
 */
export async function fetchQuarterlyRevenue(symbol: string): Promise<RevenueData | null> {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey || apiKey === 'your_fmp_key_here') {
    console.error('FMP_API_KEY not configured');
    return null;
  }

  try {
    // Use v3 API endpoint (free tier compatible)
    const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=quarter&limit=5&apikey=${apiKey}`;

    console.log(`Fetching revenue for symbol: ${symbol}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FMP API error for ${symbol}:`, response.status, response.statusText, errorText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log(`No financial data found for symbol: ${symbol}`);
      return null;
    }

    // Get last 4 quarters and reverse to show oldest to newest
    const last4Quarters = data.slice(0, 4).reverse();

    const quarters: QuarterlyRevenue[] = last4Quarters.map((item: any) => ({
      date: item.date,
      period: item.period,
      revenue: item.revenue || 0,
      calendarYear: item.calendarYear
    }));

    // Calculate YoY growth (compare latest quarter to same quarter last year)
    let yoyGrowth: number | null = null;
    if (data.length >= 5) {
      const latestRevenue = data[0].revenue;
      const yearAgoRevenue = data[4].revenue; // 4 quarters ago

      if (latestRevenue && yearAgoRevenue && yearAgoRevenue !== 0) {
        yoyGrowth = ((latestRevenue - yearAgoRevenue) / yearAgoRevenue) * 100;
      }
    }

    return {
      quarters,
      yoyGrowth
    };
  } catch (error) {
    console.error('Error fetching FMP data:', error);
    return null;
  }
}

/**
 * Attempt to find stock symbol from company name
 * This uses FMP's search endpoint
 */
export async function searchCompanySymbol(companyName: string): Promise<string | null> {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey || apiKey === 'your_fmp_key_here') {
    return null;
  }

  try {
    // Use v3 API endpoint (free tier compatible)
    const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(companyName)}&limit=5&apikey=${apiKey}`;

    console.log(`Searching for company: ${companyName}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FMP search error for ${companyName}:`, response.status, errorText);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      console.log(`No symbol found for: ${companyName}`);
      return null;
    }

    console.log(`Found symbol for ${companyName}: ${results[0].symbol}`);
    // Return the first match's symbol
    return results[0].symbol;
  } catch (error) {
    console.error('Error searching company symbol:', error);
    return null;
  }
}

/**
 * Get revenue data for a company by name or symbol
 */
export async function getCompanyRevenue(companyNameOrSymbol: string): Promise<RevenueData | null> {
  // First try as a direct symbol
  let revenueData = await fetchQuarterlyRevenue(companyNameOrSymbol.toUpperCase());

  // If that fails, search for the symbol
  if (!revenueData) {
    const symbol = await searchCompanySymbol(companyNameOrSymbol);
    if (symbol) {
      revenueData = await fetchQuarterlyRevenue(symbol);
    }
  }

  return revenueData;
}
