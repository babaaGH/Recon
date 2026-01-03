// AI Intelligence Engine - Real-time web intelligence using Serper API
import {
  searchWeb,
  searchCompanyFinancials,
  searchCompanyITNews,
  inferOrgType
} from './serper';
import { detectHeadquarters, formatHeadquarters } from './hq-detection';

export interface CompanyIntel {
  company_name: string;
  operational_focus: string;
  industry: string;
  org_type: 'FI' | 'Bank' | 'Payment Processor' | 'Credit Union';
  region: 'East Coast' | 'South' | 'Mid-West' | 'West' | 'Canada';
  hq: string;
  revenue: string;
  stature: string;
  it_signal: string;
  executive_summary: string;
}

// Mock database of company intelligence
const MOCK_INTEL_DATABASE: Record<string, CompanyIntel> = {
  'jpmorgan chase': {
    company_name: 'JPMorgan Chase',
    operational_focus: 'The largest U.S. bank providing consumer banking, credit cards, investment banking, and asset management to millions of customers and businesses worldwide.',
    industry: 'Banking',
    org_type: 'Bank',
    region: 'East Coast',
    hq: 'New York, NY',
    revenue: '$158.1B (2024)',
    stature: 'Dominant - Largest US Bank',
    it_signal: 'Spending $15B annually on technology. Focus on AI, blockchain, and quantum computing research. Recently announced digital banking expansion.',
    executive_summary: 'JPMorgan Chase leads US banking with $158.1B revenue and invests $15B annually in cutting-edge technology including AI, blockchain, and quantum computing. Their aggressive digital banking expansion and technology-first approach makes them a prime target for innovative IT services partnerships.'
  },
  'wells fargo': {
    company_name: 'Wells Fargo',
    operational_focus: 'A leading diversified financial services company serving consumers, small businesses, and corporations through banking, investments, mortgage, and consumer finance services across the United States.',
    industry: 'Banking',
    org_type: 'Bank',
    region: 'West',
    hq: 'San Francisco, CA',
    revenue: '$87.4B (2024)',
    stature: 'Recovering - Regulatory Scrutiny Easing',
    it_signal: 'Rebuilding risk management infrastructure. Seeking technology partners for compliance automation and data governance solutions.',
    executive_summary: 'Wells Fargo is rebuilding their risk management infrastructure following regulatory challenges, creating significant opportunities for compliance automation and data governance solutions. With $87.4B in revenue and renewed focus on technology modernization, they represent a strategic opportunity in the banking transformation space.'
  },
  'coinbase': {
    company_name: 'Coinbase',
    operational_focus: 'A cryptocurrency exchange and digital asset platform enabling individuals and institutions to buy, sell, store, and manage cryptocurrencies while expanding into regulated financial services and blockchain infrastructure.',
    industry: 'Cryptocurrency',
    org_type: 'FI',
    region: 'West',
    hq: 'San Francisco, CA',
    revenue: '$3.1B (2024)',
    stature: 'Volatile - Crypto Market Dependent',
    it_signal: 'Building institutional-grade custody solutions. Need for scalable infrastructure and enhanced security services as they expand into traditional finance.',
    executive_summary: 'Coinbase is expanding into traditional finance with institutional-grade custody solutions, requiring scalable infrastructure and enhanced security services. Despite market volatility, their $3.1B revenue and strategic pivot toward regulated financial services creates opportunities for enterprise IT partnerships.'
  },
  'paypal': {
    company_name: 'PayPal',
    operational_focus: 'A global digital payments platform enabling secure online transactions, peer-to-peer money transfers, and merchant payment processing for consumers and businesses worldwide through PayPal, Venmo, and other digital wallet solutions.',
    industry: 'Fintech',
    org_type: 'Payment Processor',
    region: 'West',
    hq: 'San Jose, CA',
    revenue: '$29.8B (2024)',
    stature: 'Mature - Market Leader Under Pressure',
    it_signal: 'Modernizing payments platform to compete with newer fintech players. Focus on BNPL (Buy Now Pay Later) and cryptocurrency integration.',
    executive_summary: 'PayPal is modernizing its payments platform with focus on BNPL and cryptocurrency integration to compete with emerging fintech competitors. With $29.8B revenue and market-leading position, they need strategic technology partners to accelerate platform transformation and maintain competitive edge.'
  },
  'square': {
    company_name: 'Square (Block)',
    operational_focus: 'A financial technology company providing point-of-sale hardware, payment processing, business management tools, and digital banking services for small businesses, along with Cash App for peer-to-peer payments and Bitcoin services.',
    industry: 'Fintech',
    org_type: 'Payment Processor',
    region: 'West',
    hq: 'San Francisco, CA',
    revenue: '$21.9B (2024)',
    stature: 'Growing - Diversifying Beyond Payments',
    it_signal: 'Expanding into banking services and Bitcoin ecosystem. Need for integrated payment, banking, and crypto infrastructure.',
    executive_summary: 'Square (Block) is aggressively diversifying beyond payments into banking services and the Bitcoin ecosystem, requiring integrated infrastructure solutions. Their $21.9B revenue and expansion strategy creates opportunities for IT services that can bridge traditional payments, banking, and cryptocurrency technologies.'
  },
  'american express': {
    company_name: 'American Express',
    operational_focus: 'A premium financial services company offering charge and credit cards, travel services, and merchant payment processing with a focus on affluent consumers and business clients seeking exclusive benefits and rewards programs.',
    industry: 'Financial Services',
    org_type: 'FI',
    region: 'East Coast',
    hq: 'New York, NY',
    revenue: '$60.5B (2024)',
    stature: 'Stable - Premium Market Leader',
    it_signal: 'Investing in personalized rewards platform using AI/ML. Modernizing merchant payment processing infrastructure.',
    executive_summary: 'American Express is investing heavily in AI-driven personalized rewards and modernizing merchant payment processing infrastructure. As a premium market leader with $60.5B revenue, they seek technology partners who can deliver sophisticated, high-touch solutions for their affluent customer base.'
  },
  'td bank': {
    company_name: 'TD Bank',
    operational_focus: 'One of Canada\'s largest banks providing retail, commercial, and investment banking services across North America with a strong presence in both the Canadian and U.S. markets through a network of branches and digital channels.',
    industry: 'Banking',
    org_type: 'Bank',
    region: 'Canada',
    hq: 'Toronto, ON',
    revenue: '$43.3B CAD (2024)',
    stature: 'Stable - Top Canadian Bank',
    it_signal: 'Digital transformation initiative focusing on customer experience. Seeking vendors for omnichannel banking platform development.',
    executive_summary: 'TD Bank is executing a major digital transformation focused on omnichannel customer experience, seeking technology vendors for platform development. As a top Canadian bank with $43.3B CAD revenue, they represent a stable, strategic opportunity in the North American banking modernization market.'
  },
  'chime': {
    company_name: 'Chime',
    operational_focus: 'A mobile-first digital banking platform offering fee-free checking and savings accounts, early direct deposit, and automatic savings tools designed to help members build financial health without traditional banking fees.',
    industry: 'Fintech',
    org_type: 'FI',
    region: 'West',
    hq: 'San Francisco, CA',
    revenue: '$2.3B (2024 est)',
    stature: 'Growing - Leading Digital Bank',
    it_signal: 'Scaling infrastructure to support 15M+ users. Focus on real-time payments and financial wellness features.',
    executive_summary: 'Chime is rapidly scaling infrastructure to support 15M+ users with focus on real-time payments and financial wellness features. As the leading digital-only bank with $2.3B revenue, they need agile technology partners to support hypergrowth while maintaining reliability and security.'
  },
  'mastercard': {
    company_name: 'Mastercard',
    operational_focus: 'A global payment technology company connecting consumers, businesses, merchants, and governments across 200+ countries through electronic payment processing, fraud prevention, and digital identity verification solutions.',
    industry: 'Financial Services',
    org_type: 'Payment Processor',
    region: 'East Coast',
    hq: 'Purchase, NY',
    revenue: '$25.1B (2024)',
    stature: 'Dominant - Global Payment Network',
    it_signal: 'Expanding open banking APIs and digital identity solutions. Investing in real-time payment networks and fraud prevention AI.',
    executive_summary: 'Mastercard is expanding open banking capabilities and investing in real-time payment networks with advanced fraud prevention AI. With $25.1B revenue and global reach, they seek strategic technology partners to accelerate innovation in digital payments and financial services infrastructure.'
  }
};

/**
 * Real AI-powered company intelligence search using Serper API
 */
export async function searchCompanyIntel(companyName: string): Promise<CompanyIntel | null> {
  const normalizedName = companyName.toLowerCase().trim();

  // Check if we have cached/mock data for this company first
  if (MOCK_INTEL_DATABASE[normalizedName]) {
    console.log(`Using cached data for ${companyName}`);
    return MOCK_INTEL_DATABASE[normalizedName];
  }

  console.log(`Searching real-time intelligence for ${companyName}...`);

  try {
    // Try to get CIK for SEC EDGAR HQ lookup
    let cik: string | undefined;
    try {
      const cikResponse = await fetch(
        `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&action=getcompany&output=json`,
        {
          headers: { 'User-Agent': 'Sales Intelligence Tool contact@example.com' }
        }
      );
      if (cikResponse.ok) {
        const cikData = await cikResponse.json();
        cik = cikData?.cik;
        console.log(`Found CIK for ${companyName}: ${cik}`);
      }
    } catch (error) {
      console.log(`Could not lookup CIK for ${companyName}`);
    }

    // Perform parallel searches for different aspects
    const [generalSearch, financials, itNews, hqResult] = await Promise.all([
      searchWeb(companyName + ' company headquarters type'),
      searchCompanyFinancials(companyName),
      searchCompanyITNews(companyName),
      detectHeadquarters(companyName, cik)
    ]);

    // Infer org type from search results
    const org_type = inferOrgType(companyName, generalSearch || undefined);

    // Use HQ detection result
    const hq = formatHeadquarters(hqResult);
    // Ensure region is one of the valid values, default to 'East Coast'
    const validRegions: Array<'East Coast' | 'South' | 'Mid-West' | 'West' | 'Canada'> = ['East Coast', 'South', 'Mid-West', 'West', 'Canada'];
    const region = validRegions.includes(hqResult.region as any)
      ? (hqResult.region as 'East Coast' | 'South' | 'Mid-West' | 'West' | 'Canada')
      : 'East Coast';

    // Determine industry from knowledge graph or name
    let industry = 'Financial Services';
    if (generalSearch?.knowledgeGraph?.type) {
      industry = generalSearch.knowledgeGraph.type;
    } else if (companyName.toLowerCase().includes('bank')) {
      industry = 'Banking';
    } else if (companyName.toLowerCase().includes('pay') || companyName.toLowerCase().includes('card')) {
      industry = 'Payments';
    }

    // Extract operational focus from knowledge graph description
    let operational_focus = `${companyName} operates in the ${industry.toLowerCase()} sector providing financial services and solutions.`;
    if (generalSearch?.knowledgeGraph?.description) {
      // Use the knowledge graph description as operational focus (Google's summary is usually concise)
      operational_focus = generalSearch.knowledgeGraph.description;
    }

    // Generate executive summary
    const executive_summary = generateExecutiveSummary(companyName, financials, itNews, industry);

    return {
      company_name: companyName,
      operational_focus: operational_focus,
      industry: industry,
      org_type: org_type,
      region: region,
      hq: hq,
      revenue: financials,
      stature: 'Active - Market Participant',
      it_signal: itNews,
      executive_summary: executive_summary
    };
  } catch (error) {
    console.error('Error gathering intelligence:', error);
    // Fallback to generic intelligence
    return generateGenericIntel(companyName);
  }
}

/**
 * Generate executive summary from gathered intelligence
 */
function generateExecutiveSummary(companyName: string, revenue: string, itSignal: string, industry: string): string {
  // Extract key points from IT signal
  const hasCloudMention = itSignal.toLowerCase().includes('cloud');
  const hasAIMention = itSignal.toLowerCase().includes('ai') || itSignal.toLowerCase().includes('artificial intelligence');
  const hasDigitalMention = itSignal.toLowerCase().includes('digital');

  let summary = `${companyName} is actively operating in the ${industry.toLowerCase()} sector`;

  if (revenue && !revenue.includes('not available')) {
    summary += ` with reported revenue of ${revenue}`;
  }

  summary += '. ';

  // Second sentence about technology initiatives
  if (hasAIMention && hasCloudMention) {
    summary += `Their focus on AI and cloud technologies creates strong opportunities for IT services partnerships in digital transformation.`;
  } else if (hasCloudMention) {
    summary += `Their cloud infrastructure initiatives present opportunities for technology consulting and implementation services.`;
  } else if (hasDigitalMention) {
    summary += `Their digital transformation efforts indicate potential for IT services engagement and technology modernization projects.`;
  } else {
    summary += `Further research recommended to identify specific technology needs and decision-makers for potential IT services partnerships.`;
  }

  return summary;
}

function generateGenericIntel(companyName: string): CompanyIntel {
  // Simple heuristics to guess company type based on name
  const nameLower = companyName.toLowerCase();

  let org_type: CompanyIntel['org_type'] = 'FI';
  let industry = 'Financial Services';
  let operational_focus = `${companyName} operates in the financial services sector providing banking and financial solutions to customers.`;

  if (nameLower.includes('bank')) {
    org_type = 'Bank';
    industry = 'Banking';
    operational_focus = `A financial institution providing banking services including deposits, loans, and financial products to consumers and businesses.`;
  } else if (nameLower.includes('credit union')) {
    org_type = 'Credit Union';
    industry = 'Credit Union';
    operational_focus = `A member-owned financial cooperative providing banking services, loans, and savings products to its members.`;
  } else if (nameLower.includes('pay') || nameLower.includes('card')) {
    org_type = 'Payment Processor';
    industry = 'Payments';
    operational_focus = `A payment technology company providing electronic payment processing and financial transaction services to merchants and consumers.`;
  }

  return {
    company_name: companyName,
    operational_focus: operational_focus,
    industry: industry,
    org_type: org_type,
    region: 'East Coast', // Default
    hq: 'Unknown',
    revenue: 'Data not available',
    stature: 'Research Required',
    it_signal: `${companyName} is active in the financial services sector. Manual research recommended to identify specific IT transformation initiatives and technology priorities.`,
    executive_summary: `${companyName} operates in the ${industry.toLowerCase()} sector. Further intelligence gathering recommended to identify specific technology needs, decision makers, and engagement opportunities for IT services.`
  };
}

/**
 * Get list of all companies we have intelligence on (for autocomplete/suggestions)
 */
export function getKnownCompanies(): string[] {
  return Object.values(MOCK_INTEL_DATABASE).map(intel => intel.company_name);
}
