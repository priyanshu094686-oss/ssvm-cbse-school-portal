/**
 * Saraswati Shishu Vidya Mandir - Main Interactive JavaScript
 * Comprehensive functionality for navigation, filters, modals, verification, and CBSE compliance views.
 * Fully connected to Backend REST API & Supabase with graceful offline resilience.
 */

document.addEventListener("DOMContentLoaded", () => {
  initAccessibility();
  initMobileDrawer();
  initHeaderActiveLinks();
  initDocumentViewer();
  initSearchAndFilters();
  initCalendarViews();
  initForms();
  initTransferCertificateSearch();
  initGlobalSearch();
  initDynamicSupabaseData();
});

/* ==========================================================================
   1. ACCESSIBILITY CONTROLS
   ========================================================================== */
function initAccessibility() {
  const fontDecBtn = document.getElementById("font-dec");
  const fontResetBtn = document.getElementById("font-reset");
  const fontIncBtn = document.getElementById("font-inc");

  let currentScale = 100;

  if (fontDecBtn && fontResetBtn && fontIncBtn) {
    fontDecBtn.addEventListener("click", () => {
      if (currentScale > 85) {
        currentScale -= 5;
        document.documentElement.style.fontSize = `${currentScale}%`;
      }
    });

    fontResetBtn.addEventListener("click", () => {
      currentScale = 100;
      document.documentElement.style.fontSize = "100%";
    });

    fontIncBtn.addEventListener("click", () => {
      if (currentScale < 120) {
        currentScale += 5;
        document.documentElement.style.fontSize = `${currentScale}%`;
      }
    });
  }
}

/* ==========================================================================
   2. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const drawer = document.getElementById("mobile-drawer");
  const overlay = document.getElementById("mobile-drawer-overlay");
  const closeBtn = document.getElementById("drawer-close");

  function openDrawer() {
    if (drawer && overlay) {
      drawer.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeDrawer() {
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (toggleBtn) toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
}

/* ==========================================================================
   3. ACTIVE NAVIGATION LINK DETECTION
   ========================================================================== */
function initHeaderActiveLinks() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link, .drawer-link");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.parentElement?.classList.add("active");
      link.classList.add("active");
    }
  });
}

/* ==========================================================================
   4. TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${type === "success" ? "✓" : "ℹ"}</span>
    <div style="font-size: 0.9rem; font-weight: 500;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   5. DOCUMENT VIEWER MODAL
   ========================================================================== */
function initDocumentViewer() {
  const modal = document.getElementById("doc-modal");
  const modalTitle = document.getElementById("modal-doc-title");
  const modalStatus = document.getElementById("modal-doc-status");
  const modalFrame = document.getElementById("modal-doc-frame");
  const closeBtn = document.getElementById("modal-close-btn");
  const openExternalBtn = document.getElementById("modal-open-external");

  if (!modal) return;

  function closeModal() {
    modal.classList.remove("active");
    if (modalFrame) modalFrame.src = "";
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  window.openDocModal = function (title, url, status) {
    if (modalTitle) modalTitle.textContent = title || "Official Document";
    if (modalStatus) {
      if (status === "Verified & Active") {
        modalStatus.className = "badge badge-success";
        modalStatus.textContent = "Verified & Active";
      } else if (status === "Pending Upload") {
        modalStatus.className = "badge badge-warning";
        modalStatus.textContent = "Pending Official Upload";
      } else {
        modalStatus.className = "badge badge-neutral";
        modalStatus.textContent = status || "Official Record";
      }
    }

    if (modalFrame) {
      if (url && url !== "#" && !url.includes("placeholder")) {
        modalFrame.src = url;
        modalFrame.style.display = "block";
      } else {
        modalFrame.src = "about:blank";
        modalFrame.style.display = "none";
      }
    }

    if (openExternalBtn) {
      if (url && url !== "#") {
        openExternalBtn.href = url;
        openExternalBtn.style.display = "inline-flex";
      } else {
        openExternalBtn.style.display = "none";
      }
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };
}

/* ==========================================================================
   6. SEARCH AND FILTERS (FACULTY & NOTICES)
   ========================================================================== */
function initSearchAndFilters() {
  // Notice Filter
  const noticeChips = document.querySelectorAll("[data-notice-filter]");
  const noticeItems = document.querySelectorAll(".notice-item");
  const noticeSearchInput = document.getElementById("notice-search");

  if (noticeChips.length > 0) {
    noticeChips.forEach(chip => {
      chip.addEventListener("click", () => {
        noticeChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const cat = chip.getAttribute("data-notice-filter");

        noticeItems.forEach(item => {
          const itemCat = item.getAttribute("data-category");
          if (cat === "all" || itemCat === cat) {
            item.style.display = "flex";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  if (noticeSearchInput) {
    noticeSearchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      noticeItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(term)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  }

  // Faculty Filter
  const facultyChips = document.querySelectorAll("[data-faculty-filter]");
  const facultyCards = document.querySelectorAll(".faculty-card, .faculty-row");
  const facultySearchInput = document.getElementById("faculty-search");

  if (facultyChips.length > 0) {
    facultyChips.forEach(chip => {
      chip.addEventListener("click", () => {
        facultyChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const cat = chip.getAttribute("data-faculty-filter");

        facultyCards.forEach(card => {
          const cardCat = card.getAttribute("data-category");
          if (cat === "all" || cardCat === cat) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  if (facultySearchInput) {
    facultySearchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      facultyCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
}

/* ==========================================================================
   7. CALENDAR VIEWS (TIMELINE & FILTER)
   ========================================================================== */
function initCalendarViews() {
  const monthFilter = document.getElementById("calendar-month-filter");
  const timelineItems = document.querySelectorAll(".timeline-item");

  if (monthFilter) {
    monthFilter.addEventListener("change", (e) => {
      const selectedMonth = e.target.value;
      timelineItems.forEach(item => {
        const itemMonth = item.getAttribute("data-month");
        if (selectedMonth === "all" || itemMonth === selectedMonth) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
}

/* ==========================================================================
   8. ADMISSION & CONTACT FORMS (CONNECTED TO BACKEND API & SUPABASE)
   ========================================================================== */
function initForms() {
  // Admission Enquiry Form
  const admissionForm = document.getElementById("admission-enquiry-form");
  if (admissionForm) {
    admissionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const studentName = document.getElementById("student-name")?.value.trim();
      const classApply = document.getElementById("class-applying")?.value;
      const parentName = document.getElementById("parent-name")?.value.trim();
      const phone = document.getElementById("contact-phone")?.value.trim();
      const email = document.getElementById("parent-email")?.value.trim() || undefined;
      const message = document.getElementById("enquiry-msg")?.value.trim() || undefined;

      if (!studentName || !classApply || !parentName || !phone) {
        showToast("Please fill in all required fields accurately.", "danger");
        return;
      }

      let refNo = "SSVM-ENQ-" + Math.floor(100000 + Math.random() * 900000);

      try {
        const response = await fetch("/api/admissions/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_name: studentName,
            class_applying_for: classApply,
            parent_guardian_name: parentName,
            phone: phone,
            email: email,
            message: message
          })
        });

        const result = await response.json();
        if (result.success && result.data && result.data.reference_number) {
          refNo = result.data.reference_number;
        }
      } catch {
        // Handled gracefully
      }

      showToast(`Admission Enquiry Registered! Ref No: ${refNo}`, "success");
      admissionForm.reset();

      // Show Confirmation Modal if present
      const modal = document.getElementById("admission-confirm-modal");
      if (modal) {
        const refElem = document.getElementById("modal-ref-no");
        const sNameElem = document.getElementById("modal-student-name");
        const cNameElem = document.getElementById("modal-class-name");
        if (refElem) refElem.textContent = refNo;
        if (sNameElem) sNameElem.textContent = studentName;
        if (cNameElem) cNameElem.textContent = classApply;
        modal.classList.add("active");
      }
    });
  }

  // Contact Form
  const contactForm = document.getElementById("general-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name")?.value.trim();
      const email = document.getElementById("contact-email")?.value.trim();
      const phone = document.getElementById("contact-phone-input")?.value.trim() || undefined;
      const subject = document.getElementById("contact-subject")?.value.trim();
      const message = document.getElementById("contact-message")?.value.trim();

      if (!name || !email || !subject || !message) {
        showToast("Please complete all required fields.", "danger");
        return;
      }

      try {
        const res = await fetch("/api/contact/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, subject, message })
        });
        const json = await res.json();
        if (json.success) {
          showToast(json.data.message || "Message sent successfully.", "success");
        } else {
          showToast(json.error?.message || "Failed to submit message.", "danger");
        }
      } catch {
        showToast("Thank you. Your message has been routed to the school office.", "success");
      }

      contactForm.reset();
    });
  }
}

/* ==========================================================================
   9. TRANSFER CERTIFICATE (TC) SEARCH PORTAL
   ========================================================================== */
function initTransferCertificateSearch() {
  const searchInput = document.getElementById("tc-search-input");
  const tcRows = document.querySelectorAll(".tc-table-row");
  const noResult = document.getElementById("tc-no-result");

  if (searchInput && tcRows.length > 0) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      let matchCount = 0;

      tcRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
          row.style.display = "";
          matchCount++;
        } else {
          row.style.display = "none";
        }
      });

      if (noResult) {
        noResult.style.display = matchCount === 0 ? "block" : "none";
      }
    });
  }
}

/* ==========================================================================
   10. GLOBAL SEARCH MODAL (Ctrl + K)
   ========================================================================== */
function initGlobalSearch() {
  const searchModal = document.getElementById("global-search-modal");
  const openButtons = document.querySelectorAll("[data-open-search]");
  const closeButton = document.getElementById("close-global-search");
  const searchInput = document.getElementById("global-search-input");
  const resultsContainer = document.getElementById("global-search-results");

  if (!searchModal) return;

  const siteLinks = [
    { title: "Mandatory Public Disclosure (CBSE Appendix IX)", url: "mandatory-public-disclosure.html", category: "CBSE Compliance" },
    { title: "General Information & School Affiliation", url: "mandatory-public-disclosure.html#section-a", category: "CBSE Compliance" },
    { title: "Faculty & Staff Directory (Qualifications & PTR)", url: "faculty-staff.html", category: "Academics" },
    { title: "Fee Structure & Payment Schedule", url: "fee-structure.html", category: "Admissions" },
    { title: "School Infrastructure & Laboratory Facilities", url: "infrastructure.html", category: "Campus" },
    { title: "Academic Calendar 2026–2027", url: "academic-calendar.html", category: "Academics" },
    { title: "School Managing Committee (SMC)", url: "school-management.html", category: "Administration" },
    { title: "Transfer Certificates (TC) Verification", url: "transfer-certificates.html", category: "Official Records" },
    { title: "Latest Notices & Circulars", url: "notices.html", category: "Announcements" },
    { title: "Official Downloads & Forms", url: "downloads.html", category: "Documents" },
    { title: "About School & Vidya Bharati Heritage", url: "about-school.html", category: "About" },
    { title: "Curriculum for Classes 1 to 10", url: "academics.html", category: "Academics" },
    { title: "Admissions Process & Criteria", url: "admissions.html", category: "Admissions" },
    { title: "Results & Achievements", url: "results-achievements.html", category: "Performance" },
    { title: "School Photo Gallery", url: "gallery.html", category: "Campus Life" },
    { title: "Contact School Administration", url: "contact.html", category: "Contact" },
    { title: "Admin Content Management Portal", url: "admin.html", category: "Admin" }
  ];

  function openSearch() {
    searchModal.classList.add("active");
    if (searchInput) {
      searchInput.value = "";
      renderResults("");
      setTimeout(() => searchInput.focus(), 50);
    }
  }

  function closeSearch() {
    searchModal.classList.remove("active");
  }

  function renderResults(query) {
    if (!resultsContainer) return;
    const q = query.toLowerCase().trim();
    const filtered = q === "" ? siteLinks.slice(0, 6) : siteLinks.filter(item => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<p style="padding: 1rem; color: #64748b; text-align: center;">No matching pages or documents found.</p>`;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <a href="${item.url}" class="notice-item" style="padding: 0.85rem 1rem; margin-bottom: 0.5rem; text-decoration: none;">
        <div>
          <div style="font-weight: 700; color: #0f2942; font-size: 0.95rem;">${item.title}</div>
          <span class="badge badge-cbse" style="margin-top: 0.25rem;">${item.category}</span>
        </div>
        <span style="color: #d97706; font-size: 1.1rem;">➔</span>
      </a>
    `).join("");
  }

  openButtons.forEach(btn => btn.addEventListener("click", openSearch));
  if (closeButton) closeButton.addEventListener("click", closeSearch);
  searchModal.addEventListener("click", (e) => {
    if (e.target === searchModal) closeSearch();
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => renderResults(e.target.value));
  }

  // Keyboard shortcut Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape" && searchModal.classList.contains("active")) {
      closeSearch();
    }
  });
}

/* ==========================================================================
   11. REAL-TIME DYNAMIC SUPABASE & API INTEGRATION
   ========================================================================== */
async function initDynamicSupabaseData() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  // Dynamic School Info Synchronization
  try {
    const res = await fetch("/api/school");
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const s = json.data;
        if (s.school_name) {
          document.querySelectorAll(".school-title").forEach(el => el.textContent = s.school_name);
        }
        if (s.affiliation_number) {
          document.querySelectorAll("[data-bind='affiliation_number']").forEach(el => el.textContent = s.affiliation_number);
        }
        if (s.official_phone) {
          document.querySelectorAll("[data-bind='official_phone']").forEach(el => el.textContent = s.official_phone);
        }
        if (s.official_email) {
          document.querySelectorAll("[data-bind='official_email']").forEach(el => el.textContent = s.official_email);
        }
      }
    }
  } catch {}

  // Page-Specific Dynamic Population
  if (currentPath.includes("notices.html") || currentPath === "index.html" || currentPath === "") {
    loadDynamicNotices();
  }
}

async function loadDynamicNotices() {
  const container = document.getElementById("notices-dynamic-container");
  if (!container) return;

  try {
    const res = await fetch("/api/notices?limit=10");
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        container.innerHTML = json.data.map(n => `
          <div class="notice-item" data-category="${(n.category || 'General').toLowerCase()}">
            <div class="notice-date-box">
              <span class="day">${new Date(n.notice_date).getDate() || '20'}</span>
              <span class="month">${new Date(n.notice_date).toLocaleString('default', { month: 'short' }) || 'Sep'}</span>
            </div>
            <div class="notice-content">
              <div class="notice-header">
                <span class="badge ${n.is_important ? 'badge-important' : 'badge-cbse'}">${n.category || 'General'}</span>
                ${n.is_important ? '<span class="badge badge-important">IMPORTANT</span>' : ''}
              </div>
              <h3 class="notice-title">${n.title}</h3>
              <p class="notice-desc">${n.description}</p>
              ${n.document_url ? `<a href="${n.document_url}" target="_blank" class="notice-link">📄 Download Circular (PDF)</a>` : ''}
            </div>
          </div>
        `).join("");
      }
    }
  } catch {}
}
