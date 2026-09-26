import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env.js';

const { Pool } = pg;

// Supabase Admin Client (using secure Secret Key for server-side operations)
export let supabaseAdmin: SupabaseClient | null = null;
if (ENV.SUPABASE_URL && ENV.SUPABASE_SECRET_KEY) {
  try {
    supabaseAdmin = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    console.log('⚡ Supabase Admin Client initialized with server credentials.');
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase Admin Client:', err);
  }
}

// PostgreSQL Connection Pool (optional direct pooler connection)
let pgPool: pg.Pool | null = null;
const isPostgresConfigured = Boolean(
  ENV.DATABASE_URL && 
  ENV.DATABASE_URL.startsWith('postgres') && 
  !ENV.DATABASE_URL.includes('[YOUR-PASSWORD]')
);

if (isPostgresConfigured) {
  try {
    pgPool = new Pool({
      connectionString: ENV.DATABASE_URL,
      ssl: ENV.DATABASE_URL.includes('supabase') || ENV.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    console.log('📦 PostgreSQL Connection Pool initialized with Supabase pooler.');
  } catch (err) {
    console.warn('⚠️ Could not initialize PostgreSQL Pool, using PostgREST & local store.', err);
    pgPool = null;
  }
}

import os from 'os';

// Local Persistent Store Path with Serverless/Vercel Fallback
const LOCAL_DB_PATH = process.env.VERCEL
  ? path.join(os.tmpdir(), 'data_store.json')
  : path.join(process.cwd(), 'storage', 'data_store.json');

export interface LocalDatabaseSchema {
  admin_users: any[];
  school_settings: any[];
  principals: any[];
  staff: any[];
  notices: any[];
  academic_calendar: any[];
  fees: any[];
  infrastructure: any[];
  achievements: any[];
  gallery: any[];
  disclosure_general_information: any[];
  disclosure_documents: any[];
  smc_members: any[];
  transfer_certificates: any[];
  admission_enquiries: any[];
  contact_enquiries: any[];
  audit_logs: any[];
  downloads: any[];
}

const TABLE_NAMES: (keyof LocalDatabaseSchema)[] = [
  'admin_users',
  'school_settings',
  'principals',
  'staff',
  'notices',
  'academic_calendar',
  'fees',
  'infrastructure',
  'achievements',
  'gallery',
  'disclosure_general_information',
  'disclosure_documents',
  'smc_members',
  'transfer_certificates',
  'admission_enquiries',
  'contact_enquiries',
  'audit_logs',
  'downloads'
];

let inMemoryStore: LocalDatabaseSchema = {
  admin_users: [],
  school_settings: [],
  principals: [],
  staff: [],
  notices: [],
  academic_calendar: [],
  fees: [],
  infrastructure: [],
  achievements: [],
  gallery: [],
  disclosure_general_information: [],
  disclosure_documents: [],
  smc_members: [],
  transfer_certificates: [],
  admission_enquiries: [],
  contact_enquiries: [],
  audit_logs: [],
  downloads: [],
};

function ensureLocalStorageExists(): LocalDatabaseSchema {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
      return inMemoryStore;
    }

    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    inMemoryStore = { ...inMemoryStore, ...parsed };
    return inMemoryStore;
  } catch (err) {
    // Graceful fallback for serverless read-only contexts
    return inMemoryStore;
  }
}

function saveLocalStorage(data: LocalDatabaseSchema) {
  inMemoryStore = data;
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // In serverless without write access, data is still persisted in inMemoryStore and Supabase
  }
}

export const db = {
  isPostgres: Boolean(pgPool),
  isSupabase: Boolean(supabaseAdmin),

  /**
   * Sync all tables from Supabase into memory / cache
   */
  async syncAllFromSupabase(): Promise<void> {
    if (!supabaseAdmin) return;
    try {
      console.log('🔄 Syncing tables from Supabase PostgREST...');
      const store = ensureLocalStorageExists();
      for (const table of TABLE_NAMES) {
        try {
          const { data, error } = await supabaseAdmin.from(table).select('*');
          if (!error && data && data.length > 0) {
            if (table === 'admin_users') {
              const currentUsers = store.admin_users || [];
              const merged = [...currentUsers];
              data.forEach((remoteUser: any) => {
                const idx = merged.findIndex((u: any) => u.email?.toLowerCase() === remoteUser.email?.toLowerCase());
                if (idx !== -1) {
                  merged[idx] = { ...merged[idx], ...remoteUser };
                } else {
                  merged.push(remoteUser);
                }
              });
              store.admin_users = merged;
            } else {
              store[table] = data;
            }
          }
        } catch (tableErr) {
          // Maintain resilience across tables
        }
      }
      saveLocalStorage(store);
      console.log('✅ Supabase database tables successfully synced with application.');
    } catch (err) {
      console.warn('⚠️ Supabase initial sync notice:', err);
    }
  },

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (pgPool) {
      try {
        const res = await pgPool.query(sql, params);
        return res.rows as T[];
      } catch (err) {
        console.error('PostgreSQL Query Error:', err);
        throw err;
      }
    }

    return this.executeLocalQuery<T>(sql, params);
  },

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  },

  async execute(sql: string, params: any[] = []): Promise<{ rowCount: number }> {
    if (pgPool) {
      const res = await pgPool.query(sql, params);
      return { rowCount: res.rowCount || 0 };
    }

    const rows = await this.executeLocalQuery(sql, params);
    return { rowCount: rows.length };
  },

  // Helper for Table Access
  getTable<K extends keyof LocalDatabaseSchema>(table: K): LocalDatabaseSchema[K] {
    const store = ensureLocalStorageExists();
    return store[table] || [];
  },

  async saveTable<K extends keyof LocalDatabaseSchema>(table: K, rows: LocalDatabaseSchema[K]): Promise<void> {
    const store = ensureLocalStorageExists();
    store[table] = rows;
    saveLocalStorage(store);

    // Sync to Supabase in real-time
    if (supabaseAdmin) {
      try {
        if (rows && rows.length > 0) {
          const conflictCol = table === 'admin_users' ? 'email' : 'id';
          const { error } = await supabaseAdmin.from(table).upsert(rows, { onConflict: conflictCol });
          if (error) {
            console.warn(`[Supabase Sync] Upsert notice on ${table}:`, error.message);
          }
        }
      } catch (err) {
        console.error(`[Supabase Sync] Failed to upsert to ${table}:`, err);
      }
    }
  },

  async deleteRecord<K extends keyof LocalDatabaseSchema>(table: K, id: string): Promise<boolean> {
    const store = ensureLocalStorageExists();
    const rows = store[table] || [];
    store[table] = rows.filter((r: any) => r.id !== id);
    saveLocalStorage(store);

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from(table).delete().eq('id', id);
        return true;
      } catch (err) {
        console.error(`[Supabase Delete] Error on ${table}:`, err);
      }
    }
    return true;
  },

  // SQL interpreter for local queries
  executeLocalQuery<T = any>(sql: string, params: any[] = []): T[] {
    const store = ensureLocalStorageExists();
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // Match SELECT from <table>
    const selectMatch = cleanSql.match(/^SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?(?:\s+LIMIT\s+(\d+))?$/i);
    if (selectMatch) {
      const [, fieldsStr, tableName, whereClause, orderByClause, limitStr] = selectMatch;
      const table = (store as any)[tableName] || [];
      let result = [...table];

      if (whereClause) {
        result = result.filter(item => {
          let matches = true;
          if (whereClause.includes('is_current = true') || whereClause.includes('is_current = $1')) {
            const val = params.length > 0 ? params[0] : true;
            if (item.is_current !== val && item.is_current !== Boolean(val)) matches = false;
          }
          if (whereClause.includes('published = true') || whereClause.includes('is_published = true')) {
            if (item.published === false || item.is_published === false) matches = false;
          }
          if (whereClause.includes('id = $1') || whereClause.includes('id = ?')) {
            if (item.id !== params[0]) matches = false;
          }
          if (whereClause.includes('email = $1') || whereClause.includes('email = ?')) {
            if (item.email?.toLowerCase() !== params[0]?.toLowerCase()) matches = false;
          }
          if (whereClause.includes('category = $1')) {
            if (item.category !== params[0]) matches = false;
          }
          if (whereClause.includes('staff_type = $1')) {
            if (item.staff_type !== params[0]) matches = false;
          }
          return matches;
        });
      }

      if (orderByClause) {
        const isDesc = orderByClause.toLowerCase().includes('desc');
        const orderField = orderByClause.split(' ')[0].trim();
        result.sort((a, b) => {
          const valA = a[orderField] || '';
          const valB = b[orderField] || '';
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }

      if (limitStr) {
        const limit = parseInt(limitStr, 10);
        result = result.slice(0, limit);
      }

      return result as T[];
    }

    // Match INSERT INTO <table>
    const insertMatch = cleanSql.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (insertMatch) {
      const [, tableName, colsStr] = insertMatch;
      const cols = colsStr.split(',').map(c => c.trim());
      const newRecord: any = {};

      cols.forEach((col, idx) => {
        newRecord[col] = params[idx] !== undefined ? params[idx] : null;
      });

      if (!newRecord.created_at) newRecord.created_at = new Date().toISOString();
      if (!newRecord.updated_at) newRecord.updated_at = new Date().toISOString();

      const table = (store as any)[tableName] || [];
      table.push(newRecord);
      (store as any)[tableName] = table;
      saveLocalStorage(store);

      if (supabaseAdmin) {
        supabaseAdmin.from(tableName).insert([newRecord]).then();
      }

      return [newRecord] as T[];
    }

    // Match UPDATE <table>
    const updateMatch = cleanSql.match(/^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.*?)\s+WHERE\s+(.*?)$/i);
    if (updateMatch) {
      const [, tableName, setClause, whereClause] = updateMatch;
      const table = (store as any)[tableName] || [];

      const targetId = params[params.length - 1];
      const idx = table.findIndex((item: any) => item.id === targetId);

      if (idx !== -1) {
        const setPairs = setClause.split(',').map(s => s.trim());
        setPairs.forEach((pair, i) => {
          const colName = pair.split('=')[0].trim();
          if (i < params.length - 1) {
            table[idx][colName] = params[i];
          }
        });
        table[idx].updated_at = new Date().toISOString();
        (store as any)[tableName] = table;
        saveLocalStorage(store);

        if (supabaseAdmin) {
          supabaseAdmin.from(tableName).update(table[idx]).eq('id', targetId).then();
        }

        return [table[idx]] as T[];
      }
      return [] as T[];
    }

    // Match DELETE FROM <table>
    const deleteMatch = cleanSql.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+(.*?)$/i);
    if (deleteMatch) {
      const [, tableName] = deleteMatch;
      const targetId = params[0];
      const table = (store as any)[tableName] || [];
      const filtered = table.filter((item: any) => item.id !== targetId);
      (store as any)[tableName] = filtered;
      saveLocalStorage(store);

      if (supabaseAdmin) {
        supabaseAdmin.from(tableName).delete().eq('id', targetId).then();
      }

      return [] as T[];
    }

    return [] as T[];
  }
};
