import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { AdmissionEnquirySchema, ContactEnquirySchema } from '../models/types.js';

export const PublicController = {
  // GET /api/school
  async getSchoolSettings(req: Request, res: Response): Promise<void> {
    const settings = db.getTable('school_settings')[0] || null;
    res.json({ success: true, data: settings });
  },

  // GET /api/principal
  async getPrincipal(req: Request, res: Response): Promise<void> {
    const principals = db.getTable('principals');
    const current = principals.find(p => p.is_current === true) || principals[0] || null;
    res.json({ success: true, data: current });
  },

  // GET /api/staff
  async getStaff(req: Request, res: Response): Promise<void> {
    const { type, subject, search } = req.query;
    let staff = db.getTable('staff').filter(s => s.is_published === true);

    if (type) {
      staff = staff.filter(s => s.staff_type.toLowerCase() === String(type).toLowerCase());
    }
    if (subject) {
      staff = staff.filter(s => s.subject?.toLowerCase().includes(String(subject).toLowerCase()));
    }
    if (search) {
      const q = String(search).toLowerCase();
      staff = staff.filter(s => s.name.toLowerCase().includes(q) || s.subject?.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q));
    }

    staff.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json({ success: true, data: staff });
  },

  // GET /api/notices
  async getNotices(req: Request, res: Response): Promise<void> {
    const { category, search, limit } = req.query;
    let notices = db.getTable('notices').filter(n => n.published === true);

    if (category && category !== 'all') {
      notices = notices.filter(n => n.category.toLowerCase() === String(category).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      notices = notices.filter(n => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
    }

    notices.sort((a, b) => new Date(b.notice_date).getTime() - new Date(a.notice_date).getTime());

    if (limit) {
      notices = notices.slice(0, parseInt(String(limit), 10));
    }

    res.json({ success: true, data: notices });
  },

  // GET /api/calendar
  async getCalendar(req: Request, res: Response): Promise<void> {
    const { session, type } = req.query;
    let events = db.getTable('academic_calendar').filter(e => e.published === true);

    if (session) {
      events = events.filter(e => e.academic_session === String(session));
    }
    if (type && type !== 'all') {
      events = events.filter(e => e.event_type.toLowerCase() === String(type).toLowerCase());
    }

    res.json({ success: true, data: events });
  },

  // GET /api/fees
  async getFees(req: Request, res: Response): Promise<void> {
    const fees = db.getTable('fees').filter(f => f.published === true);
    res.json({ success: true, data: fees });
  },

  // GET /api/infrastructure
  async getInfrastructure(req: Request, res: Response): Promise<void> {
    const facilities = db.getTable('infrastructure').filter(i => i.published === true);
    res.json({ success: true, data: facilities });
  },

  // GET /api/achievements
  async getAchievements(req: Request, res: Response): Promise<void> {
    const { category } = req.query;
    let achievements = db.getTable('achievements').filter(a => a.published === true);

    if (category && category !== 'all') {
      achievements = achievements.filter(a => a.category.toLowerCase() === String(category).toLowerCase());
    }

    res.json({ success: true, data: achievements });
  },

  // GET /api/gallery
  async getGallery(req: Request, res: Response): Promise<void> {
    const { category } = req.query;
    let items = db.getTable('gallery').filter(g => g.published === true);

    if (category && category !== 'all') {
      items = items.filter(g => g.category.toLowerCase() === String(category).toLowerCase());
    }

    res.json({ success: true, data: items });
  },

  // GET /api/mandatory-public-disclosure
  async getMandatoryPublicDisclosure(req: Request, res: Response): Promise<void> {
    const generalInfo = db.getTable('disclosure_general_information')[0] || null;
    const documents = db.getTable('disclosure_documents').filter(d => d.published === true);

    res.json({
      success: true,
      data: {
        general_information: generalInfo,
        documents: documents
      }
    });
  },

  // GET /api/disclosure-documents
  async getDisclosureDocuments(req: Request, res: Response): Promise<void> {
    const documents = db.getTable('disclosure_documents').filter(d => d.published === true);
    res.json({ success: true, data: documents });
  },

  // GET /api/smc
  async getSMC(req: Request, res: Response): Promise<void> {
    const members = db.getTable('smc_members').filter(m => m.published === true);
    members.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    res.json({ success: true, data: members });
  },

  // GET /api/transfer-certificates
  async getTransferCertificates(req: Request, res: Response): Promise<void> {
    const { search } = req.query;
    let records = db.getTable('transfer_certificates').filter(t => t.published === true);

    if (search) {
      const q = String(search).toLowerCase().trim();
      records = records.filter(t => 
        t.tc_number.toLowerCase().includes(q) || 
        t.admission_number.toLowerCase().includes(q) ||
        t.class_left.toLowerCase().includes(q)
      );
    }

    // Safety: ensure only public non-sensitive attributes are returned
    const safeRecords = records.map(r => ({
      id: r.id,
      tc_number: r.tc_number,
      admission_number: r.admission_number,
      student_initials: r.student_initials,
      class_left: r.class_left,
      issue_date: r.issue_date,
      reason: r.reason,
      document_url: r.document_url,
      verification_status: r.verification_status
    }));

    res.json({ success: true, data: safeRecords });
  },

  // GET /api/downloads
  async getDownloads(req: Request, res: Response): Promise<void> {
    const directDownloads = db.getTable('downloads').filter(d => d.published === true);
    if (directDownloads.length > 0) {
      res.json({ success: true, data: directDownloads });
      return;
    }

    const docs = db.getTable('disclosure_documents').filter(d => d.published === true).map(d => ({
      id: d.id,
      title: d.document_name,
      category: d.category,
      file_url: d.file_url,
      file_type: d.file_type || 'PDF',
      file_size: d.file_size,
      status: d.status,
      published: true
    }));

    res.json({ success: true, data: docs });
  },

  // POST /api/admissions/enquiry
  async submitAdmissionEnquiry(req: Request, res: Response): Promise<void> {
    try {
      const parsed = AdmissionEnquirySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
        });
        return;
      }

      const ref_number = 'SSVM-ENQ-' + Math.floor(100000 + Math.random() * 900000);
      const newEnquiry = {
        id: 'enq-' + crypto.randomUUID(),
        ref_number,
        student_name: parsed.data.student_name.trim(),
        class_applying_for: parsed.data.class_applying_for,
        parent_guardian_name: parsed.data.parent_guardian_name.trim(),
        phone: parsed.data.phone.trim(),
        email: parsed.data.email?.trim() || null,
        message: parsed.data.message?.trim() || null,
        status: 'New',
        ip_address: req.ip,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const enquiries = db.getTable('admission_enquiries');
      enquiries.push(newEnquiry);
      db.saveTable('admission_enquiries', enquiries);

      res.status(201).json({
        success: true,
        data: {
          reference_number: ref_number,
          student_name: newEnquiry.student_name,
          class_applying_for: newEnquiry.class_applying_for,
          message: 'Admission enquiry registered successfully. School admissions desk will contact you.'
        }
      });
    } catch (err) {
      console.error('Admission enquiry error:', err);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Could not process admission enquiry.' }
      });
    }
  },

  // POST /api/contact/enquiry
  async submitContactEnquiry(req: Request, res: Response): Promise<void> {
    try {
      const parsed = ContactEnquirySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
        });
        return;
      }

      const newContact = {
        id: 'cnt-' + crypto.randomUUID(),
        name: parsed.data.name.trim(),
        email: parsed.data.email.trim(),
        phone: parsed.data.phone?.trim() || null,
        subject: parsed.data.subject.trim(),
        message: parsed.data.message.trim(),
        status: 'New',
        ip_address: req.ip,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const contactEnquiries = db.getTable('contact_enquiries');
      contactEnquiries.push(newContact);
      db.saveTable('contact_enquiries', contactEnquiries);

      res.status(201).json({
        success: true,
        data: {
          message: 'Thank you for reaching out. Your message has been received by Saraswati Shishu Vidya Mandir office.'
        }
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Could not submit contact message.' }
      });
    }
  }
};
