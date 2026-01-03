// Database helper module for SQLite operations
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'stalker.db');

export interface TargetLogo {
  id: number;
  company_name: string;
  industry: string | null;
  org_type: string | null;
  region: string | null;
  revenue: string | null;
  stature: string | null;
  it_signal: string | null;
  executive_summary: string | null;
  stalking_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewTargetLogo {
  company_name: string;
  industry?: string;
  org_type?: string;
  region?: string;
  revenue?: string;
  stature?: string;
  it_signal?: string;
  executive_summary?: string;
  stalking_status?: string;
  notes?: string;
}

class Database {
  private db: sqlite3.Database | null = null;

  private getDb(): sqlite3.Database {
    if (!this.db) {
      this.db = new sqlite3.Database(DB_PATH);
    }
    return this.db;
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async run(query: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async get(query: string, params: any[] = []): Promise<any> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

const db = new Database();

export const getAllLogos = async (): Promise<TargetLogo[]> => {
  return db.all('SELECT * FROM target_logos ORDER BY updated_at DESC');
};

export const getLogoById = async (id: number): Promise<TargetLogo | null> => {
  return db.get('SELECT * FROM target_logos WHERE id = ?', [id]);
};

export const createLogo = async (logo: NewTargetLogo): Promise<number> => {
  const result = await db.run(
    `INSERT INTO target_logos (
      company_name, industry, org_type, region, revenue, stature,
      it_signal, executive_summary, stalking_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      logo.company_name,
      logo.industry || null,
      logo.org_type || null,
      logo.region || null,
      logo.revenue || null,
      logo.stature || null,
      logo.it_signal || null,
      logo.executive_summary || null,
      logo.stalking_status || 'Targeting',
      logo.notes || null
    ]
  );
  return result.lastID;
};

export const updateLogo = async (id: number, logo: Partial<NewTargetLogo>): Promise<boolean> => {
  const fields: string[] = [];
  const values: any[] = [];

  if (logo.company_name !== undefined) {
    fields.push('company_name = ?');
    values.push(logo.company_name);
  }
  if (logo.industry !== undefined) {
    fields.push('industry = ?');
    values.push(logo.industry);
  }
  if (logo.org_type !== undefined) {
    fields.push('org_type = ?');
    values.push(logo.org_type);
  }
  if (logo.region !== undefined) {
    fields.push('region = ?');
    values.push(logo.region);
  }
  if (logo.revenue !== undefined) {
    fields.push('revenue = ?');
    values.push(logo.revenue);
  }
  if (logo.stature !== undefined) {
    fields.push('stature = ?');
    values.push(logo.stature);
  }
  if (logo.it_signal !== undefined) {
    fields.push('it_signal = ?');
    values.push(logo.it_signal);
  }
  if (logo.executive_summary !== undefined) {
    fields.push('executive_summary = ?');
    values.push(logo.executive_summary);
  }
  if (logo.stalking_status !== undefined) {
    fields.push('stalking_status = ?');
    values.push(logo.stalking_status);
  }
  if (logo.notes !== undefined) {
    fields.push('notes = ?');
    values.push(logo.notes);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const result = await db.run(
    `UPDATE target_logos SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.changes > 0;
};

export const deleteLogo = async (id: number): Promise<boolean> => {
  const result = await db.run('DELETE FROM target_logos WHERE id = ?', [id]);
  return result.changes > 0;
};
