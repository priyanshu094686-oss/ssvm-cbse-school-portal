import { db } from '../db/database.js';
import crypto from 'crypto';

export interface AuditLogEntry {
  admin_user_id?: string;
  admin_user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
}

export const AuditService = {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const id = 'aud-' + crypto.randomUUID();
      const createdAt = new Date().toISOString();

      const oldDataStr = entry.old_data ? JSON.stringify(entry.old_data) : null;
      const newDataStr = entry.new_data ? JSON.stringify(entry.new_data) : null;

      const logs = db.getTable('audit_logs');
      logs.unshift({
        id,
        admin_user_id: entry.admin_user_id || 'system',
        admin_user_email: entry.admin_user_email || 'system',
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        old_data: oldDataStr,
        new_data: newDataStr,
        ip_address: entry.ip_address || null,
        created_at: createdAt,
      });

      // Keep recent 1000 logs
      if (logs.length > 1000) {
        logs.splice(1000);
      }

      db.saveTable('audit_logs', logs);
    } catch (err) {
      console.error('Audit Logging Error:', err);
    }
  }
};
