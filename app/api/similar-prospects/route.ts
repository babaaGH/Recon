import { NextRequest, NextResponse } from 'next/server';

interface SimilarProspect {
  companyName: string;
  cik: string;
  revenue: string;
  region?: string;
  industry: string;
  fitScore: number;
  fitLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  matchReasons: string[];
  riskMatches: string[];
  executiveChanges?: string;
}

// Parse revenue string to numeric value for comparison
function parseRevenue(revenueStr: string): number {
  const numStr = revenueStr.replace(/[$,]/g, '');
  const num = parseFloat(numStr);

  if (/B|billion/i.test(revenueStr)) {
    return num * 1e9;
  } else if (/M|million/i.test(revenueStr)) {
    return num * 1e6;
  }
  return num;
}

// Format revenue for display
function formatRevenue(revenue: number): string {
  if (revenue >= 1e9) {
    return `$${(revenue / 1e9).toFixed(1)}B`;
  } else if (revenue >= 1e6) {
    return `$${(revenue / 1e6).toFixed(0)}M`;
  }
  return `$${revenue.toLocaleString()}`;
}

// Extract key risk keywords from text
function extractRiskKeywords(text: string): string[] {
  const keywords: Set<string> = new Set();

  const patterns = [
    /legacy\s+(?:systems?|technology|infrastructure|platforms?)/gi,
    /cybersecurity\s+(?:threats?|risks?|breaches?)/gi,
    /data\s+(?:breaches?|security|privacy)/gi,
    /technology\s+(?:modernization|transformation|upgrades?)/gi,
    /regulatory\s+(?:compliance|changes?|requirements?)/gi,
    /digital\s+transformation/gi,
    /cloud\s+(?:migration|adoption|infrastructure)/gi,
    /IT\s+(?:infrastructure|systems?|modernization)/gi,
    /operational\s+(?:efficiency|risks?)/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      keywords.add(match[0].toLowerCase());
    }
  }

  return Array.from(keywords);
}

// Calculate fit score based on multiple factors
function calculateFitScore(
  sourceRevenue: number,
  targetRevenue: number,
  sourceRisks: string[],
  targetRisks: string[],
  sameIndustry: boolean
): { score: number; reasons: string[]; riskMatches: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const riskMatches: string[] = [];

  // Revenue similarity (40 points max)
  const revenueDiff = Math.abs(targetRevenue - sourceRevenue) / sourceRevenue;
  if (revenueDiff <= 0.3) {
    const revenueScore = Math.round(40 * (1 - revenueDiff / 0.3));
    score += revenueScore;
    reasons.push(`Similar revenue scale (${formatRevenue(targetRevenue)})`);
  }

  // Industry match (30 points)
  if (sameIndustry) {
    score += 30;
    reasons.push('Same industry sector');
  }

  // Risk factor overlap (30 points max)
  const commonRisks = targetRisks.filter(risk =>
    sourceRisks.some(sr => sr.includes(risk) || risk.includes(sr))
  );

  if (commonRisks.length > 0) {
    const riskScore = Math.min(30, commonRisks.length * 10);
    score += riskScore;
    reasons.push(`${commonRisks.length} shared risk factors`);
    riskMatches.push(...commonRisks.slice(0, 3)); // Top 3 matches
  }

  return { score, reasons, riskMatches };
}

export async function POST(request: NextRequest) {
  try {
    const { companyName, industry, revenue, region, riskFactors = [] } = await request.json();

    console.log(`Finding similar prospects for: ${companyName}`);

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    // Parse source company revenue
    const sourceRevenue = parseRevenue(revenue);
    const minRevenue = sourceRevenue * 0.7; // -30%
    const maxRevenue = sourceRevenue * 1.3; // +30%

    console.log(`Revenue range: ${formatRevenue(minRevenue)} - ${formatRevenue(maxRevenue)}`);

    // Step 1: Get source company's SIC code and CIK
    const searchResponse = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&action=getcompany&output=json`,
      {
        headers: {
          'User-Agent': 'StalkerApp contact@example.com',
          'Accept': 'application/json',
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('SEC search failed:', searchResponse.status);
      return NextResponse.json({ prospects: [] });
    }

    const searchData = await searchResponse.json();
    const sourceCIK = searchData.CIK;
    const sourceSIC = searchData.SIC;

    if (!sourceSIC) {
      console.log('No SIC code found for source company');
      return NextResponse.json({ prospects: [] });
    }

    console.log(`Source company CIK: ${sourceCIK}, SIC: ${sourceSIC}`);

    // Step 2: Search for companies in the same SIC code
    const sicSearchResponse = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&SIC=${sourceSIC}&output=json&count=100`,
      {
        headers: {
          'User-Agent': 'StalkerApp contact@example.com',
          'Accept': 'application/json',
        },
      }
    );

    if (!sicSearchResponse.ok) {
      console.error('SIC search failed:', sicSearchResponse.status);
      return NextResponse.json({ prospects: [] });
    }

    const sicData = await sicSearchResponse.json();

    // Filter out the source company
    const candidates = (sicData.companies || []).filter(
      (c: any) => c.CIK !== sourceCIK
    ).slice(0, 20); // Limit to 20 candidates for performance

    console.log(`Found ${candidates.length} candidates in SIC ${sourceSIC}`);

    const prospects: SimilarProspect[] = [];

    // Step 3: Analyze each candidate
    for (const candidate of candidates) {
      try {
        const cik = candidate.CIK.padStart(10, '0');

        // Get company facts for revenue
        const factsResponse = await fetch(
          `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
          {
            headers: {
              'User-Agent': 'StalkerApp contact@example.com',
              'Accept': 'application/json',
            },
          }
        );

        if (!factsResponse.ok) {
          continue;
        }

        const facts = await factsResponse.json();

        // Extract revenue
        let targetRevenue = 0;
        const revenueData = facts?.facts?.['us-gaap']?.['Revenues']?.units?.USD ||
                           facts?.facts?.['us-gaap']?.['SalesRevenueNet']?.units?.USD;

        if (revenueData && revenueData.length > 0) {
          // Get most recent annual revenue
          const annualRevenue = revenueData
            .filter((r: any) => r.form === '10-K')
            .sort((a: any, b: any) => new Date(b.filed).getTime() - new Date(a.filed).getTime())[0];

          if (annualRevenue) {
            targetRevenue = annualRevenue.val;
          }
        }

        // Filter by revenue range
        if (targetRevenue === 0 || targetRevenue < minRevenue || targetRevenue > maxRevenue) {
          continue;
        }

        console.log(`✓ ${candidate.name}: ${formatRevenue(targetRevenue)} (within range)`);

        // Get latest 10-K for risk factors (lightweight - just check if exists)
        const submissionsResponse = await fetch(
          `https://data.sec.gov/submissions/CIK${cik}.json`,
          {
            headers: {
              'User-Agent': 'StalkerApp contact@example.com',
              'Accept': 'application/json',
            },
          }
        );

        let targetRisks: string[] = [];
        let executiveChanges: string | undefined;

        if (submissionsResponse.ok) {
          const submissions = await submissionsResponse.json();
          const recent = submissions?.filings?.recent;

          // Check for recent 8-K executive changes
          const recent8Ks = recent?.form?.map((f: string, i: number) => ({
            form: f,
            filingDate: recent.filingDate[i],
            items: recent.items?.[i] || '',
          })).filter((f: any) => f.form === '8-K' && /Item 5\.02/i.test(f.items)) || [];

          if (recent8Ks.length > 0) {
            const latest8K = recent8Ks[0];
            executiveChanges = `Executive change filed ${latest8K.filingDate}`;
          }

          // For risk matching, we'll use a simplified approach
          // In production, you'd fetch and parse the actual 10-K
          // For now, use industry-based assumptions
          targetRisks = extractRiskKeywords(industry + ' ' + (riskFactors?.join(' ') || ''));
        }

        // Calculate fit score
        const sourceRisks = extractRiskKeywords((riskFactors?.join(' ') || '') + ' ' + industry);
        const { score, reasons, riskMatches } = calculateFitScore(
          sourceRevenue,
          targetRevenue,
          sourceRisks,
          targetRisks,
          true // Same SIC = same industry
        );

        // Determine fit level
        let fitLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (score >= 80) {
          fitLevel = 'HIGH';
        } else if (score >= 60) {
          fitLevel = 'MEDIUM';
        }

        // Only include MEDIUM and HIGH fits
        if (fitLevel !== 'LOW') {
          prospects.push({
            companyName: candidate.name,
            cik: candidate.CIK,
            revenue: formatRevenue(targetRevenue),
            region: region, // Use same region as source for now
            industry: industry,
            fitScore: score,
            fitLevel,
            matchReasons: reasons,
            riskMatches,
            executiveChanges,
          });
        }
      } catch (error) {
        console.error(`Error processing candidate ${candidate.name}:`, error);
        continue;
      }
    }

    // Sort by fit score
    prospects.sort((a, b) => b.fitScore - a.fitScore);

    console.log(`✓ Found ${prospects.length} qualified similar prospects`);

    return NextResponse.json({
      prospects: prospects.slice(0, 10), // Return top 10
      sourceCompany: companyName,
      sicCode: sourceSIC,
    });
  } catch (error) {
    console.error('Similar prospects search error:', error);
    return NextResponse.json({ error: 'Search failed', prospects: [] }, { status: 500 });
  }
}
