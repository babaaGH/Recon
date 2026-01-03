// SEC EDGAR API integration for public company filings
// No API key required - using public SEC data

export interface SECFiling {
  formType: string;
  filingDate: string;
  accessionNumber: string;
  reportDate?: string;
}

export interface LegalProceeding {
  description: string;
  amount?: string;
  amountInDollars?: number; // Normalized amount for calculations
  type: 'litigation' | 'settlement' | 'fine' | 'investigation';
  category: 'Regulatory' | 'Class Action' | 'Commercial' | 'Employment' | 'Other';
  isITRelated: boolean;
  filedDate?: string; // When the case was filed (if mentioned)
}

export interface LegalExposureSummary {
  totalCases: number;
  totalExposure: number; // Total in dollars
  totalExposureFormatted: string; // e.g., "$150M"
  itRelatedCases: number;
  regulatoryCases: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isMaterialRisk: boolean; // True if >1% of revenue
  revenuePercentage?: number; // % of annual revenue
}

export interface FiscalYearInfo {
  fiscalYearEnd: string; // e.g., "December 31, 2024"
  fiscalYearEndDate: string; // ISO date: "2024-12-31"
  monthDay: string; // e.g., "Dec 31"
  daysUntilFYE: number; // Days from today
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  budgetCyclePhase: 'PLANNING' | 'EXECUTION' | 'BUDGET FLUSH' | 'NEW YEAR SETUP';
}

export interface CapExTrend {
  year: string;
  amount?: string;
  mention: string; // Text excerpt mentioning tech/IT investment
}

export interface FinancialMetrics {
  totalAssets?: string;
  totalLiabilities?: string;
  cashAndEquivalents?: string;
  totalDebt?: string;
  revenue?: string;
  netIncome?: string;
  reportPeriod?: string;
  filingDate?: string;
  fiscalYear?: FiscalYearInfo;
  capExTrend?: CapExTrend[];
  capExYoYChange?: number; // Percentage change year-over-year
}

export interface ProcessedRisk {
  category: 'Legacy Tech' | 'Security' | 'Compliance' | 'Integration' | 'Cloud' | 'Resilience';
  excerpt: string;
  keywords: string[];
  salesAngle: string;
  relevanceScore: number;
  filingDate: string;
}

export interface ExecutiveChange {
  name: string;
  previousTitle?: string;
  newTitle?: string;
  changeType: 'appointment' | 'departure' | 'transition';
  effectiveDate: string;
  filingDate: string;
  reason?: string;
  priority: 'HOT' | 'WARM' | 'MONITOR';
  daysInRole: number;
  salesImplication: string;
}

export interface StrategicPriority {
  statement: string;
  category: 'Cloud' | 'Legacy Modernization' | 'Cybersecurity' | 'AI/Automation' | 'Digital Transformation' | 'Infrastructure';
  budgetMentioned?: string;
  filingType: '10-K' | '10-Q';
  filingDate: string;
  serviceAlignment: 'DIRECT MATCH' | 'ADJACENT OPPORTUNITY' | 'MONITOR';
  serviceCategory: string;
}

export interface SECData {
  companyName: string;
  cik: string;
  ticker?: string;
  latest10K?: SECFiling;
  latest10Q?: SECFiling;
  legalProceedings: LegalProceeding[];
  legalExposure?: LegalExposureSummary;
  riskFactors: string[];
  processedRisks?: ProcessedRisk[];
  executiveChanges?: ExecutiveChange[];
  strategicPriorities?: StrategicPriority[];
  painSignals: string[];
  financials?: FinancialMetrics;
}

/**
 * Process fiscal year end date and calculate procurement timing
 */
function processFiscalYearInfo(fiscalYearEndStr: string): FiscalYearInfo | null {
  try {
    // Parse date like "September 30, 2023" or "December 31, 2024"
    const fyDate = new Date(fiscalYearEndStr);
    if (isNaN(fyDate.getTime())) return null;

    const today = new Date();

    // Calculate next fiscal year end (same month/day, current or next year)
    const currentYear = today.getFullYear();
    let nextFYE = new Date(currentYear, fyDate.getMonth(), fyDate.getDate());

    // If FYE already passed this year, use next year
    if (nextFYE < today) {
      nextFYE = new Date(currentYear + 1, fyDate.getMonth(), fyDate.getDate());
    }

    const daysUntilFYE = Math.ceil((nextFYE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Format month/day
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthDay = `${monthNames[fyDate.getMonth()]} ${fyDate.getDate()}`;

    // Determine quarter based on days until FYE
    let quarter: FiscalYearInfo['quarter'];
    let budgetCyclePhase: FiscalYearInfo['budgetCyclePhase'];

    if (daysUntilFYE > 270) {
      quarter = 'Q1';
      budgetCyclePhase = 'NEW YEAR SETUP';
    } else if (daysUntilFYE > 180) {
      quarter = 'Q2';
      budgetCyclePhase = 'EXECUTION';
    } else if (daysUntilFYE > 90) {
      quarter = 'Q3';
      budgetCyclePhase = 'EXECUTION';
    } else if (daysUntilFYE > 45) {
      quarter = 'Q4';
      budgetCyclePhase = 'PLANNING';
    } else {
      quarter = 'Q4';
      budgetCyclePhase = 'BUDGET FLUSH';
    }

    return {
      fiscalYearEnd: fiscalYearEndStr,
      fiscalYearEndDate: nextFYE.toISOString().split('T')[0],
      monthDay,
      daysUntilFYE,
      quarter,
      budgetCyclePhase,
    };
  } catch (error) {
    console.error('Error processing fiscal year:', error);
    return null;
  }
}

/**
 * Parse CapEx and technology investment trends from MD&A
 */
function parseCapExTrends(mdaText: string): CapExTrend[] {
  const trends: CapExTrend[] = [];

  // Patterns for capital expenditure mentions
  const capExPatterns = [
    /capital expenditure[s]?.*?(?:\$[\d,]+\.?\d*\s*(?:million|billion|M|B))/gi,
    /technology investment[s]?.*?(?:\$[\d,]+\.?\d*\s*(?:million|billion|M|B))/gi,
    /IT spending.*?(?:\$[\d,]+\.?\d*\s*(?:million|billion|M|B))/gi,
    /(?:spent|investing?|allocated?)\s+\$[\d,]+\.?\d*\s*(?:million|billion|M|B)\s+(?:on|in|for)\s+(?:capital|technology|IT|infrastructure)/gi,
  ];

  const yearPattern = /(?:20\d{2}|FY\s*\d{2})/g;

  for (const pattern of capExPatterns) {
    const matches = mdaText.matchAll(pattern);

    for (const match of matches) {
      const excerpt = match[0];

      // Extract year if mentioned
      const yearMatch = excerpt.match(yearPattern);
      const year = yearMatch ? yearMatch[0] : 'Current Year';

      // Extract amount
      const amountMatch = excerpt.match(/\$[\d,]+\.?\d*\s*(?:million|billion|M|B)/i);
      const amount = amountMatch ? amountMatch[0] : undefined;

      // Get context (surrounding sentences)
      const startIndex = Math.max(0, (match.index || 0) - 100);
      const endIndex = Math.min(mdaText.length, (match.index || 0) + excerpt.length + 100);
      const context = mdaText.substring(startIndex, endIndex).trim();

      trends.push({
        year,
        amount,
        mention: context.length > 200 ? context.substring(0, 200) + '...' : context,
      });

      if (trends.length >= 3) break; // Limit to 3 most relevant mentions
    }

    if (trends.length >= 3) break;
  }

  return trends;
}

/**
 * Extract financial metrics from SEC XBRL Company Facts API
 * Uses structured data from SEC's companyfacts.json
 */
async function extractFinancialMetrics(cik: string): Promise<FinancialMetrics | null> {
  try {
    const headers = {
      'User-Agent': 'Stalker App contact@example.com',
      'Accept': 'application/json',
    };

    const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
    console.log(`Fetching financial facts for CIK: ${cik}`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error('SEC Company Facts API error:', response.status);
      return null;
    }

    const data = await response.json();
    const facts = data.facts?.['us-gaap'] || {};

    // Helper to get the most recent value from a fact
    const getLatestValue = (factName: string): { value: number; period: string; filed: string } | null => {
      const fact = facts[factName];
      if (!fact || !fact.units) return null;

      // Get USD values (most common)
      const usdUnits = fact.units['USD'] || fact.units['usd'];
      if (!usdUnits || usdUnits.length === 0) return null;

      // Sort by end date descending to get most recent
      const sorted = [...usdUnits].sort((a: any, b: any) => {
        return new Date(b.end).getTime() - new Date(a.end).getTime();
      });

      // Get the most recent quarterly or annual value
      const latest = sorted[0];
      return {
        value: latest.val,
        period: latest.end,
        filed: latest.filed,
      };
    };

    // Helper to format large numbers
    const formatValue = (value: number): string => {
      if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
      if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
      return `$${value.toFixed(2)}`;
    };

    // Extract key metrics
    const assets = getLatestValue('Assets');
    const liabilities = getLatestValue('Liabilities') || getLatestValue('LiabilitiesAndStockholdersEquity');
    const cash = getLatestValue('CashAndCashEquivalentsAtCarryingValue') || getLatestValue('Cash');
    const debt = getLatestValue('LongTermDebt') || getLatestValue('DebtCurrent');
    const revenue = getLatestValue('Revenues') || getLatestValue('RevenueFromContractWithCustomerExcludingAssessedTax');
    const netIncome = getLatestValue('NetIncomeLoss') || getLatestValue('ProfitLoss');

    // Use the most recent period from any metric
    const reportPeriod = assets?.period || liabilities?.period || revenue?.period;
    const filingDate = assets?.filed || liabilities?.filed || revenue?.filed;

    return {
      totalAssets: assets ? formatValue(assets.value) : undefined,
      totalLiabilities: liabilities ? formatValue(liabilities.value) : undefined,
      cashAndEquivalents: cash ? formatValue(cash.value) : undefined,
      totalDebt: debt ? formatValue(debt.value) : undefined,
      revenue: revenue ? formatValue(revenue.value) : undefined,
      netIncome: netIncome ? formatValue(netIncome.value) : undefined,
      reportPeriod,
      filingDate,
    };
  } catch (error) {
    console.error('Error fetching SEC financial metrics:', error);
    return null;
  }
}

/**
 * Search for company CIK (Central Index Key) using company name or ticker
 */
export async function searchCompanyCIK(companyNameOrTicker: string): Promise<{ cik: string; name: string; ticker?: string } | null> {
  try {
    // SEC requires a User-Agent header
    const headers = {
      'User-Agent': 'Stalker App contact@example.com',
      'Accept': 'application/json',
    };

    // Use the company tickers JSON file for quick lookup
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers,
    });

    if (!response.ok) {
      console.error('SEC API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    // Search by ticker or company name
    const searchTerm = companyNameOrTicker.toLowerCase().trim();

    for (const key in data) {
      const company = data[key];
      const ticker = company.ticker?.toLowerCase() || '';
      const name = company.title?.toLowerCase() || '';

      if (ticker === searchTerm || name.includes(searchTerm)) {
        return {
          cik: String(company.cik_str).padStart(10, '0'),
          name: company.title,
          ticker: company.ticker,
        };
      }
    }

    console.log(`No CIK found for: ${companyNameOrTicker}`);
    return null;
  } catch (error) {
    console.error('Error searching SEC for CIK:', error);
    return null;
  }
}

/**
 * Fetch company submission data from SEC EDGAR
 */
export async function fetchCompanySubmissions(cik: string): Promise<any> {
  try {
    const headers = {
      'User-Agent': 'Stalker App contact@example.com',
      'Accept': 'application/json',
    };

    const url = `https://data.sec.gov/submissions/CIK${cik}.json`;

    console.log(`Fetching SEC submissions for CIK: ${cik}`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error('SEC submissions API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SEC submissions:', error);
    return null;
  }
}

/**
 * Extract latest 10-K and 10-Q filings from submissions
 */
function extractLatestFilings(submissions: any): { latest10K?: SECFiling; latest10Q?: SECFiling } {
  const filings = submissions?.filings?.recent;

  if (!filings) return {};

  let latest10K: SECFiling | undefined;
  let latest10Q: SECFiling | undefined;

  for (let i = 0; i < filings.form.length; i++) {
    const form = filings.form[i];

    if (!latest10K && form === '10-K') {
      latest10K = {
        formType: form,
        filingDate: filings.filingDate[i],
        accessionNumber: filings.accessionNumber[i],
        reportDate: filings.reportDate[i],
      };
    }

    if (!latest10Q && form === '10-Q') {
      latest10Q = {
        formType: form,
        filingDate: filings.filingDate[i],
        accessionNumber: filings.accessionNumber[i],
        reportDate: filings.reportDate[i],
      };
    }

    if (latest10K && latest10Q) break;
  }

  return { latest10K, latest10Q };
}

/**
 * Parse legal proceedings from Item 3 (10-K) or Part II Item 1 (10-Q) section
 */
/**
 * Parse monetary amount and convert to normalized dollar value
 */
function parseMonetaryAmount(amountStr: string): { formatted: string; dollars: number } {
  const numStr = amountStr.match(/[\d,]+\.?\d*/)?.[0] || '0';
  const num = parseFloat(numStr.replace(/,/g, ''));

  let multiplier = 1;
  let suffix = '';

  if (/billion|B\s/i.test(amountStr)) {
    multiplier = 1e9;
    suffix = 'B';
  } else if (/million|M\s/i.test(amountStr)) {
    multiplier = 1e6;
    suffix = 'M';
  } else if (/thousand|K\s/i.test(amountStr)) {
    multiplier = 1e3;
    suffix = 'K';
  }

  const dollars = num * multiplier;
  const formatted = suffix ? `$${num}${suffix}` : `$${num.toLocaleString()}`;

  return { formatted, dollars };
}

/**
 * Categorize legal case based on keywords
 */
function categorizeLegalCase(text: string): LegalProceeding['category'] {
  // Regulatory: Government agencies
  if (/SEC|CFPB|OCC|FTC|DOJ|Department of Justice|Securities and Exchange|Federal Trade Commission|Office of the Comptroller|Consumer Financial Protection/i.test(text)) {
    return 'Regulatory';
  }

  // Class Action: Securities fraud, consumer protection
  if (/class action|securities fraud|shareholder.*lawsuit|derivative action|consumer protection.*class/i.test(text)) {
    return 'Class Action';
  }

  // Employment: Discrimination, wrongful termination
  if (/employment|discrimination|wrongful termination|EEOC|Equal Employment|labor dispute|wage and hour/i.test(text)) {
    return 'Employment';
  }

  // Commercial: Breach of contract, IP disputes
  if (/breach of contract|intellectual property|patent|trademark|copyright|licensing dispute|vendor dispute/i.test(text)) {
    return 'Commercial';
  }

  return 'Other';
}

/**
 * Check if case is IT-related
 */
function isITRelatedCase(text: string): boolean {
  return /data breach|cybersecurity|cyber.attack|system failure|technology|software|IT infrastructure|network|database|server|cloud|ransomware|hacking|phishing|information security/i.test(text);
}

/**
 * Extract filing/case date if mentioned
 */
function extractCaseDate(text: string): string | undefined {
  // Look for patterns like "filed in 2023", "filed on January 15, 2023", "in Q4 2022"
  const datePatterns = [
    /filed\s+(?:in|on)\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    /filed\s+(?:in|on)\s+(\d{4})/i,
    /in\s+(Q[1-4]\s+\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

function parseLegalProceedings(text: string): LegalProceeding[] {
  const proceedings: LegalProceeding[] = [];

  // Check if it's a "none" statement
  if (/there are no|no material|not applicable|none/i.test(text.substring(0, 200))) {
    console.log('No material legal proceedings disclosed');
    return [];
  }

  // Split into meaningful chunks (sentences or paragraphs)
  const chunks = text.split(/\.\s+(?=[A-Z])/); // Split on sentences starting with capital

  for (const chunk of chunks) {
    const cleaned = chunk.trim();

    if (cleaned.length < 100) continue; // Skip very short chunks

    // Look for strong legal proceeding indicators
    const hasStrongIndicator = /(is|are|was|were)\s+(a )?(party to|involved in|subject to|defendant|plaintiff)|lawsuit|litigation|complaint|action was filed|legal proceeding|settlement agreement|consent decree/i.test(cleaned);

    if (!hasStrongIndicator) continue;

    // Extract ALL dollar amounts (could be multiple)
    const dollarMatches = cleaned.match(/\$\s?[\d,]+\.?\d*\s?(million|billion|M\s|B\s|thousand)?|[\d,]+\.?\d*\s*million dollars/gi);
    let amount: string | undefined;
    let amountInDollars: number | undefined;

    if (dollarMatches && dollarMatches.length > 0) {
      // Find the largest amount (usually the most relevant)
      const amounts = dollarMatches.map(m => {
        const parsed = parseMonetaryAmount(m);
        return { text: parsed.formatted, value: parsed.dollars };
      });

      amounts.sort((a, b) => b.value - a.value);
      amount = amounts[0].text;
      amountInDollars = amounts[0].value;
    }

    // Determine type based on keywords
    let type: LegalProceeding['type'] = 'litigation';
    if (/settlement|settled|agree to pay|consent decree/i.test(cleaned)) type = 'settlement';
    else if (/fine|penalty|sanction|civil money penalty/i.test(cleaned)) type = 'fine';
    else if (/investigation|subpoena|inquiry|examining|SEC.*investigating|DOJ.*investigating/i.test(cleaned)) type = 'investigation';

    // Categorize case
    const category = categorizeLegalCase(cleaned);

    // Check if IT-related
    const isITRelated = isITRelatedCase(cleaned);

    // Extract case date
    const filedDate = extractCaseDate(cleaned);

    // Create concise description (first sentence or up to 250 chars)
    const firstSentence = cleaned.match(/^[^.]+\./)?.[0] || cleaned.substring(0, 250);
    const description = firstSentence.length < cleaned.length ? firstSentence + '...' : firstSentence;

    proceedings.push({
      description: description.trim(),
      amount,
      amountInDollars,
      type,
      category,
      isITRelated,
      filedDate,
    });

    if (proceedings.length >= 10) break; // Increased limit to capture more cases
  }

  return proceedings;
}

/**
 * Calculate total legal exposure and risk metrics
 */
function calculateLegalExposure(
  proceedings: LegalProceeding[],
  annualRevenue?: number
): LegalExposureSummary {
  const totalCases = proceedings.length;

  // Sum up all monetary amounts
  const totalExposure = proceedings.reduce((sum, proc) => {
    return sum + (proc.amountInDollars || 0);
  }, 0);

  // Count IT-related and regulatory cases
  const itRelatedCases = proceedings.filter(p => p.isITRelated).length;
  const regulatoryCases = proceedings.filter(p => p.category === 'Regulatory').length;

  // Format total exposure
  let totalExposureFormatted = '$0';
  if (totalExposure >= 1e9) {
    totalExposureFormatted = `$${(totalExposure / 1e9).toFixed(1)}B`;
  } else if (totalExposure >= 1e6) {
    totalExposureFormatted = `$${(totalExposure / 1e6).toFixed(1)}M`;
  } else if (totalExposure >= 1e3) {
    totalExposureFormatted = `$${(totalExposure / 1e3).toFixed(1)}K`;
  } else if (totalExposure > 0) {
    totalExposureFormatted = `$${totalExposure.toLocaleString()}`;
  }

  // Calculate risk level
  let riskLevel: LegalExposureSummary['riskLevel'] = 'LOW';
  let isMaterialRisk = false;
  let revenuePercentage: number | undefined;

  if (annualRevenue && annualRevenue > 0) {
    revenuePercentage = (totalExposure / annualRevenue) * 100;
    isMaterialRisk = revenuePercentage > 1;

    if (revenuePercentage > 5) {
      riskLevel = 'CRITICAL';
    } else if (revenuePercentage > 2) {
      riskLevel = 'HIGH';
    } else if (revenuePercentage > 1) {
      riskLevel = 'MEDIUM';
    }
  } else {
    // Fallback to absolute thresholds if no revenue data
    if (totalExposure > 100e6) {
      riskLevel = 'HIGH';
    } else if (totalExposure > 10e6) {
      riskLevel = 'MEDIUM';
    }
  }

  return {
    totalCases,
    totalExposure,
    totalExposureFormatted,
    itRelatedCases,
    regulatoryCases,
    riskLevel,
    isMaterialRisk,
    revenuePercentage,
  };
}

/**
 * Extract risk factors from Item 1A (10-K) Risk Factors section
 */
function extractRiskFactors(text: string): string[] {
  const risks: string[] = [];

  // Risk factors are often formatted as headers followed by paragraphs
  // Look for patterns like "Risks Related to...", "We may...", etc.

  // Split by common risk factor delimiters
  const sections = text.split(/(?:\n\s*){2,}(?=[A-Z])/); // Double newline before capital letter

  for (const section of sections) {
    const cleaned = section.trim();

    if (cleaned.length < 100 || cleaned.length > 1000) continue;

    // Check for IT/Technology/Cybersecurity risk indicators (high priority)
    const isTechRisk = /cybersecurity|cyber.attack|data breach|information security|IT systems|technology infrastructure|system failure|network|software|digital|cloud|ransomware|hacking/i.test(cleaned);

    // Check for general risk indicators
    const isRisk = /risk|may adversely|could adversely|failure to|unable to|depend on|reliance on|subject to|vulnerable|exposure/i.test(cleaned);

    if (!isRisk && !isTechRisk) continue;

    // Extract the first sentence or summary (risk factors often start with the risk statement)
    let riskStatement: string;

    // Try to find a clear risk header (often in bold/caps in original)
    const headerMatch = cleaned.match(/^([A-Z][^.]+\.)/);
    if (headerMatch) {
      riskStatement = headerMatch[1];
    } else {
      // Otherwise take first 2-3 sentences
      const sentences = cleaned.split(/\.\s+/);
      riskStatement = sentences.slice(0, 2).join('. ') + '.';
    }

    // Limit to reasonable length
    if (riskStatement.length > 400) {
      riskStatement = riskStatement.substring(0, 400) + '...';
    }

    // Add tech risks first (higher priority)
    if (isTechRisk) {
      risks.unshift(riskStatement.trim());
    } else {
      risks.push(riskStatement.trim());
    }

    if (risks.length >= 8) break;
  }

  // Return top 5 (with tech risks prioritized at the top)
  return risks.slice(0, 5);
}

/**
 * Process risk factors with AI-powered categorization and sales intelligence
 */
function processRiskFactors(fullText: string, filingDate: string): ProcessedRisk[] {
  const risks: ProcessedRisk[] = [];

  // Define IT-relevant keyword patterns with categories
  const keywordPatterns = [
    {
      category: 'Legacy Tech' as const,
      patterns: [/legacy system/i, /outdated technology/i, /legacy infrastructure/i, /aging systems/i, /obsolete/i],
      salesAngle: 'Legacy system modernization and migration services'
    },
    {
      category: 'Security' as const,
      patterns: [/cybersecurity/i, /data breach/i, /security incident/i, /cyber.attack/i, /ransomware/i, /hacking/i, /information security/i],
      salesAngle: 'Enhanced cybersecurity solutions and threat protection'
    },
    {
      category: 'Cloud' as const,
      patterns: [/cloud migration/i, /digital transformation/i, /modernization/i, /cloud computing/i, /cloud.based/i],
      salesAngle: 'Cloud migration and digital transformation consulting'
    },
    {
      category: 'Integration' as const,
      patterns: [/system integration/i, /technology integration/i, /interoperability/i, /data silos/i],
      salesAngle: 'System integration and data unification services'
    },
    {
      category: 'Compliance' as const,
      patterns: [/regulatory compliance/i, /data privacy/i, /GDPR/i, /CCPA/i, /compliance requirements/i, /regulatory changes/i],
      salesAngle: 'Compliance automation and regulatory tech solutions'
    },
    {
      category: 'Resilience' as const,
      patterns: [/operational resilience/i, /system failure/i, /downtime/i, /business continuity/i, /disaster recovery/i],
      salesAngle: 'Business continuity and resilience infrastructure'
    }
  ];

  // Split text into paragraphs
  const paragraphs = fullText.split(/\n\s*\n+/).map(p => p.trim()).filter(p => p.length > 100);

  for (const paragraph of paragraphs) {
    for (const { category, patterns, salesAngle } of keywordPatterns) {
      const matchedKeywords: string[] = [];
      let keywordCount = 0;

      // Check which keywords match
      for (const pattern of patterns) {
        const matches = paragraph.match(new RegExp(pattern, 'gi'));
        if (matches) {
          keywordCount += matches.length;
          matchedKeywords.push(...matches.map(m => m.toLowerCase()));
        }
      }

      if (matchedKeywords.length > 0) {
        // Extract 2-3 sentence excerpt containing the keyword
        const sentences = paragraph.split(/\.\s+/);
        let excerpt = '';

        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          if (patterns.some(p => p.test(sentence))) {
            // Get this sentence and the next 1-2 sentences
            excerpt = sentences.slice(i, Math.min(i + 3, sentences.length)).join('. ') + '.';
            break;
          }
        }

        if (!excerpt) {
          // Fallback: take first 3 sentences
          excerpt = sentences.slice(0, 3).join('. ') + '.';
        }

        // Limit excerpt length
        if (excerpt.length > 500) {
          excerpt = excerpt.substring(0, 500) + '...';
        }

        // Calculate relevance score (based on keyword density and recency)
        const relevanceScore = keywordCount * 10 + (paragraph.length > 300 ? 5 : 0);

        risks.push({
          category,
          excerpt,
          keywords: [...new Set(matchedKeywords)], // Remove duplicates
          salesAngle,
          relevanceScore,
          filingDate
        });

        break; // Only assign one category per paragraph
      }
    }
  }

  // Sort by relevance score and return top 5
  return risks
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

/**
 * Parse 8-K Item 5.02 for executive changes with priority classification
 */
async function parse8KExecutiveChanges(cik: string): Promise<ExecutiveChange[]> {
  const changes: ExecutiveChange[] = [];

  try {
    // Fetch recent 8-K filings (last 12 months)
    const headers = {
      'User-Agent': 'Stalker App contact@example.com',
      'Accept': 'application/json',
    };

    const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const response = await fetch(url, { headers });

    if (!response.ok) return changes;

    const data = await response.json();
    const filings = data.filings?.recent;

    if (!filings) return changes;

    // Filter for 8-K filings from the last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recent8Ks: SECFiling[] = [];
    for (let i = 0; i < filings.form.length; i++) {
      if (filings.form[i] === '8-K') {
        const filingDate = filings.filingDate[i];
        if (new Date(filingDate) >= oneYearAgo) {
          recent8Ks.push({
            formType: '8-K',
            filingDate,
            accessionNumber: filings.accessionNumber[i],
            reportDate: filings.reportDate?.[i],
          });
        }
      }
      if (recent8Ks.length >= 10) break; // Limit to 10 most recent
    }

    // Parse each 8-K for Item 5.02
    for (const filing of recent8Ks) {
      const filingText = await fetchFilingText(cik, filing.accessionNumber);
      if (!filingText) continue;

      // Extract Item 5.02 section
      const item502Match = filingText.match(/Item\s+5\.02[^\n]*\n([\s\S]{0,3000}?)(?=Item\s+\d|<\/TEXT>|$)/i);
      if (!item502Match) continue;

      const item502Text = item502Match[1];

      // Parse executive information
      const executiveChanges = parseExecutiveFromText(item502Text, filing.filingDate);
      changes.push(...executiveChanges);
    }
  } catch (error) {
    console.error('Error parsing 8-K executive changes:', error);
  }

  return changes.slice(0, 5); // Return top 5 most recent
}

/**
 * Helper to fetch raw filing text
 */
async function fetchFilingText(cik: string, accessionNumber: string): Promise<string | null> {
  try {
    const headers = {
      'User-Agent': 'Stalker App contact@example.com',
    };

    const accessionNoHyphens = accessionNumber.replace(/-/g, '');
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNoHyphens}/${accessionNumber}.txt`;

    const response = await fetch(url, { headers });
    if (!response.ok) return null;

    return await response.text();
  } catch (error) {
    return null;
  }
}

/**
 * Parse executive details from Item 5.02 text
 */
function parseExecutiveFromText(text: string, filingDate: string): ExecutiveChange[] {
  const changes: ExecutiveChange[] = [];

  // Common patterns for executive changes
  const appointmentPatterns = [
    /(?:appointed|elected|named|designated)\s+(?:as\s+)?([^\n,]+?)\s+(?:as\s+)?(?:the\s+)?(?:Company's\s+)?(Chief\s+\w+\s+Officer|C[IEOT]O|President|Chairman)/gi,
    /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:has been|was)\s+(?:appointed|elected|named)\s+(?:as\s+)?(?:the\s+)?(?:Company's\s+)?(Chief\s+\w+\s+Officer|C[IEOT]O)/gi,
  ];

  const departurePatterns = [
    /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+(?:the\s+)?(?:Company's\s+)?(Chief\s+\w+\s+Officer|C[IEOT]O)[,\s]+(?:has\s+)?(?:resigned|retired|departed|stepped down)/gi,
    /(?:resignation|retirement|departure)\s+of\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[,\s]+(?:the\s+)?(?:Company's\s+)?(Chief\s+\w+\s+Officer|C[IEOT]O)/gi,
  ];

  // Parse appointments
  for (const pattern of appointmentPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      const title = match[2].trim();

      // Extract effective date if mentioned
      const effectiveDateMatch = text.substring(Math.max(0, match.index - 200), match.index + 200)
        .match(/effective\s+(?:as of\s+)?(\w+\s+\d{1,2},\s+\d{4})/i);
      const effectiveDate = effectiveDateMatch ? effectiveDateMatch[1] : filingDate;

      changes.push({
        name,
        newTitle: title,
        changeType: 'appointment',
        effectiveDate,
        filingDate,
        ...classifyExecutiveChange(title, effectiveDate),
      });
    }
  }

  // Parse departures
  for (const pattern of departurePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      const title = match[2].trim();

      // Check for reason
      const reasonMatch = text.substring(match.index, match.index + 300)
        .match(/\b(retired|resignation|terminated|personal reasons|pursue other|health)/i);
      const reason = reasonMatch ? reasonMatch[1] : undefined;

      changes.push({
        name,
        previousTitle: title,
        changeType: 'departure',
        effectiveDate: filingDate,
        filingDate,
        reason,
        ...classifyExecutiveChange(title, filingDate),
      });
    }
  }

  return changes;
}

/**
 * Classify executive change priority and generate sales implications
 */
function classifyExecutiveChange(title: string, effectiveDate: string): {
  priority: 'HOT' | 'WARM' | 'MONITOR';
  daysInRole: number;
  salesImplication: string;
} {
  const today = new Date();
  const effective = new Date(effectiveDate);
  const daysInRole = Math.floor((today.getTime() - effective.getTime()) / (1000 * 60 * 60 * 24));

  const titleLower = title.toLowerCase();

  // HOT: Tech leadership (CIO, CTO, CDO, CISO)
  if (/c[ito]o|chief\s+(information|technology|data)\s+officer|ciso|chief\s+(?:information\s+)?security\s+officer/i.test(titleLower)) {
    let implication = 'New tech leadership typically re-evaluates vendor relationships and technology stack in first 90-180 days';
    if (daysInRole <= 30) {
      implication = '🔥 PRIME TIMING: Honeymoon period - building team and establishing priorities';
    } else if (daysInRole <= 90) {
      implication = '⚡ GOOD TIMING: Evaluating current tech stack and vendor relationships';
    } else if (daysInRole <= 180) {
      implication = '📋 MONITOR: Likely finalizing initial vendor selections';
    } else {
      implication = '⏳ LATE STAGE: Most vendor relationships established, harder to displace';
    }

    return {
      priority: 'HOT',
      daysInRole,
      salesImplication: implication,
    };
  }

  // WARM: CEO/CFO (strategic shifts, budget changes)
  if (/ceo|chief\s+executive|cfo|chief\s+financial/i.test(titleLower)) {
    return {
      priority: 'WARM',
      daysInRole,
      salesImplication: 'New CEO/CFO often drives strategic shifts and budget reallocation - monitor for tech priorities',
    };
  }

  // MONITOR: Other C-suite
  return {
    priority: 'MONITOR',
    daysInRole,
    salesImplication: 'C-suite change may influence departmental budgets and priorities',
  };
}

/**
 * Parse MD&A for strategic technology priorities
 */
function parseStrategicPriorities(mdaText: string, filingType: '10-K' | '10-Q', filingDate: string): StrategicPriority[] {
  const priorities: StrategicPriority[] = [];

  if (!mdaText) return priorities;

  // Define keyword patterns for tech priorities
  const priorityPatterns = [
    {
      category: 'Cloud' as const,
      intentKeywords: /(?:invest(?:ing|ment)?|plan(?:ning)?|initiative|focus|priority|commitment)/i,
      techKeywords: /cloud|AWS|Azure|GCP|cloud.?based|cloud.?native|cloud.?migration|SaaS/i,
      service: 'Cloud Services',
      alignment: 'DIRECT MATCH' as const
    },
    {
      category: 'Legacy Modernization' as const,
      intentKeywords: /(?:moderniz(?:e|ing|ation)|upgrad(?:e|ing)|replac(?:e|ing)|transform(?:ing|ation)?|migrat(?:e|ing|ion))/i,
      techKeywords: /legacy|mainframe|outdated|aging.?systems|on.?premise|monolithic/i,
      service: 'Legacy Modernization',
      alignment: 'DIRECT MATCH' as const
    },
    {
      category: 'Cybersecurity' as const,
      intentKeywords: /(?:invest(?:ing|ment)?|enhanc(?:e|ing)|strengthen(?:ing)?|improv(?:e|ing)|priority)/i,
      techKeywords: /cybersecurity|security|threat|breach|protection|zero.?trust|security.?posture/i,
      service: 'Security Services',
      alignment: 'DIRECT MATCH' as const
    },
    {
      category: 'AI/Automation' as const,
      intentKeywords: /(?:implement(?:ing)?|deploy(?:ing)?|adopt(?:ing)?|invest(?:ing|ment)?|initiative)/i,
      techKeywords: /artificial.?intelligence|machine.?learning|AI|automation|RPA|intelligent.?automation/i,
      service: 'AI/Automation Services',
      alignment: 'DIRECT MATCH' as const
    },
    {
      category: 'Digital Transformation' as const,
      intentKeywords: /(?:transform(?:ing|ation)?|digital(?:iz)?(?:e|ing|ation)?|moderniz(?:e|ing|ation))/i,
      techKeywords: /digital|platform|API|microservices|agile|DevOps/i,
      service: 'Digital Transformation',
      alignment: 'DIRECT MATCH' as const
    },
    {
      category: 'Infrastructure' as const,
      intentKeywords: /(?:invest(?:ing|ment)?|upgrad(?:e|ing)|expand(?:ing)?|enhanc(?:e|ing))/i,
      techKeywords: /infrastructure|data.?center|network|connectivity|bandwidth/i,
      service: 'Infrastructure Services',
      alignment: 'ADJACENT OPPORTUNITY' as const
    }
  ];

  // Split into sentences for analysis
  const sentences = mdaText.split(/\.\s+/);

  for (const sentence of sentences) {
    // Skip if too short or too long
    if (sentence.length < 50 || sentence.length > 500) continue;

    for (const pattern of priorityPatterns) {
      // Check if sentence has both intent and tech keywords
      if (pattern.intentKeywords.test(sentence) && pattern.techKeywords.test(sentence)) {
        // Extract budget if mentioned
        const budgetMatch = sentence.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:million|billion|M|B)/i);
        const budget = budgetMatch ? `$${budgetMatch[1]}${budgetMatch[2] ? budgetMatch[2][0].toUpperCase() : ''}` : undefined;

        // Clean up the statement
        let statement = sentence.trim();
        if (statement.length > 300) {
          statement = statement.substring(0, 300) + '...';
        }

        // Check for duplicates
        const isDuplicate = priorities.some(p =>
          p.category === pattern.category && p.statement.substring(0, 100) === statement.substring(0, 100)
        );

        if (!isDuplicate) {
          priorities.push({
            statement,
            category: pattern.category,
            budgetMentioned: budget,
            filingType,
            filingDate,
            serviceAlignment: pattern.alignment,
            serviceCategory: pattern.service
          });
        }

        break; // Only assign one category per sentence
      }
    }

    // Limit to top 8 priorities
    if (priorities.length >= 8) break;
  }

  return priorities.slice(0, 5); // Return top 5
}

/**
 * Generate pain signals from legal and risk data
 */
function generatePainSignals(legalProceedings: LegalProceeding[], riskFactors: string[]): string[] {
  const signals: string[] = [];

  // Legal-based pain signals
  if (legalProceedings.length > 0) {
    const totalFines = legalProceedings
      .filter(p => p.amount)
      .map(p => p.amount || '')
      .join(', ');

    if (totalFines) {
      signals.push(`Active legal exposure: ${totalFines} in disclosed proceedings`);
    }

    const investigations = legalProceedings.filter(p => p.type === 'investigation').length;
    if (investigations > 0) {
      signals.push(`${investigations} active regulatory investigation(s) disclosed`);
    }

    const settlements = legalProceedings.filter(p => p.type === 'settlement').length;
    if (settlements > 0) {
      signals.push(`${settlements} recent settlement(s) - compliance remediation likely needed`);
    }
  }

  // Risk-based pain signals
  if (riskFactors.length > 0) {
    signals.push(`${riskFactors.length} material risk factors disclosed in latest filing`);

    // Check for technology-related risks
    const techRisks = riskFactors.filter(r =>
      /cybersecurity|technology|IT|infrastructure|digital|data breach|system/i.test(r)
    );

    if (techRisks.length > 0) {
      signals.push(`Technology risk identified: Cybersecurity/IT infrastructure concerns disclosed`);
    }

    // Check for regulatory risks
    const regRisks = riskFactors.filter(r =>
      /regulatory|compliance|SEC|government|law|regulation/i.test(r)
    );

    if (regRisks.length > 0) {
      signals.push(`Regulatory compliance risk: Active monitoring of evolving regulations required`);
    }
  }

  return signals.slice(0, 5); // Limit to 5 most critical signals
}

/**
 * Extract specific section from filing text using Item numbers
 */
function extractSection(text: string, sectionPattern: RegExp): string | null {
  const match = text.match(sectionPattern);
  if (!match) return null;

  // Get text after the section header
  const startIndex = match.index! + match[0].length;
  const remainingText = text.substring(startIndex);

  // Find the next section (Item or Part)
  const nextSectionMatch = remainingText.match(/(?:ITEM|PART)\s+\d+[A-Z]?[\.\s]/i);
  const endIndex = nextSectionMatch ? nextSectionMatch.index! : Math.min(50000, remainingText.length);

  return remainingText.substring(0, endIndex).trim();
}

/**
 * Fetch and parse specific sections from SEC filing
 */
async function fetchFilingSections(cik: string, accessionNumber: string, filingType: string): Promise<{
  riskFactors?: string;
  legalProceedings?: string;
  mda?: string;
  fiscalYearEnd?: string;
} | null> {
  try {
    const headers = {
      'User-Agent': 'Stalker App contact@example.com',
      'Accept': 'text/html',
    };

    // Construct filing URL
    const accessionNoHyphens = accessionNumber.replace(/-/g, '');
    const url = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik, 10)}/${accessionNoHyphens}/${accessionNumber}.txt`;

    console.log(`Fetching SEC filing: ${url}`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error('SEC filing fetch error:', response.status);
      return null;
    }

    const rawText = await response.text();

    // Extract fiscal year end from filing header (before cleaning)
    let fiscalYearEnd: string | undefined;
    if (filingType === '10-K') {
      const fyPatterns = [
        /for\s+the\s+fiscal\s+year\s+ended\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
        /fiscal\s+year\s+ended?\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
        /year\s+ended\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
      ];

      for (const pattern of fyPatterns) {
        const match = rawText.match(pattern);
        if (match) {
          fiscalYearEnd = match[1];
          console.log(`✓ Fiscal year end extracted: ${fiscalYearEnd}`);
          break;
        }
      }
    }

    // Clean HTML/SGML tags but preserve structure
    const cleanedText = rawText
      .replace(/<(?:TABLE|TR|TD)[^>]*>[\s\S]*?<\/(?:TABLE|TR|TD)>/gi, ' ') // Remove tables
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const sections: { riskFactors?: string; legalProceedings?: string; mda?: string; fiscalYearEnd?: string } = {};

    if (filingType === '10-K') {
      // Item 1A: Risk Factors
      const riskFactorsPattern = /ITEM\s+1A[\.\s]+RISK\s+FACTORS/i;
      sections.riskFactors = extractSection(cleanedText, riskFactorsPattern) || undefined;

      // Item 3: Legal Proceedings
      const legalPattern = /ITEM\s+3[\.\s]+LEGAL\s+PROCEEDINGS/i;
      sections.legalProceedings = extractSection(cleanedText, legalPattern) || undefined;

      // Item 7: MD&A
      const mdaPattern = /ITEM\s+7[\.\s]+MANAGEMENT[''']?S\s+DISCUSSION\s+AND\s+ANALYSIS/i;
      sections.mda = extractSection(cleanedText, mdaPattern) || undefined;
    } else if (filingType === '10-Q') {
      // Part II, Item 1: Legal Proceedings
      const legalPattern = /(?:PART\s+II|PART\s+2)[\s\S]{0,500}ITEM\s+1[\.\s]+LEGAL\s+PROCEEDINGS/i;
      sections.legalProceedings = extractSection(cleanedText, legalPattern) || undefined;

      // Part I, Item 2: MD&A
      const mdaPattern = /(?:PART\s+I|PART\s+1)[\s\S]{0,500}ITEM\s+2[\.\s]+MANAGEMENT[''']?S\s+DISCUSSION\s+AND\s+ANALYSIS/i;
      sections.mda = extractSection(cleanedText, mdaPattern) || undefined;
    }

    console.log(`Extracted sections - Risk Factors: ${!!sections.riskFactors}, Legal: ${!!sections.legalProceedings}, MD&A: ${!!sections.mda}, FY End: ${fiscalYearEnd || 'N/A'}`);

    return { ...sections, fiscalYearEnd };
  } catch (error) {
    console.error('Error fetching SEC filing:', error);
    return null;
  }
}

/**
 * Get comprehensive SEC data for a company (with caching)
 */
export async function getSECData(companyNameOrTicker: string, forceRefresh = false): Promise<SECData | null> {
  console.log(`Getting SEC data for: ${companyNameOrTicker} ${forceRefresh ? '(FORCE REFRESH)' : ''}`);

  // Step 1: Search for CIK
  const companyInfo = await searchCompanyCIK(companyNameOrTicker);

  if (!companyInfo) {
    console.log(`Company not found in SEC database: ${companyNameOrTicker}`);
    return null;
  }

  console.log(`Found company: ${companyInfo.name} (CIK: ${companyInfo.cik})`);

  // Step 2: Check cache (unless force refresh requested)
  if (!forceRefresh) {
    const { getCachedSECData } = await import('./sec-cache');
    const cachedData = getCachedSECData(companyInfo.cik);
    if (cachedData) {
      return cachedData; // Return cached data immediately (zero API calls!)
    }
  }

  // Step 2: Fetch submissions
  const submissions = await fetchCompanySubmissions(companyInfo.cik);

  if (!submissions) {
    return null;
  }

  // Step 3: Extract latest filings
  const { latest10K, latest10Q } = extractLatestFilings(submissions);

  console.log(`Latest 10-K: ${latest10K?.filingDate || 'None'}`);
  console.log(`Latest 10-Q: ${latest10Q?.filingDate || 'None'}`);

  // Step 4: Fetch and parse filing documents with proper section extraction
  let sections: { riskFactors?: string; legalProceedings?: string; mda?: string; fiscalYearEnd?: string } | null = null;
  let filingType: string | undefined;

  // Prefer 10-K for most comprehensive data
  if (latest10K) {
    sections = await fetchFilingSections(companyInfo.cik, latest10K.accessionNumber, '10-K');
    filingType = '10-K';
  }

  // If 10-K failed or doesn't exist, try 10-Q
  if (!sections && latest10Q) {
    sections = await fetchFilingSections(companyInfo.cik, latest10Q.accessionNumber, '10-Q');
    filingType = '10-Q';
  }

  // Step 5: Parse legal proceedings and risks from extracted sections
  const legalProceedings = sections?.legalProceedings
    ? parseLegalProceedings(sections.legalProceedings)
    : [];
  const riskFactors = sections?.riskFactors
    ? extractRiskFactors(sections.riskFactors)
    : [];

  // Process risks with AI-powered categorization for sales intelligence
  const filingDate = latest10K?.filingDate || latest10Q?.filingDate || '';
  const processedRisks = sections?.riskFactors
    ? processRiskFactors(sections.riskFactors, filingDate)
    : [];

  const painSignals = generatePainSignals(legalProceedings, riskFactors);

  // Step 6: Extract financial metrics from SEC XBRL Company Facts API
  let financials = await extractFinancialMetrics(companyInfo.cik);

  // Step 6b: Enhance financials with fiscal year and CapEx trends
  if (financials && sections?.fiscalYearEnd) {
    const fiscalYear = processFiscalYearInfo(sections.fiscalYearEnd);
    if (fiscalYear) {
      console.log(`✓ Fiscal year: ${fiscalYear.monthDay}, ${fiscalYear.daysUntilFYE} days until FYE, ${fiscalYear.budgetCyclePhase}`);
      financials = { ...financials, fiscalYear };
    }
  }

  // Parse CapEx trends from MD&A if available
  if (financials && sections?.mda) {
    const capExTrend = parseCapExTrends(sections.mda);
    if (capExTrend.length > 0) {
      console.log(`✓ Found ${capExTrend.length} CapEx/tech investment mentions`);
      financials = { ...financials, capExTrend };
    }
  }

  // Step 7: Parse 8-K executive changes (Item 5.02)
  console.log('Parsing 8-K executive changes...');
  const executiveChanges = await parse8KExecutiveChanges(companyInfo.cik);
  if (executiveChanges.length > 0) {
    console.log(`✓ Found ${executiveChanges.length} executive changes`);
  }

  // Step 8: Parse strategic priorities from MD&A
  console.log('Parsing strategic priorities from MD&A...');
  const strategicPriorities: StrategicPriority[] = [];
  if (sections?.mda) {
    // Prefer 10-Q MD&A as more current, fallback to 10-K
    if (latest10Q && filingType === '10-Q') {
      strategicPriorities.push(...parseStrategicPriorities(sections.mda, '10-Q', latest10Q.filingDate));
    } else if (latest10K && filingType === '10-K') {
      strategicPriorities.push(...parseStrategicPriorities(sections.mda, '10-K', latest10K.filingDate));
    }
  }
  if (strategicPriorities.length > 0) {
    console.log(`✓ Found ${strategicPriorities.length} strategic priorities`);
  }

  // Step 9: Calculate legal exposure summary
  let legalExposure: LegalExposureSummary | undefined;
  if (legalProceedings.length > 0) {
    // Extract annual revenue from financials for material risk calculation
    let annualRevenue: number | undefined;
    if (financials?.revenue) {
      // Parse revenue string (e.g., "$1.2B" -> 1200000000)
      const revenueStr = financials.revenue.replace(/[$,]/g, '');
      const revenueNum = parseFloat(revenueStr);
      if (revenueStr.includes('B')) {
        annualRevenue = revenueNum * 1e9;
      } else if (revenueStr.includes('M')) {
        annualRevenue = revenueNum * 1e6;
      } else {
        annualRevenue = revenueNum;
      }
    }

    legalExposure = calculateLegalExposure(legalProceedings, annualRevenue);
    console.log(`✓ Legal exposure: ${legalExposure.totalExposureFormatted} across ${legalExposure.totalCases} cases (Risk: ${legalExposure.riskLevel})`);
  }

  const secData: SECData = {
    companyName: companyInfo.name,
    cik: companyInfo.cik,
    ticker: companyInfo.ticker,
    latest10K,
    latest10Q,
    legalProceedings,
    legalExposure,
    riskFactors,
    processedRisks: processedRisks.length > 0 ? processedRisks : undefined,
    executiveChanges: executiveChanges.length > 0 ? executiveChanges : undefined,
    strategicPriorities: strategicPriorities.length > 0 ? strategicPriorities : undefined,
    painSignals,
    financials: financials || undefined,
  };

  // Step 7: Save to cache for future requests
  const { cacheSECData } = await import('./sec-cache');
  cacheSECData(secData);

  return secData;
}
