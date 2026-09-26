import { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';
import {
  PrincipalSchema,
  SchoolSettingsSchema,
  StaffSchema,
  NoticeSchema,
  AcademicCalendarSchema,
  FeeSchema,
  InfrastructureSchema,
  DisclosureDocumentSchema,
  SMCMemberSchema,
  TransferCertificateSchema,
  GallerySchema,
  AchievementSchema,
  DownloadItemSchema
} from '../models/types.js';

export const AdminController = {
  // =========================================================================
  // 1. DASHBOARD OVERVIEW & STATS (Including Expiry Calculations)
  // =========================================================================
  async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const staff = db.getTable('staff');
    const notices = db.getTable('notices');
    const calendar = db.getTable('academic_calendar');
    const docs = db.getTable('disclosure_documents');
    const admissions = db.getTable('admission_enquiries');
    const contacts = db.getTable('contact_enquiries');
    const gallery = db.getTable('gallery');
    const achievements = db.getTable('achievements');

    // Document expiry & status calculations
    const now = new Date();
    let pendingCount = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;
    let availableCount = 0;

    docs.forEach(d => {
      if (d.status_code === 'pending' || !d.file_url) {
        pendingCount++;
      } else if (d.validity_date && d.validity_date !== '[OFFICIAL VALIDITY PERIOD]') {
        const valDate = new Date(d.validity_date);
        if (!isNaN(valDate.getTime())) {
          const diffDays = (valDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 0) {
            expiredCount++;
          } else if (diffDays <= 30) {
            expiringSoonCount++;
          } else {
            availableCount++;
          }
        } else {
          availableCount++;
        }
      } else {
        availableCount++;
      }
    });

    res.json({
      success: true,
      data: {
        total_teachers: staff.filter(s => s.staff_type === 'Teaching Staff').length,
        total_staff: staff.length,
        published_notices: notices.filter(n => n.published).length,
        upcoming_events: calendar.filter(c => c.published).length,
        total_documents: docs.length,
        published_documents: docs.filter(d => d.published).length,
        document_status: {
          available: availableCount,
          pending: pendingCount,
          expiring_soon: expiringSoonCount,
          expired: expiredCount
        },
        admission_enquiries: {
          total: admissions.length,
          new: admissions.filter(a => a.status === 'New').length
        },
        contact_enquiries: {
          total: contacts.length,
          new: contacts.filter(c => c.status === 'New').length
        },
        gallery_items: gallery.length,
        achievements: achievements.length
      }
    });
  },

  // =========================================================================
  // 2. SCHOOL SETTINGS
  // =========================================================================
  async getSchoolSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const settings = db.getTable('school_settings')[0] || null;
    res.json({ success: true, data: settings });
  },

  async updateSchoolSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = SchoolSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const settingsList = db.getTable('school_settings');
      const oldSettings = settingsList[0] || {};
      const updated = {
        ...oldSettings,
        ...parsed.data,
        id: oldSettings.id || 'settings-ssvm-01',
        updated_at: new Date().toISOString()
      };

      db.saveTable('school_settings', [updated]);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'UPDATE',
        entity_type: 'SCHOOL_SETTINGS',
        entity_id: updated.id,
        old_data: oldSettings,
        new_data: updated,
        ip_address: req.ip
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update settings.' } });
    }
  },

  // =========================================================================
  // 3. PRINCIPAL
  // =========================================================================
  async getPrincipal(req: AuthenticatedRequest, res: Response): Promise<void> {
    const principals = db.getTable('principals');
    const current = principals.find(p => p.is_current) || principals[0] || null;
    res.json({ success: true, data: current });
  },

  async updatePrincipal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = PrincipalSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const principals = db.getTable('principals');
      const currentIdx = principals.findIndex(p => p.is_current);
      const oldPrincipal = currentIdx !== -1 ? { ...principals[currentIdx] } : {};

      const updated = {
        id: oldPrincipal.id || 'pr-ssvm-01',
        ...parsed.data,
        updated_at: new Date().toISOString()
      };

      if (currentIdx !== -1) {
        principals[currentIdx] = updated;
      } else {
        principals.push({ ...updated, created_at: new Date().toISOString() });
      }

      db.saveTable('principals', principals);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'UPDATE_PRINCIPAL',
        entity_type: 'PRINCIPAL',
        entity_id: updated.id,
        old_data: oldPrincipal,
        new_data: updated,
        ip_address: req.ip
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update principal.' } });
    }
  },

  // =========================================================================
  // 4. STAFF / FACULTY CRUD
  // =========================================================================
  async getStaffList(req: AuthenticatedRequest, res: Response): Promise<void> {
    const staff = db.getTable('staff');
    res.json({ success: true, data: staff });
  },

  async createStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = StaffSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const staffList = db.getTable('staff');
      const newStaff = {
        id: 'fac-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      staffList.push(newStaff);
      db.saveTable('staff', staffList);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE',
        entity_type: 'STAFF',
        entity_id: newStaff.id,
        new_data: newStaff,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newStaff });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create staff record.' } });
    }
  },

  async updateStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = StaffSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const staffList = db.getTable('staff');
    const idx = staffList.findIndex(s => s.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Staff member not found.' } });
      return;
    }

    const oldStaff = { ...staffList[idx] };
    staffList[idx] = {
      ...staffList[idx],
      ...parsed.data,
      updated_at: new Date().toISOString()
    };
    db.saveTable('staff', staffList);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE',
      entity_type: 'STAFF',
      entity_id: id,
      old_data: oldStaff,
      new_data: staffList[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: staffList[idx] });
  },

  async deleteStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const staffList = db.getTable('staff');
    const idx = staffList.findIndex(s => s.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Staff not found.' } });
      return;
    }

    const deleted = staffList.splice(idx, 1)[0];
    db.saveTable('staff', staffList);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE',
      entity_type: 'STAFF',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Staff member removed.' } });
  },

  // =========================================================================
  // 5. DISCLOSURE DOCUMENTS CRUD & EXPIRY MANAGEMENT
  // =========================================================================
  async getDisclosureDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    const docs = db.getTable('disclosure_documents');
    res.json({ success: true, data: docs });
  },

  async createDisclosureDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = DisclosureDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const docs = db.getTable('disclosure_documents');
      const newDoc = {
        id: 'doc-' + crypto.randomUUID(),
        ...parsed.data,
        last_updated: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      docs.push(newDoc);
      db.saveTable('disclosure_documents', docs);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_DOCUMENT',
        entity_type: 'DISCLOSURE_DOCUMENT',
        entity_id: newDoc.id,
        new_data: newDoc,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newDoc });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create document.' } });
    }
  },

  async updateDisclosureDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = DisclosureDocumentSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const docs = db.getTable('disclosure_documents');
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found.' } });
      return;
    }

    const oldDoc = { ...docs[idx] };
    docs[idx] = {
      ...docs[idx],
      ...parsed.data,
      last_updated: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };
    db.saveTable('disclosure_documents', docs);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_DOCUMENT',
      entity_type: 'DISCLOSURE_DOCUMENT',
      entity_id: id,
      old_data: oldDoc,
      new_data: docs[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: docs[idx] });
  },

  async deleteDisclosureDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const docs = db.getTable('disclosure_documents');
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found.' } });
      return;
    }

    const deleted = docs.splice(idx, 1)[0];
    await db.deleteRecord('disclosure_documents', id);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_DOCUMENT',
      entity_type: 'DISCLOSURE_DOCUMENT',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Document deleted successfully.' } });
  },

  // =========================================================================
  // 6. NOTICES CRUD
  // =========================================================================
  async getNotices(req: AuthenticatedRequest, res: Response): Promise<void> {
    const notices = db.getTable('notices');
    res.json({ success: true, data: notices });
  },

  async createNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = NoticeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const notices = db.getTable('notices');
    const newNotice = {
      id: 'not-' + crypto.randomUUID(),
      ...parsed.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    notices.unshift(newNotice);
    await db.saveTable('notices', notices);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'CREATE_NOTICE',
      entity_type: 'NOTICES',
      entity_id: newNotice.id,
      new_data: newNotice,
      ip_address: req.ip
    });

    res.status(201).json({ success: true, data: newNotice });
  },

  async updateNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = NoticeSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const notices = db.getTable('notices');
    const idx = notices.findIndex(n => n.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notice not found.' } });
      return;
    }

    const oldNotice = { ...notices[idx] };
    notices[idx] = { ...notices[idx], ...parsed.data, updated_at: new Date().toISOString() };
    await db.saveTable('notices', notices);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_NOTICE',
      entity_type: 'NOTICES',
      entity_id: id,
      old_data: oldNotice,
      new_data: notices[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: notices[idx] });
  },

  async deleteNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const notices = db.getTable('notices');
    const idx = notices.findIndex(n => n.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notice not found.' } });
      return;
    }

    const deleted = notices.splice(idx, 1)[0];
    await db.deleteRecord('notices', id);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_NOTICE',
      entity_type: 'NOTICES',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Notice deleted successfully.' } });
  },

  // =========================================================================
  // 7. ACADEMIC CALENDAR CRUD
  // =========================================================================
  async getCalendar(req: AuthenticatedRequest, res: Response): Promise<void> {
    const calendar = db.getTable('academic_calendar');
    res.json({ success: true, data: calendar });
  },

  async createCalendarEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = AcademicCalendarSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const events = db.getTable('academic_calendar');
      const newEvent = {
        id: 'cal-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      events.push(newEvent);
      db.saveTable('academic_calendar', events);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_EVENT',
        entity_type: 'ACADEMIC_CALENDAR',
        entity_id: newEvent.id,
        new_data: newEvent,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newEvent });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create calendar event.' } });
    }
  },

  async updateCalendarEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = AcademicCalendarSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const events = db.getTable('academic_calendar');
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found.' } });
      return;
    }

    const oldEvent = { ...events[idx] };
    events[idx] = { ...events[idx], ...parsed.data, updated_at: new Date().toISOString() };
    db.saveTable('academic_calendar', events);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_EVENT',
      entity_type: 'ACADEMIC_CALENDAR',
      entity_id: id,
      old_data: oldEvent,
      new_data: events[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: events[idx] });
  },

  async deleteCalendarEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const events = db.getTable('academic_calendar');
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found.' } });
      return;
    }

    const deleted = events.splice(idx, 1)[0];
    db.saveTable('academic_calendar', events);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_EVENT',
      entity_type: 'ACADEMIC_CALENDAR',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Calendar event removed.' } });
  },

  // =========================================================================
  // 8. FEES CRUD
  // =========================================================================
  async getFees(req: AuthenticatedRequest, res: Response): Promise<void> {
    const fees = db.getTable('fees');
    res.json({ success: true, data: fees });
  },

  async updateFees(req: AuthenticatedRequest, res: Response): Promise<void> {
    const items = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Expected array of fee items.' } });
      return;
    }

    const fees = db.getTable('fees');
    items.forEach(item => {
      const idx = fees.findIndex(f => f.id === item.id);
      if (idx !== -1) {
        fees[idx] = {
          ...fees[idx],
          ...item,
          updated_at: new Date().toISOString()
        };
      }
    });

    db.saveTable('fees', fees);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_FEES',
      entity_type: 'FEES',
      new_data: items,
      ip_address: req.ip
    });

    res.json({ success: true, data: fees });
  },

  async createFee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = FeeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const fees = db.getTable('fees');
      const newFee = {
        id: 'fee-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      fees.push(newFee);
      db.saveTable('fees', fees);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_FEE',
        entity_type: 'FEES',
        entity_id: newFee.id,
        new_data: newFee,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newFee });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create fee entry.' } });
    }
  },

  async deleteFee(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const fees = db.getTable('fees');
    const idx = fees.findIndex(f => f.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fee record not found.' } });
      return;
    }

    const deleted = fees.splice(idx, 1)[0];
    db.saveTable('fees', fees);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_FEE',
      entity_type: 'FEES',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Fee record removed.' } });
  },

  // =========================================================================
  // 9. INFRASTRUCTURE CRUD
  // =========================================================================
  async getInfrastructure(req: AuthenticatedRequest, res: Response): Promise<void> {
    const items = db.getTable('infrastructure');
    res.json({ success: true, data: items });
  },

  async createInfrastructure(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = InfrastructureSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const items = db.getTable('infrastructure');
      const newItem = {
        id: 'inf-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      items.push(newItem);
      db.saveTable('infrastructure', items);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_INFRASTRUCTURE',
        entity_type: 'INFRASTRUCTURE',
        entity_id: newItem.id,
        new_data: newItem,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create facility.' } });
    }
  },

  async updateInfrastructure(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = InfrastructureSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const items = db.getTable('infrastructure');
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Facility not found.' } });
      return;
    }

    const oldItem = { ...items[idx] };
    items[idx] = { ...items[idx], ...parsed.data, updated_at: new Date().toISOString() };
    db.saveTable('infrastructure', items);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_INFRASTRUCTURE',
      entity_type: 'INFRASTRUCTURE',
      entity_id: id,
      old_data: oldItem,
      new_data: items[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: items[idx] });
  },

  async deleteInfrastructure(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const items = db.getTable('infrastructure');
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Facility not found.' } });
      return;
    }

    const deleted = items.splice(idx, 1)[0];
    db.saveTable('infrastructure', items);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_INFRASTRUCTURE',
      entity_type: 'INFRASTRUCTURE',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Facility record removed.' } });
  },

  // =========================================================================
  // 10. ACHIEVEMENTS CRUD
  // =========================================================================
  async getAchievements(req: AuthenticatedRequest, res: Response): Promise<void> {
    const items = db.getTable('achievements');
    res.json({ success: true, data: items });
  },

  async createAchievement(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = AchievementSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const items = db.getTable('achievements');
      const newItem = {
        id: 'ach-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      items.push(newItem);
      db.saveTable('achievements', items);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_ACHIEVEMENT',
        entity_type: 'ACHIEVEMENTS',
        entity_id: newItem.id,
        new_data: newItem,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create achievement.' } });
    }
  },

  async updateAchievement(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = AchievementSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const items = db.getTable('achievements');
    const idx = items.findIndex(a => a.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Achievement not found.' } });
      return;
    }

    const oldItem = { ...items[idx] };
    items[idx] = { ...items[idx], ...parsed.data, updated_at: new Date().toISOString() };
    db.saveTable('achievements', items);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_ACHIEVEMENT',
      entity_type: 'ACHIEVEMENTS',
      entity_id: id,
      old_data: oldItem,
      new_data: items[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: items[idx] });
  },

  async deleteAchievement(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const items = db.getTable('achievements');
    const idx = items.findIndex(a => a.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Achievement not found.' } });
      return;
    }

    const deleted = items.splice(idx, 1)[0];
    db.saveTable('achievements', items);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_ACHIEVEMENT',
      entity_type: 'ACHIEVEMENTS',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Achievement removed.' } });
  },

  // =========================================================================
  // 11. GALLERY CRUD
  // =========================================================================
  async getGallery(req: AuthenticatedRequest, res: Response): Promise<void> {
    const gallery = db.getTable('gallery');
    res.json({ success: true, data: gallery });
  },

  async createGalleryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = GallerySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const gallery = db.getTable('gallery');
      const newItem = {
        id: 'gal-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      gallery.push(newItem);
      db.saveTable('gallery', gallery);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_GALLERY',
        entity_type: 'GALLERY',
        entity_id: newItem.id,
        new_data: newItem,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create gallery item.' } });
    }
  },

  async updateGalleryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = GallerySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const gallery = db.getTable('gallery');
    const idx = gallery.findIndex(g => g.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Gallery item not found.' } });
      return;
    }

    const oldItem = { ...gallery[idx] };
    gallery[idx] = { ...gallery[idx], ...parsed.data, updated_at: new Date().toISOString() };
    db.saveTable('gallery', gallery);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_GALLERY',
      entity_type: 'GALLERY',
      entity_id: id,
      old_data: oldItem,
      new_data: gallery[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: gallery[idx] });
  },

  async deleteGalleryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const gallery = db.getTable('gallery');
    const idx = gallery.findIndex(g => g.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Gallery item not found.' } });
      return;
    }

    const deleted = gallery.splice(idx, 1)[0];
    db.saveTable('gallery', gallery);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_GALLERY',
      entity_type: 'GALLERY',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Gallery item removed.' } });
  },

  // =========================================================================
  // 12. SMC MEMBERS CRUD
  // =========================================================================
  async getSMC(req: AuthenticatedRequest, res: Response): Promise<void> {
    const smc = db.getTable('smc_members');
    res.json({ success: true, data: smc });
  },

  async createSMC(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = SMCMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const smc = db.getTable('smc_members');
      const newMember = {
        id: 'smc-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      smc.push(newMember);
      db.saveTable('smc_members', smc);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_SMC',
        entity_type: 'SMC',
        entity_id: newMember.id,
        new_data: newMember,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newMember });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create SMC member.' } });
    }
  },

  async updateSMC(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = SMCMemberSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const smc = db.getTable('smc_members');
    const idx = smc.findIndex(m => m.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SMC member not found.' } });
      return;
    }

    const oldMember = { ...smc[idx] };
    smc[idx] = { ...smc[idx], ...parsed.data, updated_at: new Date().toISOString() };
    db.saveTable('smc_members', smc);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_SMC',
      entity_type: 'SMC',
      entity_id: id,
      old_data: oldMember,
      new_data: smc[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: smc[idx] });
  },

  async deleteSMC(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const smc = db.getTable('smc_members');
    const idx = smc.findIndex(m => m.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SMC member not found.' } });
      return;
    }

    const deleted = smc.splice(idx, 1)[0];
    db.saveTable('smc_members', smc);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_SMC',
      entity_type: 'SMC',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'SMC member removed.' } });
  },

  // =========================================================================
  // 13. TRANSFER CERTIFICATES CRUD
  // =========================================================================
  async getTransferCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tcs = db.getTable('transfer_certificates');
    res.json({ success: true, data: tcs });
  },

  async createTransferCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = TransferCertificateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const tcs = db.getTable('transfer_certificates');
      const newTc = {
        id: 'tc-' + crypto.randomUUID(),
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      tcs.unshift(newTc);
      db.saveTable('transfer_certificates', tcs);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_TC',
        entity_type: 'TRANSFER_CERTIFICATE',
        entity_id: newTc.id,
        new_data: { tc_number: newTc.tc_number, admission_number: newTc.admission_number },
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newTc });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create TC record.' } });
    }
  },

  async updateTransferCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = TransferCertificateSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const tcs = db.getTable('transfer_certificates');
    const idx = tcs.findIndex(t => t.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'TC record not found.' } });
      return;
    }

    const oldTc = { ...tcs[idx] };
    tcs[idx] = { ...tcs[idx], ...parsed.data, updated_at: new Date().toISOString() };
    db.saveTable('transfer_certificates', tcs);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_TC',
      entity_type: 'TRANSFER_CERTIFICATE',
      entity_id: id,
      old_data: oldTc,
      new_data: tcs[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: tcs[idx] });
  },

  async deleteTransferCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const tcs = db.getTable('transfer_certificates');
    const idx = tcs.findIndex(t => t.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'TC record not found.' } });
      return;
    }

    const deleted = tcs.splice(idx, 1)[0];
    db.saveTable('transfer_certificates', tcs);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_TC',
      entity_type: 'TRANSFER_CERTIFICATE',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Transfer Certificate removed.' } });
  },

  // =========================================================================
  // 14. ENQUIRIES MANAGEMENT
  // =========================================================================
  async getAdmissionEnquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
    const enquiries = db.getTable('admission_enquiries');
    res.json({ success: true, data: enquiries });
  },

  async updateAdmissionEnquiryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;
    const enquiries = db.getTable('admission_enquiries');
    const enquiry = enquiries.find(e => e.id === id);

    if (!enquiry) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } });
      return;
    }

    enquiry.status = status;
    enquiry.updated_at = new Date().toISOString();
    db.saveTable('admission_enquiries', enquiries);

    res.json({ success: true, data: enquiry });
  },

  async deleteAdmissionEnquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const enquiries = db.getTable('admission_enquiries');
    const idx = enquiries.findIndex(e => e.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } });
      return;
    }

    enquiries.splice(idx, 1);
    db.saveTable('admission_enquiries', enquiries);
    res.json({ success: true, data: { message: 'Enquiry deleted.' } });
  },

  async getContactEnquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
    const contacts = db.getTable('contact_enquiries');
    res.json({ success: true, data: contacts });
  },

  async updateContactEnquiryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;
    const contacts = db.getTable('contact_enquiries');
    const contact = contacts.find(c => c.id === id);

    if (!contact) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact message not found.' } });
      return;
    }

    contact.status = status;
    contact.updated_at = new Date().toISOString();
    db.saveTable('contact_enquiries', contacts);

    res.json({ success: true, data: contact });
  },

  async deleteContactEnquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const contacts = db.getTable('contact_enquiries');
    const idx = contacts.findIndex(c => c.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact message not found.' } });
      return;
    }

    contacts.splice(idx, 1);
    db.saveTable('contact_enquiries', contacts);
    res.json({ success: true, data: { message: 'Contact message removed.' } });
  },

  // =========================================================================
  // 15. DOWNLOADS CMS
  // =========================================================================
  async getDownloads(req: AuthenticatedRequest, res: Response): Promise<void> {
    const downloads = db.getTable('downloads');
    res.json({ success: true, data: downloads });
  },

  async createDownload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = DownloadItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
        return;
      }

      const downloads = db.getTable('downloads');
      const newDownload = {
        id: 'dl-' + crypto.randomUUID(),
        ...parsed.data,
        workflow_stage: parsed.data.workflow_stage || (parsed.data.published ? 'Published' : 'Draft'),
        published: parsed.data.published ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      downloads.push(newDownload);
      db.saveTable('downloads', downloads);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'CREATE_DOWNLOAD',
        entity_type: 'DOWNLOAD',
        entity_id: newDownload.id,
        new_data: newDownload,
        ip_address: req.ip
      });

      res.status(201).json({ success: true, data: newDownload });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create download entry.' } });
    }
  },

  async updateDownload(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = DownloadItemSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
      return;
    }

    const downloads = db.getTable('downloads');
    const idx = downloads.findIndex(d => d.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Download not found.' } });
      return;
    }

    const oldDownload = { ...downloads[idx] };
    downloads[idx] = {
      ...downloads[idx],
      ...parsed.data,
      updated_at: new Date().toISOString()
    };
    db.saveTable('downloads', downloads);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'UPDATE_DOWNLOAD',
      entity_type: 'DOWNLOAD',
      entity_id: id,
      old_data: oldDownload,
      new_data: downloads[idx],
      ip_address: req.ip
    });

    res.json({ success: true, data: downloads[idx] });
  },

  async deleteDownload(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const downloads = db.getTable('downloads');
    const idx = downloads.findIndex(d => d.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Download not found.' } });
      return;
    }

    const deleted = downloads.splice(idx, 1)[0];
    db.saveTable('downloads', downloads);

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_DOWNLOAD',
      entity_type: 'DOWNLOAD',
      entity_id: id,
      old_data: deleted,
      ip_address: req.ip
    });

    res.json({ success: true, data: { message: 'Download removed.' } });
  },

  // =========================================================================
  // 16. DISCLOSURE GENERAL INFORMATION
  // =========================================================================
  async getDisclosureGeneralInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    const info = db.getTable('disclosure_general_information')[0] || null;
    res.json({ success: true, data: info });
  },

  async updateDisclosureGeneralInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const infoList = db.getTable('disclosure_general_information');
      const oldInfo = infoList[0] || {};
      const updated = {
        ...oldInfo,
        ...req.body,
        id: oldInfo.id || 'disc-gen-01',
        updated_at: new Date().toISOString()
      };

      db.saveTable('disclosure_general_information', [updated]);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'UPDATE_DISCLOSURE_GENERAL_INFO',
        entity_type: 'MANDATORY_DISCLOSURE',
        entity_id: updated.id,
        old_data: oldInfo,
        new_data: updated,
        ip_address: req.ip
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update disclosure info.' } });
    }
  },

  // =========================================================================
  // 17. CONTENT WORKFLOW STAGE TRANSITIONS
  // =========================================================================
  async updateWorkflowStage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { entity, id } = req.params;
      const { workflow_stage } = req.body;

      const validEntities = [
        'disclosure_documents',
        'notices',
        'staff',
        'academic_calendar',
        'fees',
        'infrastructure',
        'achievements',
        'gallery',
        'smc_members',
        'transfer_certificates',
        'downloads'
      ] as const;

      if (!validEntities.includes(entity as any)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_ENTITY', message: `Invalid entity: ${entity}` } });
        return;
      }

      const table = entity as typeof validEntities[number];
      const items = db.getTable(table);
      const item = items.find((i: any) => i.id === id);

      if (!item) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `${entity} item not found.` } });
        return;
      }

      const oldStage = item.workflow_stage || (item.published ? 'Published' : 'Draft');
      item.workflow_stage = workflow_stage;
      item.published = workflow_stage === 'Published';
      if (item.is_published !== undefined) {
        item.is_published = workflow_stage === 'Published';
      }
      item.updated_at = new Date().toISOString();

      db.saveTable(table, items);

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'WORKFLOW_CHANGE',
        entity_type: entity.toUpperCase(),
        entity_id: id,
        old_data: { workflow_stage: oldStage },
        new_data: { workflow_stage, published: item.published },
        ip_address: req.ip
      });

      res.json({
        success: true,
        data: {
          id: item.id,
          workflow_stage: item.workflow_stage,
          published: item.published,
          message: `Content is now ${workflow_stage}.`
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update workflow.' } });
    }
  },

  // =========================================================================
  // 18. AUDIT LOGS
  // =========================================================================
  async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const logs = db.getTable('audit_logs');
    res.json({ success: true, data: logs.slice(-100).reverse() });
  }
};
