/**
 * Logimex International - Form Handler
 * Backend: Google Apps Script → Google Sheets
 * Hosting: Cloudflare Pages
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with columns: timestamp, name, phone, email, purpose, formType
 * 2. Go to Extensions > Apps Script
 * 3. Paste the Apps Script code (provided in comments below)
 * 4. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 5. Copy the Web App URL and paste it in GOOGLE_SCRIPT_URL below
 */

(function() {
    'use strict';

    // =====================================================
    // CONFIGURATION - Update this URL after deploying Apps Script
    // =====================================================
    var GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
    
    // Set to true when Apps Script is deployed and URL is configured
    var IS_BACKEND_READY = false;

    // =====================================================
    // GOOGLE APPS SCRIPT CODE (Deploy this in Google Sheets)
    // =====================================================
    /*
    // Copy this code to your Google Apps Script editor:
    
    function doPost(e) {
        try {
            var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
            var data = JSON.parse(e.postData.contents);
            
            // Append row with form data
            sheet.appendRow([
                new Date().toISOString(),
                data.name || '',
                data.phone || '',
                data.email || '',
                data.purpose || data.message || '',
                data.formType || 'contact'
            ]);
            
            return ContentService
                .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
                .setMimeType(ContentService.MimeType.JSON);
        } catch (error) {
            return ContentService
                .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
                .setMimeType(ContentService.MimeType.JSON);
        }
    }
    
    function doGet(e) {
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'API is running' }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    */

    // =====================================================
    // FORM SUBMISSION HANDLER
    // =====================================================
    
    /**
     * Submit form data to Google Sheets via Apps Script
     * @param {Object} formData - The form data object
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.submitBtn - The submit button element
     * @param {HTMLElement} options.msgDiv - The message display element
     * @param {HTMLFormElement} options.form - The form element
     * @param {string} options.formType - Type of form (contact, inquiry, etc.)
     */
    function submitToGoogleSheets(formData, options) {
        var submitBtn = options.submitBtn;
        var msgDiv = options.msgDiv;
        var form = options.form;
        var formType = options.formType || 'contact';
        
        // Add metadata
        formData.formType = formType;
        formData.timestamp = new Date().toISOString();
        formData.pageUrl = window.location.href;
        
        // Disable button and show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';
        }
        
        // Clear previous messages
        if (msgDiv) {
            msgDiv.innerHTML = '';
        }
        
        // Check if backend is configured
        if (!IS_BACKEND_READY || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
            // Demo mode - simulate submission
            console.log('Form Data (Demo Mode):', formData);
            setTimeout(function() {
                showSuccess(msgDiv, submitBtn, form);
            }, 800);
            return;
        }
        
        // Send data to Google Apps Script
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(function(response) {
            // Note: no-cors mode returns opaque response, so we assume success
            showSuccess(msgDiv, submitBtn, form);
        })
        .catch(function(error) {
            console.error('Form submission error:', error);
            showError(msgDiv, submitBtn, 'Something went wrong. Please try again or contact us directly.');
        });
    }
    
    function showSuccess(msgDiv, submitBtn, form) {
        if (msgDiv) {
            msgDiv.innerHTML = '<div class="alert alert-success">' +
                '<i class="fa fa-check-circle"></i> Thank you! Your message has been received. We will get back to you soon.' +
                '</div>';
        }
        if (form) {
            form.reset();
        }
        resetButton(submitBtn);
    }
    
    function showError(msgDiv, submitBtn, message) {
        if (msgDiv) {
            msgDiv.innerHTML = '<div class="alert alert-danger">' +
                '<i class="fa fa-exclamation-circle"></i> ' + message +
                '</div>';
        }
        resetButton(submitBtn);
    }
    
    function resetButton(submitBtn) {
        if (submitBtn) {
            submitBtn.disabled = false;
            var originalText = submitBtn.getAttribute('data-original-text');
            if (originalText) {
                submitBtn.innerHTML = originalText;
            } else {
                submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Send';
            }
        }
    }

    // =====================================================
    // AUTO-INITIALIZE CONTACT FORM
    // =====================================================
    
    function initContactForm() {
        var form = document.getElementById('contact-form');
        if (!form) return;
        
        var submitBtn = document.getElementById('contact-submit');
        var msgDiv = document.getElementById('contact-message');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var formData = {
                name: (document.getElementById('contact-name') || {}).value || '',
                phone: (document.getElementById('contact-phone') || {}).value || '',
                email: (document.getElementById('contact-email') || {}).value || '',
                purpose: (document.getElementById('contact-purpose') || {}).value || ''
            };
            
            // Trim all values
            for (var key in formData) {
                if (typeof formData[key] === 'string') {
                    formData[key] = formData[key].trim();
                }
            }
            
            submitToGoogleSheets(formData, {
                submitBtn: submitBtn,
                msgDiv: msgDiv,
                form: form,
                formType: 'contact'
            });
        });
    }

    // =====================================================
    // EXPOSE GLOBAL API FOR CUSTOM FORMS
    // =====================================================
    
    window.LogimexForms = {
        submit: submitToGoogleSheets,
        config: {
            setScriptUrl: function(url) {
                GOOGLE_SCRIPT_URL = url;
                IS_BACKEND_READY = true;
            },
            isReady: function() {
                return IS_BACKEND_READY;
            }
        }
    };

    // =====================================================
    // INITIALIZE ON DOM READY
    // =====================================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else {
        initContactForm();
    }

})();
