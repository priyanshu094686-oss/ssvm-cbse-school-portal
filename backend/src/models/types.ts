import { z } from 'zod';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SCHOOL_MANAGER' | 'EDITOR' | 'VIEWER';

export type WorkflowStage = 'Draft' | 'Review' | 'Approved' | 'Published' | 'Unpublished';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

// Zod Validation Schemas

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SCHOOL_MANAGER', 'EDITOR', 'VIEWER']),
});

export const PrincipalSchema = z.object({
  name: z.string().min(1),
  qualification: z.string().min(1),
  designation: z.string().default('Principal'),
  message: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  is_current: z.boolean().default(true),
});

export const SchoolSettingsSchema = z.object({
  school_name: z.string().min(1),
  affiliation_number: z.string().min(1),
  school_code: z.string().min(1),
  address: z.string().min(1),
  pin_code: z.string().min(1),
  official_email: z.string().min(1),
  official_phone: z.string().min(1),
  alt_phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  office_hours: z.string().optional().nullable(),
  principal_name: z.string().min(1),
  principal_qualification: z.string().min(1),
  principal_message: z.string().optional().nullable(),
  board: z.string().min(1),
  classes: z.string().min(1),
});

export const StaffSchema = z.object({
  name: z.string().min(1),
  staff_type: z.enum(['Principal', 'Teaching Staff', 'Administrative Staff', 'Support Staff']),
  designation: z.string().min(1),
  subject: z.string().optional().nullable(),
  qualification: z.string().min(1),
  experience: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  sort_order: z.number().default(0),
});

export const NoticeSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['General', 'Academic', 'Examination', 'Admission', 'Holiday', 'Events', 'CBSE', 'Important']),
  description: z.string().min(1),
  document_url: z.string().optional().nullable(),
  notice_date: z.string(),
  is_important: z.boolean().default(false),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const AcademicCalendarSchema = z.object({
  academic_session: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  event_type: z.enum(['Academic', 'Examination', 'Holiday', 'Events', 'Celebrations', 'Board Exam']),
  event_date: z.string().min(1),
  end_date: z.string().optional().nullable(),
  document_url: z.string().optional().nullable(),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const FeeSchema = z.object({
  academic_session: z.string().min(1),
  class_name: z.string().min(1),
  admission_fee: z.string().min(1),
  tuition_fee: z.string().min(1),
  annual_charges: z.string().min(1),
  other_charges: z.string().optional().nullable(),
  payment_frequency: z.string().default('Quarterly'),
  notes: z.string().optional().nullable(),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const InfrastructureSchema = z.object({
  facility_name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  image_url: z.string().optional().nullable(),
  available: z.string().min(1),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const DisclosureDocumentSchema = z.object({
  document_name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.string().min(1),
  status_code: z.enum(['available', 'pending', 'expired', 'under_verification']).default('pending'),
  issue_date: z.string().optional().nullable(),
  validity_date: z.string().optional().nullable(),
  last_updated: z.string().optional().nullable(),
  file_url: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  file_type: z.string().default('PDF'),
  file_size: z.string().optional().nullable(),
  verified: z.boolean().default(false),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const SMCMemberSchema = z.object({
  name: z.string().min(1),
  designation: z.string().min(1),
  role: z.string().min(1),
  other_information: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
  sort_order: z.number().default(0),
});

export const TransferCertificateSchema = z.object({
  tc_number: z.string().min(1),
  admission_number: z.string().min(1),
  student_initials: z.string().min(1),
  class_left: z.string().min(1),
  issue_date: z.string().min(1),
  reason: z.string().optional().nullable(),
  document_url: z.string().optional().nullable(),
  verification_status: z.string().default('Verified & Issued by School Office'),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const AdmissionEnquirySchema = z.object({
  student_name: z.string().min(2, "Student name must be at least 2 characters").max(100),
  class_applying_for: z.string().min(1, "Please select class applying for"),
  parent_guardian_name: z.string().min(2, "Parent/Guardian name is required").max(100),
  phone: z.string().regex(/^[0-9+\s-]{10,15}$/, "Please enter a valid phone number (10-15 digits)"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  message: z.string().max(1000).optional().nullable(),
});

export const ContactEnquirySchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  phone: z.string().regex(/^[0-9+\s-]{10,15}$/, "Please enter a valid phone number").optional().or(z.literal('')),
  subject: z.string().min(2, "Subject is required").max(200),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
});

export const GallerySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(['Campus', 'Classrooms', 'Sports', 'Events', 'Cultural Activities', 'Competitions', 'Celebrations', 'Assembly', 'Lab']),
  image_url: z.string().min(1, "Image URL or upload is required"),
  alt_text: z.string().min(1, "Alt text is required for accessibility"),
  event_date: z.string().optional().nullable(),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const AchievementSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['Academic Results', 'Class X Results', 'Student Achievements', 'Sports Achievements', 'Competition Achievements', 'School Achievements']),
  description: z.string().min(1),
  achievement_date: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  document_url: z.string().optional().nullable(),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});

export const DownloadItemSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['General Downloads', 'Proformas & Forms', 'Syllabus & Curriculum', 'Rules & Handbooks', 'Mandatory Disclosure', 'TC Proforma']),
  description: z.string().optional().nullable(),
  file_url: z.string().min(1, "File upload or URL is required"),
  file_name: z.string().optional().nullable(),
  file_type: z.string().default('PDF'),
  file_size: z.string().optional().nullable(),
  workflow_stage: z.enum(['Draft', 'Review', 'Approved', 'Published', 'Unpublished']).default('Published').optional(),
  published: z.boolean().default(true),
});
