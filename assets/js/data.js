/**
 * Saraswati Shishu Vidya Mandir - Centralized Data Store & API Client
 * Seamlessly connects to the Backend REST API with LocalStorage & Safe Default fallback.
 */

const DEFAULT_SCHOOL_DATA = {
  generalInfo: {
    schoolName: "Saraswati Shishu Vidya Mandir",
    tagline: "CBSE Affiliated Institution | Classes 1 to 10",
    motto: "सा विद्या या विमुक्तये (Knowledge is that which liberates)",
    affiliationNo: "[OFFICIAL CBSE AFFILIATION NUMBER]",
    schoolCode: "[OFFICIAL SCHOOL CODE]",
    board: "Central Board of Secondary Education (CBSE), New Delhi",
    affiliationStatus: "Affiliated up to Secondary Level (Classes 1–10)",
    affiliationPeriod: "[OFFICIAL AFFILIATION PERIOD]",
    address: "[OFFICIAL SCHOOL ADDRESS]",
    city: "[CITY/DISTRICT]",
    state: "[STATE]",
    pinCode: "[PIN CODE]",
    principalName: "[PRINCIPAL NAME]",
    principalQualification: "[PRINCIPAL QUALIFICATION]",
    principalExperience: "[PRINCIPAL EXPERIENCE]",
    principalMessage: "Welcome to Saraswati Shishu Vidya Mandir. Our institution is dedicated to imparting holistic education rooted in timeless cultural values while embracing modern pedagogical standards prescribed by the Central Board of Secondary Education (CBSE).",
    email: "[OFFICIAL SCHOOL EMAIL]",
    phone: "[OFFICIAL PHONE NUMBER]",
    altPhone: "[OFFICIAL ALTERNATIVE PHONE]",
    officeHours: "Monday to Saturday: 8:00 AM – 3:30 PM",
    establishedYear: "1978",
    schoolType: "Co-Educational English & Hindi Medium",
    classesOffered: "Classes 1 to 10",
    lastUpdated: "2026-09-25"
  },

  disclosureDocuments: [
    {
      id: "doc-1",
      category: "1. AFFILIATION / UPGRADATION",
      name: "CBSE Affiliation / Upgradation Letter & Recent Extension",
      description: "Copy of initial affiliation and subsequent extension of affiliation letter issued by CBSE.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    },
    {
      id: "doc-2",
      category: "2. SOCIETY / TRUST / COMPANY",
      name: "Society / Trust Registration & Renewal Certificate",
      description: "Copies of registration and renewal certificates of the Society/Trust running the school.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    },
    {
      id: "doc-3",
      category: "3. NOC",
      name: "No Objection Certificate (NOC) Issued by State Govt. / UT",
      description: "Official NOC issued by the State School Education Department.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    },
    {
      id: "doc-4",
      category: "4. RTE RECOGNITION",
      name: "Recognition Certificate under RTE Act, 2009 & Renewals",
      description: "Copy of recognition certificate under Right to Education (RTE) Act 2009.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    },
    {
      id: "doc-5",
      category: "5. BUILDING SAFETY",
      name: "Valid Building Safety Certificate",
      description: "Certificate issued by the Competent Government Authority (PWD / Municipal Engineer) ensuring structural safety as per National Building Code.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    },
    {
      id: "doc-6",
      category: "6. FIRE SAFETY",
      name: "Valid Fire Safety Certificate",
      description: "Fire safety certificate issued by the Chief Fire Officer / Competent State Fire Service Authority.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    },
    {
      id: "doc-7",
      category: "7. DEO CERTIFICATE",
      name: "DEO Certificate / Self-Certification for Affiliation",
      description: "District Education Officer certificate or prescribed self-certification submitted by the school for CBSE affiliation.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    },
    {
      id: "doc-8",
      category: "8. WATER / HEALTH / SANITATION",
      name: "Valid Water, Health and Sanitation Certificates",
      description: "Potable drinking water test report and sanitary hygiene compliance certificate issued by Public Health Engineering Dept. / Municipal Health Officer.",
      status: "Official document to be uploaded by Saraswati Shishu Vidya Mandir.",
      statusCode: "pending",
      issueDate: "[OFFICIAL ISSUE DATE]",
      validityDate: "[OFFICIAL VALIDITY PERIOD]",
      lastUpdated: "Official data to be verified",
      fileType: "PDF",
      fileSize: "To be uploaded"
    }
  ],

  facultyList: [
    {
      id: "fac-1",
      name: "[PRINCIPAL NAME]",
      designation: "Principal & Head of Institution",
      department: "Administration & Secondary",
      subject: "Leadership & Administration",
      qualification: "[PRINCIPAL QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Secondary",
      staff_type: "Principal"
    },
    {
      id: "fac-2",
      name: "[TEACHER NAME]",
      designation: "TGT Mathematics",
      department: "Secondary Wing",
      subject: "Mathematics (Classes 9–10)",
      qualification: "[QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Secondary",
      staff_type: "Teaching Staff"
    },
    {
      id: "fac-3",
      name: "[TEACHER NAME]",
      designation: "TGT Science",
      department: "Secondary Wing",
      subject: "Physics & Chemistry (Classes 9–10)",
      qualification: "[QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Secondary",
      staff_type: "Teaching Staff"
    },
    {
      id: "fac-4",
      name: "[TEACHER NAME]",
      designation: "TGT Social Science",
      department: "Middle Wing",
      subject: "History & Civics (Classes 6–8)",
      qualification: "[QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Middle",
      staff_type: "Teaching Staff"
    },
    {
      id: "fac-5",
      name: "[TEACHER NAME]",
      designation: "TGT Hindi & Sanskrit",
      department: "Middle Wing",
      subject: "Hindi & Sanskrit Literature",
      qualification: "[QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Middle",
      staff_type: "Teaching Staff"
    },
    {
      id: "fac-6",
      name: "[TEACHER NAME]",
      designation: "PRT Primary Teacher",
      department: "Primary Wing",
      subject: "English & Environmental Studies",
      qualification: "[QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Primary",
      staff_type: "Teaching Staff"
    },
    {
      id: "fac-7",
      name: "[TEACHER NAME]",
      designation: "PRT Primary Teacher",
      department: "Primary Wing",
      subject: "General Mathematics & Hindi",
      qualification: "[QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Primary",
      staff_type: "Teaching Staff"
    },
    {
      id: "fac-8",
      name: "[TEACHER NAME]",
      designation: "Physical Education Teacher (PET)",
      department: "Sports & Yoga",
      subject: "Physical Health Education & Yoga",
      qualification: "[QUALIFICATION]",
      experience: "[OFFICIAL EXPERIENCE]",
      category: "Specialized",
      staff_type: "Teaching Staff"
    }
  ],

  notices: [
    {
      id: "not-1",
      title: "Mandatory Public Disclosure Updated as per CBSE Appendix IX Guidelines",
      category: "CBSE",
      date: "2026-09-20",
      description: "The official Mandatory Public Disclosure page and associated document sections have been refreshed in accordance with the latest CBSE Affiliation Bye-Laws.",
      isImportant: true,
      attachment: "Mandatory_Public_Disclosure.pdf"
    },
    {
      id: "not-2",
      title: "Admission Notification for Session 2027–2028 (Classes 1 to 9)",
      category: "Admission",
      date: "2026-09-15",
      description: "Admission enquiry and registration forms are available for the upcoming academic session. Parents are requested to review the eligibility criteria and document checklist.",
      isImportant: true,
      attachment: "Admission_Guidelines_2027-28.pdf"
    },
    {
      id: "not-3",
      title: "Schedule for Periodic Assessment - II & Mid-Term Examinations",
      category: "Examination",
      date: "2026-09-10",
      description: "Detailed date sheet and syllabus guidelines for Classes 1 to 10 have been finalized. Students are advised to prepare systematically.",
      isImportant: false,
      attachment: "Examination_Schedule_PA2.pdf"
    },
    {
      id: "not-4",
      title: "Academic Calendar 2026–2027 Session Activity Plan",
      category: "Academic",
      date: "2026-08-28",
      description: "Annual academic planner outlining working days, examinations, co-curricular celebrations, and gazetted holiday schedules.",
      isImportant: false,
      attachment: "Academic_Calendar_2026-27.pdf"
    },
    {
      id: "not-5",
      title: "Observance of Hindi Diwas and Cultural Competitions",
      category: "Events",
      date: "2026-08-20",
      description: "Inter-house essay writing, recitation, and speech competitions organized to foster linguistic and cultural pride among students.",
      isImportant: false,
      attachment: ""
    }
  ],

  feeStructure: [
    {
      classGroup: "Classes 1 to 5 (Primary Wing)",
      admissionFee: "Rs. [OFFICIAL ADMISSION FEE]",
      tuitionFee: "Rs. [OFFICIAL TUITION FEE] / Month",
      annualCharges: "Rs. [OFFICIAL ANNUAL CHARGES] / Year",
      otherCharges: "Rs. [OFFICIAL DEVELOPMENT / EXAM CHARGES]"
    },
    {
      classGroup: "Classes 6 to 8 (Middle Wing)",
      admissionFee: "Rs. [OFFICIAL ADMISSION FEE]",
      tuitionFee: "Rs. [OFFICIAL TUITION FEE] / Month",
      annualCharges: "Rs. [OFFICIAL ANNUAL CHARGES] / Year",
      otherCharges: "Rs. [OFFICIAL DEVELOPMENT / EXAM CHARGES]"
    },
    {
      classGroup: "Classes 9 to 10 (Secondary Wing)",
      admissionFee: "Rs. [OFFICIAL ADMISSION FEE]",
      tuitionFee: "Rs. [OFFICIAL TUITION FEE] / Month",
      annualCharges: "Rs. [OFFICIAL ANNUAL CHARGES] / Year",
      otherCharges: "Rs. [OFFICIAL DEVELOPMENT / EXAM CHARGES]"
    }
  ],

  academicEvents: [
    { id: "cal-1", title: "Commencement of Academic Session 2026–27", date: "2026-04-01", category: "Academic", month: "04" },
    { id: "cal-2", title: "Summer Vacation Commences", date: "2026-05-15", category: "Holiday", month: "05" },
    { id: "cal-3", title: "School Reopens after Summer Recess", date: "2026-06-25", category: "Academic", month: "06" },
    { id: "cal-4", title: "Periodic Assessment - I (Classes 1–10)", date: "2026-07-15", category: "Examination", month: "07" },
    { id: "cal-5", title: "Independence Day Celebration & Patriotic Song Contest", date: "2026-08-15", category: "Events", month: "08" },
    { id: "cal-6", title: "Mid-Term / Half-Yearly Examinations", date: "2026-09-18", category: "Examination", month: "09" },
    { id: "cal-7", title: "Gandhi Jayanti & Swachhata Abhiyan", date: "2026-10-02", category: "Events", month: "10" },
    { id: "cal-8", title: "Deepawali & Chhath Puja Break", date: "2026-11-01", category: "Holiday", month: "11" },
    { id: "cal-9", title: "Annual Sports Meet & Saraswati Puja Preparation", date: "2026-12-18", category: "Events", month: "12" },
    { id: "cal-10", title: "Annual Examinations & Result Declaration", date: "2027-03-10", category: "Examination", month: "03" }
  ],

  smcMembers: [
    { id: "smc-1", name: "[OFFICIAL PRESIDENT NAME]", designation: "President", representation: "Society Representative / Educationist" },
    { id: "smc-2", name: "[PRINCIPAL NAME]", designation: "Member Secretary", representation: "Head of Institution (Principal Ex-Officio)" },
    { id: "smc-3", name: "[TEACHER REPRESENTATIVE]", designation: "Teacher Member", representation: "Senior Secondary Faculty" },
    { id: "smc-4", name: "[PARENT REPRESENTATIVE]", designation: "Parent Member", representation: "Parent of Student in Secondary Wing" },
    { id: "smc-5", name: "[CBSE NOMINEE NAME]", designation: "CBSE / State Nominee", representation: "Education Department Officer" }
  ],

  transferCertificates: [
    { tcNumber: "SSVM/TC/2026/001", admissionNumber: "ADM-2021-104", studentName: "[STUDENT NAME / INITIALS]", classLeft: "Class 10", issueDate: "2026-06-15", reason: "Passed CBSE AISSE Class X", status: "Verified & Issued" },
    { tcNumber: "SSVM/TC/2026/002", admissionNumber: "ADM-2022-218", studentName: "[STUDENT NAME / INITIALS]", classLeft: "Class 8", issueDate: "2026-07-04", reason: "Parent Relocation / Transfer", status: "Verified & Issued" },
    { tcNumber: "SSVM/TC/2026/003", admissionNumber: "ADM-2023-342", studentName: "[STUDENT NAME / INITIALS]", classLeft: "Class 5", issueDate: "2026-07-20", reason: "Parent Request / Relocation", status: "Verified & Issued" }
  ]
};

const SchoolData = {
  STORAGE_KEY: "SSVM_CBSE_DATA_V1",

  get: function() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SCHOOL_DATA, ...parsed };
      }
    } catch (e) {
      console.warn("Using default data.", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SCHOOL_DATA));
  },

  save: function(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event("schoolDataUpdated"));
      return true;
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      return false;
    }
  },

  reset: function() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(new Event("schoolDataUpdated"));
      return true;
    } catch (e) {
      console.error("Failed to reset localStorage", e);
      return false;
    }
  },

  exportJSON: function() {
    const data = this.get();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "SSVM_CBSE_SchoolData_Backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importJSON: function(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.generalInfo || parsed.school_name || parsed.facultyList) {
        this.save({ ...DEFAULT_SCHOOL_DATA, ...parsed });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Invalid JSON file", e);
      return false;
    }
  },

  // Asynchronous API Synchronizer
  syncWithBackend: async function() {
    try {
      const local = this.get();

      // 1. Sync School Info & Principal
      const [schoolRes, principalRes] = await Promise.allSettled([
        fetch('/api/school'),
        fetch('/api/principal')
      ]);

      if (schoolRes.status === 'fulfilled' && schoolRes.value.ok) {
        const json = await schoolRes.value.json();
        if (json.success && json.data) {
          const s = json.data;
          local.generalInfo = {
            ...local.generalInfo,
            schoolName: s.school_name || local.generalInfo.schoolName,
            affiliationNo: s.affiliation_number || local.generalInfo.affiliationNo,
            schoolCode: s.school_code || local.generalInfo.schoolCode,
            address: s.address || local.generalInfo.address,
            pinCode: s.pin_code || local.generalInfo.pinCode,
            email: s.official_email || local.generalInfo.email,
            phone: s.official_phone || local.generalInfo.phone,
            altPhone: s.alt_phone || local.generalInfo.altPhone,
            principalName: s.principal_name || local.generalInfo.principalName,
            principalQualification: s.principal_qualification || local.generalInfo.principalQualification,
            principalMessage: s.principal_message || local.generalInfo.principalMessage,
          };
        }
      }

      if (principalRes.status === 'fulfilled' && principalRes.value.ok) {
        const json = await principalRes.value.json();
        if (json.success && json.data) {
          const p = json.data;
          local.generalInfo.principalName = p.name || local.generalInfo.principalName;
          local.generalInfo.principalQualification = p.qualification || local.generalInfo.principalQualification;
          local.generalInfo.principalMessage = p.message || local.generalInfo.principalMessage;
        }
      }

      // 2. Sync Mandatory Disclosure Documents
      try {
        const docRes = await fetch('/api/mandatory-public-disclosure');
        if (docRes.ok) {
          const json = await docRes.json();
          if (json.success && json.data) {
            if (json.data.documents && Array.isArray(json.data.documents)) {
              local.disclosureDocuments = json.data.documents.map(d => ({
                id: d.id,
                category: d.category,
                name: d.document_name,
                description: d.description,
                status: d.status,
                statusCode: d.status_code,
                issueDate: d.issue_date,
                validityDate: d.validity_date,
                lastUpdated: d.last_updated,
                fileUrl: d.file_url,
                fileType: d.file_type || 'PDF',
                fileSize: d.file_size
              }));
            }
          }
        }
      } catch {}

      // 3. Sync Faculty
      try {
        const staffRes = await fetch('/api/staff');
        if (staffRes.ok) {
          const json = await staffRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            local.facultyList = json.data.map(s => ({
              id: s.id,
              name: s.name,
              designation: s.designation,
              department: s.bio || (s.subject?.includes('Wing') ? s.subject : 'Academic Wing'),
              subject: s.subject || '',
              qualification: s.qualification || '',
              experience: s.experience || '',
              category: s.subject?.includes('Secondary') ? 'Secondary' : (s.subject?.includes('Middle') ? 'Middle' : (s.subject?.includes('Primary') ? 'Primary' : (s.staff_type === 'Principal' ? 'Secondary' : 'Specialized'))),
              staff_type: s.staff_type
            }));
          }
        }
      } catch {}

      // 4. Sync Notices
      try {
        const noticeRes = await fetch('/api/notices');
        if (noticeRes.ok) {
          const json = await noticeRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            local.notices = json.data.map(n => ({
              id: n.id,
              title: n.title,
              category: n.category,
              date: n.notice_date,
              description: n.description,
              isImportant: n.is_important,
              attachment: n.attachment_url || ''
            }));
          }
        }
      } catch {}

      // 5. Sync Fees
      try {
        const feeRes = await fetch('/api/fees');
        if (feeRes.ok) {
          const json = await feeRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            local.feeStructure = json.data.map(f => ({
              classGroup: f.class_group,
              admissionFee: f.admission_fee,
              tuitionFee: f.tuition_fee,
              annualCharges: f.annual_charges,
              otherCharges: f.other_charges
            }));
          }
        }
      } catch {}

      // 6. Sync Academic Calendar
      try {
        const calRes = await fetch('/api/calendar');
        if (calRes.ok) {
          const json = await calRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            local.academicEvents = json.data.map(c => ({
              id: c.id,
              title: c.title,
              date: c.start_date,
              category: c.event_type,
              month: c.start_date ? c.start_date.split('-')[1] : '04'
            }));
          }
        }
      } catch {}

      // 7. Sync SMC
      try {
        const smcRes = await fetch('/api/smc');
        if (smcRes.ok) {
          const json = await smcRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            local.smcMembers = json.data.map(m => ({
              id: m.id,
              name: m.name,
              designation: m.designation,
              representation: m.representation
            }));
          }
        }
      } catch {}

      // 8. Sync Transfer Certificates
      try {
        const tcRes = await fetch('/api/transfer-certificates');
        if (tcRes.ok) {
          const json = await tcRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            local.transferCertificates = json.data.map(t => ({
              id: t.id,
              tcNumber: t.tc_number,
              admissionNumber: t.admission_number,
              studentName: t.student_name,
              classLeft: t.class_left,
              issueDate: t.issue_date,
              reason: t.reason_for_leaving,
              status: t.verification_status
            }));
          }
        }
      } catch {}

      this.save(local);
    } catch (e) {
      console.log('Operating in standalone / local store mode.', e);
    }
  }
};

// Auto-sync with backend on load
document.addEventListener('DOMContentLoaded', () => {
  SchoolData.syncWithBackend().catch(() => {});
});
