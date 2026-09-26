import { Router } from 'express';
import { PublicController } from '../controllers/publicController.js';
import { enquiryLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public School Content Endpoints
router.get('/school', PublicController.getSchoolSettings);
router.get('/principal', PublicController.getPrincipal);
router.get('/staff', PublicController.getStaff);
router.get('/notices', PublicController.getNotices);
router.get('/calendar', PublicController.getCalendar);
router.get('/fees', PublicController.getFees);
router.get('/infrastructure', PublicController.getInfrastructure);
router.get('/achievements', PublicController.getAchievements);
router.get('/gallery', PublicController.getGallery);
router.get('/mandatory-public-disclosure', PublicController.getMandatoryPublicDisclosure);
router.get('/disclosure-documents', PublicController.getDisclosureDocuments);
router.get('/smc', PublicController.getSMC);
router.get('/transfer-certificates', PublicController.getTransferCertificates);
router.get('/downloads', PublicController.getDownloads);

// Form Submission Endpoints with Rate Limiting & Validation
router.post('/admissions/enquiry', enquiryLimiter, PublicController.submitAdmissionEnquiry);
router.post('/contact/enquiry', enquiryLimiter, PublicController.submitContactEnquiry);

export default router;
