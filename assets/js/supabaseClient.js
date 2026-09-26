/**
 * Saraswati Shishu Vidya Mandir - Supabase Client SDK (Frontend)
 * 
 * SECURITY NOTICE:
 * This client uses ONLY the Supabase Publishable / Anon Key.
 * The Supabase Secret Key (Service Role Key) is strictly confined to the backend server
 * and is NEVER loaded or exposed in any client-side JavaScript.
 */

(function (global) {
  'use strict';

  const SUPABASE_CONFIG = {
    URL: 'https://zxsbxlhdezriofvtvmhk.supabase.co',
    // Publishable / Anon Key only (Safe for browser client usage with Row Level Security)
    PUBLISHABLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4c2J4bGhkZXpyaW9mdnR2bWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzM3MDQsImV4cCI6MjEwNTg0OTcwNH0.nllpNDPbAgFgs0soILs49iaA9Ly9yqQB_E_1yYuAeIM',
    API_URL: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
      ? 'http://localhost:4000/api'
      : '/api'
  };

  class SupabasePortalClient {
    constructor() {
      this.url = SUPABASE_CONFIG.URL;
      this.publishableKey = SUPABASE_CONFIG.PUBLISHABLE_KEY;
      this.apiUrl = SUPABASE_CONFIG.API_URL;
    }

    /**
     * Fetch public resources via REST API or direct Supabase PostgREST
     */
    async getPublicData(endpoint) {
      try {
        const response = await fetch(`${this.apiUrl}/${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        console.warn(`[SupabaseClient] Failed to load /api/${endpoint}, using cached data:`, err);
        return { success: false, data: [] };
      }
    }

    /**
     * Submit an Admission Enquiry to the database
     */
    async submitAdmissionEnquiry(payload) {
      const response = await fetch(`${this.apiUrl}/admissions/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    }

    /**
     * Submit a Contact Form Enquiry to the database
     */
    async submitContactEnquiry(payload) {
      const response = await fetch(`${this.apiUrl}/contact/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    }

    /**
     * Verify Transfer Certificate (TC) by Number and Admission Number
     */
    async verifyTC(tcNumber, admissionNumber) {
      const response = await fetch(`${this.apiUrl}/transfer-certificates/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tc_number: tcNumber, admission_number: admissionNumber })
      });
      return await response.json();
    }

    /**
     * Get storage asset public URL
     */
    getStorageUrl(bucket, filename) {
      return `${this.url}/storage/v1/object/public/${bucket}/${filename}`;
    }
  }

  global.SupabaseClient = new SupabasePortalClient();
})(window);
