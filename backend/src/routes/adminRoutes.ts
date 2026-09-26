import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin endpoints with authentication
router.use(authenticateToken);

// 1. Dashboard Overview
router.get('/stats', AdminController.getDashboardStats);

// 2. School Settings
router.get('/school', AdminController.getSchoolSettings);
router.put('/school', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.updateSchoolSettings);

// 3. Principal
router.get('/principal', AdminController.getPrincipal);
router.put('/principal', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.updatePrincipal);

// 4. Faculty & Staff
router.get('/staff', AdminController.getStaffList);
router.post('/staff', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createStaff);
router.put('/staff/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateStaff);
router.delete('/staff/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteStaff);

// 5. Mandatory Public Disclosure Documents
router.get('/disclosure-documents', AdminController.getDisclosureDocuments);
router.post('/disclosure-documents', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createDisclosureDocument);
router.put('/disclosure-documents/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateDisclosureDocument);
router.delete('/disclosure-documents/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteDisclosureDocument);

// 6. Notices
router.get('/notices', AdminController.getNotices);
router.post('/notices', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createNotice);
router.put('/notices/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateNotice);
router.delete('/notices/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteNotice);

// 7. Academic Calendar
router.get('/calendar', AdminController.getCalendar);
router.post('/calendar', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createCalendarEvent);
router.put('/calendar/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateCalendarEvent);
router.delete('/calendar/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteCalendarEvent);

// 8. Fees
router.get('/fees', AdminController.getFees);
router.put('/fees', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.updateFees);
router.post('/fees', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.createFee);
router.delete('/fees/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteFee);

// 9. Infrastructure
router.get('/infrastructure', AdminController.getInfrastructure);
router.post('/infrastructure', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createInfrastructure);
router.put('/infrastructure/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateInfrastructure);
router.delete('/infrastructure/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteInfrastructure);

// 10. Achievements
router.get('/achievements', AdminController.getAchievements);
router.post('/achievements', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createAchievement);
router.put('/achievements/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateAchievement);
router.delete('/achievements/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteAchievement);

// 11. Gallery
router.get('/gallery', AdminController.getGallery);
router.post('/gallery', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createGalleryItem);
router.put('/gallery/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateGalleryItem);
router.delete('/gallery/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteGalleryItem);

// 12. School Managing Committee (SMC)
router.get('/smc', AdminController.getSMC);
router.post('/smc', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createSMC);
router.put('/smc/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateSMC);
router.delete('/smc/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteSMC);

// 13. Transfer Certificates
router.get('/transfer-certificates', AdminController.getTransferCertificates);
router.post('/transfer-certificates', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createTransferCertificate);
router.put('/transfer-certificates/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateTransferCertificate);
router.delete('/transfer-certificates/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteTransferCertificate);

// 14. Enquiries Management
router.get('/admissions/enquiries', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.getAdmissionEnquiries);
router.patch('/admissions/enquiries/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateAdmissionEnquiryStatus);
router.delete('/admissions/enquiries/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteAdmissionEnquiry);

router.get('/contact/enquiries', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.getContactEnquiries);
router.patch('/contact/enquiries/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateContactEnquiryStatus);
router.delete('/contact/enquiries/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteContactEnquiry);

// 15. Downloads Management
router.get('/downloads', AdminController.getDownloads);
router.post('/downloads', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.createDownload);
router.put('/downloads/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateDownload);
router.delete('/downloads/:id', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.deleteDownload);

// 16. Mandatory Disclosure General Information
router.get('/disclosure-general-info', AdminController.getDisclosureGeneralInfo);
router.put('/disclosure-general-info', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.updateDisclosureGeneralInfo);

// 17. Content Workflow Transition (Draft, Review, Approved, Published, Unpublished)
router.patch('/workflow/:entity/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), AdminController.updateWorkflowStage);

// 18. Audit Logs
router.get('/audit-logs', requireRole('SUPER_ADMIN', 'ADMIN'), AdminController.getAuditLogs);

export default router;
