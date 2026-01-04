// SQLite caching for SEC EDGAR data
import Database from 'better-sqlite3';
import path from 'path';
import { SECData } from './sec-edgar';

const DB_PATH = path.join(process.cwd(), 'sec-cache.db');

// Cache TTL (Time To Live) in days
const CACHE_TTL = {
  '10-K': 365,  // Annual reports - cache for 1 year
  '10-Q': 90,   // Quarterly reports - cache for 90 days
  '8-K': 7,     // Event-driven - cache for 7 days
  'default': 30 // Fallback
};

interface CachedSECData extends SECData {
  cachedAt: string;
  expiresAt: string;
  isCached?: boolean;
}

let db: Database.Database | null = null;

/**
 * Initialize SQLite database and create tables
 */
function initDatabase(): Database.Database | null {
  if (db) return db;

  try {
    db = new Database(DB_PATH);

    // Create SEC filings cache table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sec_filings_cache (
        cik TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        data TEXT NOT NULL,
        filing_type TEXT,
        cached_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cik ON sec_filings_cache(cik);
      CREATE INDEX IF NOT EXISTS idx_expires_at ON sec_filings_cache(expires_at);
    `);

    console.log('✓ SEC cache database initialized');
    return db;
  } catch (error) {
    console.warn('⚠ SEC cache database not available (serverless environment), caching disabled');
    return null;
  }
}

/**
 * Calculate expiration date based on filing type
 */
function calculateExpiration(filingType: string): Date {
  const ttlDays = CACHE_TTL[filingType as keyof typeof CACHE_TTL] || CACHE_TTL.default;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);
  return expiresAt;
}

/**
 * Determine primary filing type (for cache TTL)
 */
function getPrimaryFilingType(secData: SECData): string {
  if (secData.latest10K) return '10-K';
  if (secData.latest10Q) return '10-Q';
  return 'default';
}

/**
 * Get cached SEC data if available and not expired
 */
export function getCachedSECData(cik: string): CachedSECData | null {
  const database = initDatabase();
  if (!database) return null; // No cache in serverless

  try {
    const stmt = database.prepare(`
      SELECT data, cached_at, expires_at, filing_type
      FROM sec_filings_cache
      WHERE cik = ? AND expires_at > datetime('now')
    `);

    const row = stmt.get(cik) as { data: string; cached_at: string; expires_at: string; filing_type: string } | undefined;

    if (row) {
      const data = JSON.parse(row.data) as SECData;
      console.log(`✓ Cache HIT for CIK ${cik} (cached ${row.cached_at}, filing: ${row.filing_type})`);

      return {
        ...data,
        cachedAt: row.cached_at,
        expiresAt: row.expires_at,
        isCached: true
      };
    }

    console.log(`✗ Cache MISS for CIK ${cik}`);
    return null;
  } catch (error) {
    console.error('Error reading SEC cache:', error);
    return null;
  }
}

/**
 * Save SEC data to cache
 */
export function cacheSECData(secData: SECData): void {
  const database = initDatabase();
  if (!database) {
    console.log(`⚠ Cache disabled for CIK ${secData.cik} (serverless environment)`);
    return; // Skip caching in serverless
  }

  try {
    const filingType = getPrimaryFilingType(secData);
    const cachedAt = new Date().toISOString();
    const expiresAt = calculateExpiration(filingType).toISOString();

    const stmt = database.prepare(`
      INSERT OR REPLACE INTO sec_filings_cache (cik, company_name, data, filing_type, cached_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      secData.cik,
      secData.companyName,
      JSON.stringify(secData),
      filingType,
      cachedAt,
      expiresAt
    );

    console.log(`✓ Cached SEC data for ${secData.companyName} (CIK: ${secData.cik}, expires: ${expiresAt})`);
  } catch (error) {
    console.error('Error caching SEC data:', error);
  }
}

/**
 * Invalidate (delete) cached data for a specific CIK
 */
export function invalidateSECCache(cik: string): void {
  const database = initDatabase();
  if (!database) return; // No cache in serverless

  try {
    const stmt = database.prepare(`DELETE FROM sec_filings_cache WHERE cik = ?`);
    const result = stmt.run(cik);

    if (result.changes > 0) {
      console.log(`✓ Cache invalidated for CIK ${cik}`);
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Clean up expired cache entries
 */
export function cleanExpiredCache(): void {
  const database = initDatabase();
  if (!database) return; // No cache in serverless

  try {
    const stmt = database.prepare(`DELETE FROM sec_filings_cache WHERE expires_at < datetime('now')`);
    const result = stmt.run();

    if (result.changes > 0) {
      console.log(`✓ Cleaned ${result.changes} expired cache entries`);
    }
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { total: number; expired: number; byFilingType: Record<string, number> } {
  const database = initDatabase();
  if (!database) {
    return { total: 0, expired: 0, byFilingType: {} }; // No cache in serverless
  }

  try {
    const totalStmt = database.prepare(`SELECT COUNT(*) as count FROM sec_filings_cache`);
    const total = (totalStmt.get() as { count: number }).count;

    const expiredStmt = database.prepare(`SELECT COUNT(*) as count FROM sec_filings_cache WHERE expires_at < datetime('now')`);
    const expired = (expiredStmt.get() as { count: number }).count;

    const byTypeStmt = database.prepare(`SELECT filing_type, COUNT(*) as count FROM sec_filings_cache GROUP BY filing_type`);
    const byTypeRows = byTypeStmt.all() as { filing_type: string; count: number }[];

    const byFilingType: Record<string, number> = {};
    for (const row of byTypeRows) {
      byFilingType[row.filing_type] = row.count;
    }

    return { total, expired, byFilingType };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { total: 0, expired: 0, byFilingType: {} };
  }
}

// Note: getTimeAgo has been moved to lib/utils.ts to avoid client-side import issues
