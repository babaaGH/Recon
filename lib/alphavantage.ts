// Alpha Vantage API integration for revenue data

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
 * Fetch quarterly income statement data from Alpha Vantage
 */
export async function fetchQuarterlyRevenue(symbol: string): Promise<RevenueData | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey || apiKey === 'your_alpha_vantage_key_here') {
    console.error('ALPHA_VANTAGE_API_KEY not configured');
    return null;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${apiKey}`;

    console.log(`Fetching revenue for symbol: ${symbol}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alpha Vantage API error for ${symbol}:`, response.status, response.statusText, errorText);
      return null;
    }

    const data = await response.json();

    console.log(`Alpha Vantage response keys for ${symbol}:`, Object.keys(data));

    // Check for API errors
    if (data['Error Message']) {
      console.error(`Alpha Vantage error for ${symbol}:`, data['Error Message']);
      return null;
    }

    // Check for rate limit messages
    if (data['Note']) {
      console.error(`Alpha Vantage rate limit for ${symbol}:`, data['Note']);
      return null;
    }

    if (data['Information']) {
      console.error(`Alpha Vantage rate limit for ${symbol}:`, data['Information']);
      return null;
    }

    if (!data.quarterlyReports || data.quarterlyReports.length === 0) {
      console.log(`No quarterly data found for symbol: ${symbol}. Keys:`, Object.keys(data));
      console.log(`quarterlyReports length:`, data.quarterlyReports?.length);
      return null;
    }

    console.log(`Found ${data.quarterlyReports.length} quarterly reports for ${symbol}`);

    // Get last 4 quarters
    const last4Quarters = data.quarterlyReports.slice(0, 4).reverse();

    const quarters: QuarterlyRevenue[] = last4Quarters.map((item: any) => {
      // Extract fiscal date and period (e.g., "2024-09-30" -> Q3 2024)
      const fiscalDate = item.fiscalDateEnding;
      const year = fiscalDate.split('-')[0];
      const month = fiscalDate.split('-')[1];

      // Determine quarter from month
      let quarter = 'Q1';
      if (month >= '04' && month <= '06') quarter = 'Q2';
      else if (month >= '07' && month <= '09') quarter = 'Q3';
      else if (month >= '10' && month <= '12') quarter = 'Q4';

      return {
        date: fiscalDate,
        period: quarter,
        revenue: parseInt(item.totalRevenue) || 0,
        calendarYear: year
      };
    });

    // Calculate YoY growth (compare latest quarter to same quarter last year)
    let yoyGrowth: number | null = null;
    if (data.quarterlyReports.length >= 5) {
      const latestRevenue = parseInt(data.quarterlyReports[0].totalRevenue);
      const yearAgoRevenue = parseInt(data.quarterlyReports[4].totalRevenue); // 4 quarters ago

      if (latestRevenue && yearAgoRevenue && yearAgoRevenue !== 0) {
        yoyGrowth = ((latestRevenue - yearAgoRevenue) / yearAgoRevenue) * 100;
      }
    }

    return {
      quarters,
      yoyGrowth
    };
  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error);
    return null;
  }
}

/**
 * Search for company symbol using Alpha Vantage
 */
export async function searchCompanySymbol(companyName: string): Promise<string | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey || apiKey === 'your_alpha_vantage_key_here') {
    return null;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${apiKey}`;

    console.log(`Searching for company: ${companyName}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alpha Vantage search error for ${companyName}:`, response.status, errorText);
      return null;
    }

    const data = await response.json();

    if (!data.bestMatches || data.bestMatches.length === 0) {
      console.log(`No symbol found for: ${companyName}`);
      return null;
    }

    const symbol = data.bestMatches[0]['1. symbol'];
    console.log(`Found symbol for ${companyName}: ${symbol}`);
    return symbol;
  } catch (error) {
    console.error('Error searching company symbol:', error);
    return null;
  }
}

/**
 * Get revenue data for a company by name or symbol (with auto-ticker resolution)
 */
export async function getCompanyRevenue(companyNameOrSymbol: string): Promise<RevenueData | null> {
  const input = companyNameOrSymbol.trim();

  // Auto-ticker resolution: Always search for the symbol first
  console.log(`Auto-resolving ticker for: ${input}`);
  const resolvedSymbol = await searchCompanySymbol(input);

  if (resolvedSymbol) {
    console.log(`Resolved "${input}" to ticker: ${resolvedSymbol}`);
    const revenueData = await fetchQuarterlyRevenue(resolvedSymbol);
    if (revenueData) {
      return revenueData;
    }
  }

  // Fallback: Try using input as direct ticker (for cases like "AAPL" input)
  console.log(`Symbol search failed, trying "${input}" as direct ticker`);
  const revenueData = await fetchQuarterlyRevenue(input.toUpperCase());
  return revenueData;
}
