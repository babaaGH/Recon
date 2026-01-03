// Headquarters Detection - SEC EDGAR + Serper fallback with caching
import Database from 'better-sqlite3';
import path from 'path';

// Region mapping for US states
const US_REGIONS = {
  'EAST COAST': ['NY', 'NJ', 'PA', 'CT', 'MA', 'RI', 'NH', 'VT', 'ME', 'DE', 'MD', 'DC', 'VA'],
  'SOUTH': ['WV', 'NC', 'SC', 'GA', 'FL', 'KY', 'TN', 'MS', 'AL', 'AR', 'LA', 'OK', 'TX'],
  'MIDWEST': ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
  'WEST': ['MT', 'ID', 'WY', 'CO', 'NM', 'AZ', 'UT', 'NV', 'CA', 'OR', 'WA', 'AK', 'HI']
} as const;

interface HQResult {
  headquarters: string;
  region: string;
  source: 'sec' | 'serper' | 'cache' | 'unknown';
}

interface CachedHQ {
  company_name: string;
  headquarters: string;
  region: string;
  source: string;
  last_updated: number;
}

// Initialize SQLite cache database
let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'company-metadata.db');
  db = new Database(dbPath);

  // Create company_metadata table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_metadata (
      company_name TEXT PRIMARY KEY,
      headquarters TEXT NOT NULL,
      region TEXT NOT NULL,
      source TEXT NOT NULL,
      last_updated INTEGER NOT NULL
    )
  `);

  console.log('✓ Company metadata cache database initialized');
  return db;
}

/**
 * Get region from US state code
 */
function getUSRegion(stateCode: string): string | null {
  const normalizedState = stateCode.toUpperCase().trim();

  for (const [region, states] of Object.entries(US_REGIONS)) {
    if ((states as readonly string[]).includes(normalizedState)) {
      return region;
    }
  }

  return null;
}

/**
 * Get cached HQ data (90 day cache)
 */
function getCachedHQ(companyName: string): HQResult | null {
  try {
    const database = getDatabase();
    const stmt = database.prepare('SELECT * FROM company_metadata WHERE company_name = ?');
    const cached = stmt.get(companyName.toLowerCase()) as CachedHQ | undefined;

    if (!cached) return null;

    // Check if cache is still valid (90 days)
    const ageInDays = (Date.now() - cached.last_updated) / (1000 * 60 * 60 * 24);
    if (ageInDays > 90) {
      console.log(`Cache expired for ${companyName} (${ageInDays.toFixed(0)} days old)`);
      return null;
    }

    console.log(`✓ Cache HIT for ${companyName} HQ (${ageInDays.toFixed(0)} days old)`);
    return {
      headquarters: cached.headquarters,
      region: cached.region,
      source: 'cache'
    };
  } catch (error) {
    console.error('Error reading HQ cache:', error);
    return null;
  }
}

/**
 * Cache HQ data
 */
function cacheHQ(companyName: string, hq: string, region: string, source: 'sec' | 'serper'): void {
  try {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO company_metadata (company_name, headquarters, region, source, last_updated)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(companyName.toLowerCase(), hq, region, source, Date.now());
    console.log(`✓ Cached HQ for ${companyName}: ${hq} | Region: ${region}`);
  } catch (error) {
    console.error('Error caching HQ:', error);
  }
}

/**
 * Extract HQ from SEC EDGAR submissions data
 */
async function getHQFromSEC(cik: string): Promise<HQResult | null> {
  try {
    // Pad CIK to 10 digits
    const paddedCIK = cik.padStart(10, '0');
    const url = `https://data.sec.gov/submissions/CIK${paddedCIK}.json`;

    console.log(`Fetching SEC submissions for CIK ${paddedCIK}...`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Sales Intelligence Tool contact@example.com',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`SEC submissions API returned ${response.status} for CIK ${cik}`);
      return null;
    }

    const data = await response.json();

    // Extract mailing address
    const mailingAddress = data.addresses?.mailing;
    if (!mailingAddress) {
      console.log(`No mailing address found in SEC data for CIK ${cik}`);
      return null;
    }

    const city = mailingAddress.city;
    const stateOrCountry = mailingAddress.stateOrCountry;
    const zipCode = mailingAddress.zipCode;

    if (!city || !stateOrCountry) {
      console.log(`Incomplete address data for CIK ${cik}`);
      return null;
    }

    // Determine if US or international
    const region = getUSRegion(stateOrCountry);

    let headquarters: string;
    let regionLabel: string;

    if (region) {
      // US company
      headquarters = `${city}, ${stateOrCountry.toUpperCase()}, USA`;
      regionLabel = region;
    } else if (stateOrCountry === 'CA' || ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].includes(stateOrCountry)) {
      // Canada
      headquarters = `${city}, ${stateOrCountry.toUpperCase()}, Canada`;
      regionLabel = 'CANADA';
    } else {
      // International
      headquarters = `${city}, ${stateOrCountry}`;
      regionLabel = 'INTERNATIONAL';
    }

    console.log(`✓ SEC HQ extracted: ${headquarters} | Region: ${regionLabel}`);

    return {
      headquarters,
      region: regionLabel,
      source: 'sec'
    };
  } catch (error) {
    console.error('Error fetching SEC submissions:', error);
    return null;
  }
}

/**
 * Extract HQ from Serper search results
 */
async function getHQFromSerper(companyName: string): Promise<HQResult | null> {
  try {
    const SERPER_API_KEY = process.env.SERPER_API_KEY;
    if (!SERPER_API_KEY) {
      console.log('No Serper API key - skipping HQ search');
      return null;
    }

    const query = `"${companyName}" ("headquarters" OR "headquartered in" OR "based in")`;
    console.log(`Searching Serper for HQ: ${query}`);

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 5
      })
    });

    if (!response.ok) {
      console.log(`Serper API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Check knowledge graph first
    if (data.knowledgeGraph?.headquarters) {
      const hq = data.knowledgeGraph.headquarters;
      return parseHQString(hq);
    }

    // Parse organic results
    const allText = [
      data.answerBox?.snippet || '',
      ...(data.organic || []).map((r: any) => r.snippet || '')
    ].join(' ');

    // Patterns to extract HQ
    const patterns = [
      /headquartered in ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})/i,  // "headquartered in San Francisco, CA"
      /based in ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})/i,         // "based in New York, NY"
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2}),?\s*USA/i,          // "Cupertino, CA, USA"
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2}),?\s*United States/i // "Seattle, WA, United States"
    ];

    for (const pattern of patterns) {
      const match = allText.match(pattern);
      if (match) {
        const city = match[1];
        const state = match[2];
        return parseHQString(`${city}, ${state}`);
      }
    }

    console.log(`Could not extract HQ from Serper results for ${companyName}`);
    return null;
  } catch (error) {
    console.error('Error searching Serper for HQ:', error);
    return null;
  }
}

/**
 * Parse HQ string and determine region
 */
function parseHQString(hqString: string): HQResult | null {
  // Try to extract city, state/province, country
  const patterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2}),?\s*USA/i,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2}),?\s*United States/i,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2}),?\s*Canada/i,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})/i
  ];

  for (const pattern of patterns) {
    const match = hqString.match(pattern);
    if (match) {
      const city = match[1];
      const stateOrProvince = match[2].toUpperCase();

      const region = getUSRegion(stateOrProvince);

      if (region) {
        // US location
        return {
          headquarters: `${city}, ${stateOrProvince}, USA`,
          region: region,
          source: 'serper'
        };
      } else if (['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].includes(stateOrProvince)) {
        // Canada
        return {
          headquarters: `${city}, ${stateOrProvince}, Canada`,
          region: 'CANADA',
          source: 'serper'
        };
      }
    }
  }

  // International or unparseable - return as-is
  return {
    headquarters: hqString,
    region: 'INTERNATIONAL',
    source: 'serper'
  };
}

/**
 * Main HQ detection function
 * Priority: Cache > SEC EDGAR > Serper > Unknown
 */
export async function detectHeadquarters(
  companyName: string,
  cik?: string
): Promise<HQResult> {
  console.log(`\n=== HQ Detection for ${companyName} ===`);

  // 1. Check cache first (90 day cache)
  const cached = getCachedHQ(companyName);
  if (cached) {
    return cached;
  }

  // 2. Try SEC EDGAR for US public companies
  if (cik) {
    const secResult = await getHQFromSEC(cik);
    if (secResult) {
      cacheHQ(companyName, secResult.headquarters, secResult.region, 'sec');
      return secResult;
    }
  }

  // 3. Fallback to Serper for private/foreign companies
  const serperResult = await getHQFromSerper(companyName);
  if (serperResult) {
    cacheHQ(companyName, serperResult.headquarters, serperResult.region, 'serper');
    return serperResult;
  }

  // 4. All sources failed
  console.log(`✗ Could not determine HQ for ${companyName}`);
  return {
    headquarters: '[Not publicly disclosed]',
    region: 'UNKNOWN',
    source: 'unknown'
  };
}

/**
 * Get display-friendly HQ string with region
 */
export function formatHeadquarters(hqResult: HQResult): string {
  if (hqResult.headquarters === '[Not publicly disclosed]') {
    return 'HQ: [Not publicly disclosed]';
  }

  // Region is already uppercase, just add brackets
  if (hqResult.region === 'UNKNOWN') {
    return `HQ: ${hqResult.headquarters}`;
  }

  // Always show "HQ: {location} | Region: [{REGION}]"
  return `HQ: ${hqResult.headquarters} | Region: [${hqResult.region}]`;
}
