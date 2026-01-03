// Serper API integration for real-time web intelligence gathering

export interface SerperSearchResult {
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
  }>;
  answerBox?: {
    title?: string;
    answer?: string;
    snippet?: string;
  };
  knowledgeGraph?: {
    title?: string;
    type?: string;
    description?: string;
    attributes?: Record<string, string>;
  };
}

/**
 * Search the web using Serper API
 */
export async function searchWeb(query: string): Promise<SerperSearchResult | null> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.error('SERPER_API_KEY not found in environment variables');
    return null;
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 10,
      }),
    });

    if (!response.ok) {
      console.error('Serper API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Serper API:', error);
    return null;
  }
}

/**
 * Clean up text by removing ellipses and extra whitespace
 */
function cleanText(text: string): string {
  return text
    .replace(/\.\.\.+/g, '') // Remove ellipses
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate relevance score for a LinkedIn profile result
 */
function calculateRelevance(result: any, companyName: string, cleanedName: string): number {
  let score = 0;
  const titleLower = (result.title || '').toLowerCase();
  const snippetLower = (result.snippet || '').toLowerCase();
  const combinedText = `${titleLower} ${snippetLower}`;

  // Check for company name mentions (case insensitive)
  const companyVariations = [
    companyName.toLowerCase(),
    cleanedName.toLowerCase(),
    // Also check for common variations
    companyName.toLowerCase().replace(/\s+/g, ''),
    cleanedName.toLowerCase().replace(/\s+/g, '')
  ].filter(v => v.length > 0);

  for (const variation of companyVariations) {
    if (titleLower.includes(variation)) score += 10; // Title mention is strongest
    if (snippetLower.includes(variation)) score += 5; // Snippet mention
  }

  // Boost score for executive titles
  const executiveTitles = ['ceo', 'cto', 'cfo', 'coo', 'cio', 'chief', 'president', 'founder'];
  if (executiveTitles.some(title => combinedText.includes(title))) {
    score += 3;
  }

  // Boost for VP/Director level
  if (combinedText.match(/\b(vp|vice president|svp|evp|director)\b/i)) {
    score += 2;
  }

  return score;
}

/**
 * Search for high-value LinkedIn targets (executives) at a company
 */
export async function searchLinkedInTargets(companyName: string): Promise<any[]> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.error('SERPER_API_KEY not configured');
    return [];
  }

  try {
    // Clean company name - remove legal suffixes
    const cleanedName = companyName
      .replace(/\b(Inc\.?|LLC|Ltd\.?|Corporation|Corp\.?|Company|Co\.?)\b/gi, '')
      .trim();

    // Search for executives at the company - Serper blocks site: operators
    // Instead, we search for the company + role + LinkedIn and filter results
    const queries = [
      // First try: Specific roles with LinkedIn mention
      `"${cleanedName}" LinkedIn (CEO OR CTO OR CFO OR COO OR CIO OR CMO OR President)`,
      // Second try: Broader VP/Director search
      `"${cleanedName}" LinkedIn ("Vice President" OR VP OR SVP OR EVP OR Director OR "Head of")`,
      // Third try: Original company name
      `"${companyName}" LinkedIn (CEO OR CTO OR CFO OR President OR VP)`
    ];

    let data: any = null;
    let successfulQuery = '';

    // Try each query until we get results
    for (const query of queries) {
      console.log(`Trying LinkedIn search: ${query.substring(0, 100)}...`);

      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: 30,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`Serper API error: ${response.status} - ${errorText}`);
        continue;
      }

      const result = await response.json();

      if (result.organic && result.organic.length > 0) {
        data = result;
        successfulQuery = query;
        console.log(`✓ Found ${result.organic.length} results with query variation`);
        break;
      }
    }

    if (!data || !data.organic || data.organic.length === 0) {
      console.log(`No search results found for: ${companyName} after trying all variations`);
      return [];
    }

    // Filter to only LinkedIn profile URLs
    const linkedinResults = data.organic.filter((result: any) =>
      result.link && result.link.includes('linkedin.com/in/')
    );

    if (linkedinResults.length === 0) {
      console.log(`No LinkedIn profiles found in search results for: ${companyName}`);
      return [];
    }

    console.log(`Found ${linkedinResults.length} LinkedIn profiles in ${data.organic.length} total results`);

    // Parse and extract profile information
    const targets = linkedinResults.slice(0, 30).map((result: any) => {
      // Extract name from title (usually "Name - Title - Company" or "Name | LinkedIn")
      const titleText = result.title || '';
      let name = 'Unknown';
      let title = 'Executive';

      // LinkedIn titles can be in formats:
      // "John Doe - CEO - PayPal"
      // "John Doe | CEO at PayPal | LinkedIn"
      // "John Doe - PayPal | LinkedIn"

      if (titleText.includes('|')) {
        // Format: "Name | Title at Company | LinkedIn"
        const parts = titleText.split('|').map((s: string) => s.trim());
        name = parts[0] || 'Unknown';

        if (parts[1] && !parts[1].toLowerCase().includes('linkedin')) {
          // Extract title from "CEO at PayPal" or just "CEO"
          const titlePart = parts[1].replace(/\s+at\s+.+$/i, '').trim();
          if (titlePart) title = titlePart;
        }
      } else if (titleText.includes('-')) {
        // Format: "Name - Title - Company"
        const titleParts = titleText.split('-').map((s: string) => s.trim());
        name = titleParts[0] || 'Unknown';

        if (titleParts[1]) {
          // Check if second part looks like a job title (not LinkedIn)
          const potentialTitle = titleParts[1];
          if (!potentialTitle.toLowerCase().includes('linkedin')) {
            title = potentialTitle;
          }
        }
      } else {
        // Fallback: just use first part
        name = titleText.split(/[|\-]/)[0]?.trim() || 'Unknown';
      }

      // Try to extract better title from snippet if we still have generic "Executive"
      const snippet = result.snippet || '';
      if (title === 'Executive' || title.toLowerCase().includes('linkedin')) {
        const roleMatch = snippet.match(/(Chief\s+\w+\s+Officer|CEO|CTO|CFO|COO|CIO|CMO|CISO|CPO|EVP|SVP|Senior Vice President|Vice President|VP|President|Director|Head of [A-Za-z ]+|Senior Director)/i);
        if (roleMatch) {
          title = roleMatch[0];
        }
      }

      // Extract location from snippet (usually "City, State" or "City, Country")
      let location = 'Location not available';
      const locationMatch = snippet.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
      if (locationMatch) {
        location = `${locationMatch[1]}, ${locationMatch[2]}`;
      }

      // Connection degree - we can't get this from Google search
      // This would require actual LinkedIn API access
      const connection = '2nd'; // Default placeholder

      return {
        name: cleanText(name),
        title: cleanText(title),
        linkedinUrl: result.link,
        snippet: cleanText(snippet),
        location: cleanText(location),
        connection: connection,
        relevanceScore: calculateRelevance(result, companyName, cleanedName)
      };
    });

    // Filter out profiles that don't mention the company (relevance > 0)
    // and sort by relevance
    const filteredTargets = targets
      .filter((t: any) => t.relevanceScore > 0)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .map(({ relevanceScore, ...target }) => target); // Remove relevanceScore from final output

    console.log(`Found ${filteredTargets.length} relevant LinkedIn targets for ${companyName} (filtered from ${targets.length} results)`);
    return filteredTargets;
  } catch (error) {
    console.error('Error searching LinkedIn targets:', error);
    return [];
  }
}

/**
 * Extract revenue figures from text
 */
function extractRevenue(text: string): string | null {
  // Look for patterns like "$X billion", "$X.X billion", etc.
  const patterns = [
    /\$[\d,.]+ ?(billion|B|trillion|T|million|M)/gi,
    /[\d,.]+ ?(billion|B|trillion|T|million|M) ?(dollars|revenue|annual revenue)/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return cleanText(match[0]);
    }
  }

  return null;
}

/**
 * Search for company revenue and financial information
 */
export async function searchCompanyFinancials(companyName: string): Promise<string> {
  const query = `${companyName} revenue earnings 2024`;
  const results = await searchWeb(query);

  if (!results) return 'Data not available';

  // Check answer box first
  if (results.answerBox?.answer) {
    const cleaned = cleanText(results.answerBox.answer);
    const extracted = extractRevenue(cleaned);
    return extracted || cleaned;
  }

  // Check knowledge graph
  if (results.knowledgeGraph?.attributes) {
    const revenue = results.knowledgeGraph.attributes['Revenue'];
    if (revenue) return cleanText(revenue);
  }

  // Parse from organic results
  for (const result of results.organic.slice(0, 5)) {
    const snippet = result.snippet;
    const extracted = extractRevenue(snippet);
    if (extracted) {
      // Try to add year context if available
      const yearMatch = snippet.match(/20\d{2}/);
      if (yearMatch) {
        return `${extracted} (${yearMatch[0]})`;
      }
      return extracted;
    }
  }

  return 'Data not available';
}

/**
 * Extract key technology initiatives from snippets
 */
function extractTechInitiatives(snippets: string[]): string[] {
  const initiatives: string[] = [];
  const keywords = [
    'AI', 'artificial intelligence', 'machine learning', 'cloud', 'digital transformation',
    'technology', 'modernization', 'platform', 'infrastructure', 'cybersecurity',
    'blockchain', 'automation', 'data', 'mobile', 'app', 'payment', 'fintech'
  ];

  for (const snippet of snippets) {
    const cleaned = cleanText(snippet);

    // Split into sentences
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 20);

    for (const sentence of sentences) {
      // Check if sentence contains relevant keywords
      const hasKeyword = keywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasKeyword && sentence.length < 200) {
        initiatives.push(sentence.trim());
        if (initiatives.length >= 3) break;
      }
    }

    if (initiatives.length >= 3) break;
  }

  return initiatives;
}

/**
 * Search for company IT news and digital transformation initiatives
 */
export async function searchCompanyITNews(companyName: string): Promise<string> {
  const query = `${companyName} digital transformation cloud AI technology 2024`;
  const results = await searchWeb(query);

  if (!results || !results.organic || results.organic.length === 0) {
    return `${companyName} is active in the financial services sector. Manual research recommended for specific IT initiatives.`;
  }

  // Extract clean initiatives from snippets
  const snippets = results.organic.slice(0, 5).map(r => r.snippet);
  const initiatives = extractTechInitiatives(snippets);

  if (initiatives.length === 0) {
    // Fallback to first snippet if no initiatives found
    const firstSnippet = cleanText(results.organic[0].snippet);
    return firstSnippet.slice(0, 250);
  }

  // Format as bullet points
  return initiatives.map(init => `• ${init}`).join('\n');
}

/**
 * Determine company type based on name and search results
 */
export function inferOrgType(companyName: string, searchResults?: SerperSearchResult): 'FI' | 'Bank' | 'Payment Processor' | 'Credit Union' {
  const nameLower = companyName.toLowerCase();

  if (nameLower.includes('credit union')) return 'Credit Union';
  if (nameLower.includes('bank') || nameLower.includes('bancorp')) return 'Bank';
  if (nameLower.includes('pay') || nameLower.includes('stripe') || nameLower.includes('square') || nameLower.includes('mastercard') || nameLower.includes('visa')) {
    return 'Payment Processor';
  }

  // Check knowledge graph
  if (searchResults?.knowledgeGraph?.type) {
    const type = searchResults.knowledgeGraph.type.toLowerCase();
    if (type.includes('bank')) return 'Bank';
    if (type.includes('payment')) return 'Payment Processor';
  }

  return 'FI'; // Default to Financial Institution
}

/**
 * Extract headquarters location from search results
 */
export function extractHeadquarters(companyName: string, searchResults?: SerperSearchResult): string {
  // First: Check knowledge graph attributes
  if (searchResults?.knowledgeGraph?.attributes) {
    const hq = searchResults.knowledgeGraph.attributes['Headquarters'] ||
               searchResults.knowledgeGraph.attributes['Headquarter'] ||
               searchResults.knowledgeGraph.attributes['Founded'] ||
               searchResults.knowledgeGraph.attributes['Location'];

    if (hq) {
      return cleanText(hq);
    }
  }

  // Second: Check answer box
  if (searchResults?.answerBox?.answer) {
    const answer = searchResults.answerBox.answer.toLowerCase();

    // Look for headquarters mention
    if (answer.includes('headquarter')) {
      const hqMatch = answer.match(/headquarter(?:s|ed)?\s+(?:in|at)?\s*([^.,]+)/i);
      if (hqMatch && hqMatch[1]) {
        return cleanText(hqMatch[1]);
      }
    }

    // Look for location patterns
    const locationMatch = answer.match(/(?:based in|located in|from)\s+([A-Z][a-z]+(?:,?\s+[A-Z]{2})?)/);
    if (locationMatch && locationMatch[1]) {
      return cleanText(locationMatch[1]);
    }
  }

  // Third: Parse from organic search results
  if (searchResults?.organic) {
    for (const result of searchResults.organic.slice(0, 3)) {
      const snippet = result.snippet.toLowerCase();

      // Look for headquarters mention in snippet
      const hqPatterns = [
        /headquarter(?:s|ed)?\s+(?:in|at)?\s*([A-Z][a-z]+(?:,\s*[A-Z]{2})?)/i,
        /based in\s+([A-Z][a-z]+(?:,\s*[A-Z]{2})?)/i,
        /located in\s+([A-Z][a-z]+(?:,\s*[A-Z]{2})?)/i,
      ];

      for (const pattern of hqPatterns) {
        const match = result.snippet.match(pattern);
        if (match && match[1]) {
          return cleanText(match[1]);
        }
      }
    }
  }

  return 'Unknown';
}

/**
 * Determine region based on company headquarters
 */
export function inferRegion(companyName: string, searchResults?: SerperSearchResult): 'East Coast' | 'South' | 'Mid-West' | 'West' | 'Canada' {
  // Check knowledge graph for headquarters
  if (searchResults?.knowledgeGraph?.attributes) {
    const hq = searchResults.knowledgeGraph.attributes['Headquarters']?.toLowerCase() || '';

    // Canada
    if (hq.includes('canada') || hq.includes('toronto') || hq.includes('vancouver') || hq.includes('montreal')) {
      return 'Canada';
    }

    // West Coast
    if (hq.includes('california') || hq.includes('san francisco') || hq.includes('seattle') || hq.includes('portland')) {
      return 'West';
    }

    // East Coast
    if (hq.includes('new york') || hq.includes('boston') || hq.includes('charlotte') || hq.includes('philadelphia')) {
      return 'East Coast';
    }

    // South
    if (hq.includes('texas') || hq.includes('florida') || hq.includes('atlanta') || hq.includes('dallas')) {
      return 'South';
    }

    // Mid-West
    if (hq.includes('chicago') || hq.includes('detroit') || hq.includes('cleveland') || hq.includes('minneapolis')) {
      return 'Mid-West';
    }
  }

  // Default heuristics based on company name
  if (companyName.toLowerCase().includes('td')) return 'Canada';
  if (companyName.toLowerCase().includes('wells fargo')) return 'West';

  return 'East Coast'; // Default
}
